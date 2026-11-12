from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime, timedelta, date
from database import get_db
from models import LoanCreate, LoanReturn, LoanExtend, LoanResponse

router = APIRouter(prefix="/api/loans", tags=["Loans & Circulation"])

DAILY_FINE_RATE = 0.50  # $0.50 per day overdue

def calculate_overdue_days_and_fine(due_date_str: str, return_date_str: Optional[str] = None) -> tuple[int, float]:
    try:
        due_d = datetime.strptime(due_date_str[:10], "%Y-%m-%d").date()
        ref_d = datetime.strptime(return_date_str[:10], "%Y-%m-%d").date() if return_date_str else date.today()
        if ref_d > due_d:
            overdue_days = (ref_d - due_d).days
            fine = round(overdue_days * DAILY_FINE_RATE, 2)
            return overdue_days, fine
    except Exception:
        pass
    return 0, 0.0

@router.get("", response_model=List[LoanResponse])
def get_loans(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
        SELECT l.*, 
               b.title as book_title, b.author as book_author, b.isbn as book_isbn,
               m.name as member_name, m.member_code as member_code, m.email as member_email
        FROM loans l
        JOIN books b ON l.book_id = b.id
        JOIN members m ON l.member_id = m.id
        WHERE 1=1
        """
        params = []

        if search:
            s = f"%{search.strip()}%"
            query += " AND (b.title LIKE ? OR m.name LIKE ? OR m.member_code LIKE ? OR b.isbn LIKE ?)"
            params.extend([s, s, s, s])

        if status_filter and status_filter != "all":
            if status_filter == "overdue":
                query += " AND l.status IN ('overdue', 'active') AND l.due_date < date('now')"
            else:
                query += " AND l.status = ?"
                params.append(status_filter)

        query += " ORDER BY l.id DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        results = []
        for r in rows:
            row_dict = dict(r)
            # Recompute overdue dynamically if active
            if row_dict["status"] in ("active", "overdue"):
                overdue_days, fine = calculate_overdue_days_and_fine(row_dict["due_date"])
                if overdue_days > 0:
                    row_dict["days_overdue"] = overdue_days
                    row_dict["fine_amount"] = fine
                    row_dict["status"] = "overdue"
            results.append(row_dict)
            
        return results

@router.post("", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
def issue_book(loan_in: LoanCreate):
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Check book exists and has copies
        cursor.execute("SELECT id, title, available_copies FROM books WHERE id = ?", (loan_in.book_id,))
        book = cursor.fetchone()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        if book["available_copies"] <= 0:
            raise HTTPException(status_code=400, detail=f"No copies available for '{book['title']}'")

        # 2. Check member exists and is active
        cursor.execute("SELECT id, name, status, max_borrow_limit FROM members WHERE id = ?", (loan_in.member_id,))
        member = cursor.fetchone()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        if member["status"] != "Active":
            raise HTTPException(status_code=400, detail=f"Member '{member['name']}' is currently '{member['status']}'")

        # 3. Check active loan limit
        cursor.execute("""
        SELECT COUNT(*) FROM loans WHERE member_id = ? AND status IN ('active', 'overdue')
        """, (loan_in.member_id,))
        current_active = cursor.fetchone()[0]
        if current_active >= member["max_borrow_limit"]:
            raise HTTPException(
                status_code=400,
                detail=f"Member has reached their limit of {member['max_borrow_limit']} borrowed books"
            )

        # 4. Check if member already has an active copy of this exact book
        cursor.execute("""
        SELECT id FROM loans WHERE member_id = ? AND book_id = ? AND status IN ('active', 'overdue')
        """, (loan_in.member_id, loan_in.book_id))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Member already has an active loan for this book")

        # 5. Issue loan
        today = date.today()
        due = today + timedelta(days=loan_in.due_days)
        cursor.execute("""
        INSERT INTO loans (book_id, member_id, loan_date, due_date, status, fine_amount, fine_paid, notes)
        VALUES (?, ?, ?, ?, 'active', 0.0, 0, ?)
        """, (loan_in.book_id, loan_in.member_id, today.isoformat(), due.isoformat(), loan_in.notes))
        loan_id = cursor.lastrowid

        # 6. Decrement available copies
        cursor.execute("""
        UPDATE books SET available_copies = available_copies - 1 WHERE id = ?
        """, (loan_in.book_id,))

        # 7. Fetch full loan details
        cursor.execute("""
        SELECT l.*, 
               b.title as book_title, b.author as book_author, b.isbn as book_isbn,
               m.name as member_name, m.member_code as member_code, m.email as member_email
        FROM loans l
        JOIN books b ON l.book_id = b.id
        JOIN members m ON l.member_id = m.id
        WHERE l.id = ?
        """, (loan_id,))
        return dict(cursor.fetchone())

@router.post("/{loan_id}/return", response_model=LoanResponse)
def return_book(loan_id: int, return_in: LoanReturn):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM loans WHERE id = ?", (loan_id,))
        loan = cursor.fetchone()
        if not loan:
            raise HTTPException(status_code=404, detail="Loan not found")
        if loan["status"] == "returned":
            raise HTTPException(status_code=400, detail="This loan is already returned")

        today_str = date.today().isoformat()
        overdue_days, fine = calculate_overdue_days_and_fine(loan["due_date"])
        fine_paid = 1 if (fine == 0.0 or return_in.fine_paid) else 0

        notes = loan["notes"] or ""
        if return_in.notes:
            notes = f"{notes} | Return note: {return_in.notes}".strip(" |")

        # Update loan
        cursor.execute("""
        UPDATE loans 
        SET status = 'returned', return_date = ?, fine_amount = ?, fine_paid = ?, notes = ?
        WHERE id = ?
        """, (today_str, fine, fine_paid, notes, loan_id))

        # Restore book copy
        cursor.execute("""
        UPDATE books SET available_copies = available_copies + 1 WHERE id = ?
        """, (loan["book_id"],))

        cursor.execute("""
        SELECT l.*, 
               b.title as book_title, b.author as book_author, b.isbn as book_isbn,
               m.name as member_name, m.member_code as member_code, m.email as member_email
        FROM loans l
        JOIN books b ON l.book_id = b.id
        JOIN members m ON l.member_id = m.id
        WHERE l.id = ?
        """, (loan_id,))
        return dict(cursor.fetchone())

@router.post("/{loan_id}/extend", response_model=LoanResponse)
def extend_loan(loan_id: int, extend_in: LoanExtend):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM loans WHERE id = ?", (loan_id,))
        loan = cursor.fetchone()
        if not loan:
            raise HTTPException(status_code=404, detail="Loan not found")
        if loan["status"] == "returned":
            raise HTTPException(status_code=400, detail="Cannot extend an already returned loan")

        current_due = datetime.strptime(loan["due_date"][:10], "%Y-%m-%d").date()
        new_due = current_due + timedelta(days=extend_in.additional_days)

        new_status = "active" if new_due >= date.today() else "overdue"

        cursor.execute("""
        UPDATE loans SET due_date = ?, status = ? WHERE id = ?
        """, (new_due.isoformat(), new_status, loan_id))

        cursor.execute("""
        SELECT l.*, 
               b.title as book_title, b.author as book_author, b.isbn as book_isbn,
               m.name as member_name, m.member_code as member_code, m.email as member_email
        FROM loans l
        JOIN books b ON l.book_id = b.id
        JOIN members m ON l.member_id = m.id
        WHERE l.id = ?
        """, (loan_id,))
        return dict(cursor.fetchone())

