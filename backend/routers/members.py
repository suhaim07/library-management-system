from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import MemberCreate, MemberUpdate, MemberResponse

router = APIRouter(prefix="/api/members", tags=["Members"])

@router.get("", response_model=List[MemberResponse])
def get_members(
    search: Optional[str] = Query(None, description="Search by name, email, or member code"),
    status_filter: Optional[str] = Query(None, alias="status"),
    membership_type: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
        SELECT m.*, 
               (SELECT COUNT(*) FROM loans l WHERE l.member_id = m.id AND l.status IN ('active', 'overdue')) as active_loans_count
        FROM members m
        WHERE 1=1
        """
        params = []

        if search:
            s = f"%{search.strip()}%"
            query += " AND (m.name LIKE ? OR m.email LIKE ? OR m.member_code LIKE ?)"
            params.extend([s, s, s])

        if status_filter and status_filter != "All":
            query += " AND m.status = ?"
            params.append(status_filter)

        if membership_type and membership_type != "All":
            query += " AND m.membership_type = ?"
            params.append(membership_type)

        query += " ORDER BY m.id DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

@router.get("/{member_id}")
def get_member(member_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT m.*, 
               (SELECT COUNT(*) FROM loans l WHERE l.member_id = m.id AND l.status IN ('active', 'overdue')) as active_loans_count
        FROM members m WHERE m.id = ?
        """, (member_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Member not found")
        
        member_data = dict(row)

        # Get their loans
        cursor.execute("""
        SELECT l.*, b.title as book_title, b.author as book_author, b.isbn as book_isbn
        FROM loans l
        JOIN books b ON l.book_id = b.id
        WHERE l.member_id = ?
        ORDER BY l.id DESC
        """, (member_id,))
        member_data["loans"] = [dict(r) for r in cursor.fetchall()]

        return member_data

@router.post("", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(member_in: MemberCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check email uniqueness
        cursor.execute("SELECT id FROM members WHERE email = ?", (member_in.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="A member with this email already exists")

        # Generate member_code if not supplied
        code = member_in.member_code
        if not code:
            cursor.execute("SELECT MAX(id) FROM members")
            max_id = cursor.fetchone()[0] or 0
            code = f"MEM-{1000 + max_id + 1}"
        else:
            cursor.execute("SELECT id FROM members WHERE member_code = ?", (code,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Member code already exists")

        now_str = datetime.now().isoformat()
        cursor.execute("""
        INSERT INTO members (member_code, name, email, phone, address, membership_type, status, max_borrow_limit, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'Active', ?, ?)
        """, (
            code, member_in.name, member_in.email, member_in.phone,
            member_in.address, member_in.membership_type,
            member_in.max_borrow_limit, now_str
        ))
        
        new_id = cursor.lastrowid
        cursor.execute("""
        SELECT m.*, 0 as active_loans_count FROM members m WHERE m.id = ?
        """, (new_id,))
        return dict(cursor.fetchone())

@router.put("/{member_id}", response_model=MemberResponse)
def update_member(member_id: int, member_in: MemberUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM members WHERE id = ?", (member_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Member not found")

        updates = member_in.model_dump(exclude_unset=True)
        if not updates:
            cursor.execute("""
            SELECT m.*, 
                   (SELECT COUNT(*) FROM loans l WHERE l.member_id = m.id AND l.status IN ('active', 'overdue')) as active_loans_count
            FROM members m WHERE m.id = ?
            """, (member_id,))
            return dict(cursor.fetchone())

        set_clauses = ", ".join([f"{k} = ?" for k in updates.keys()])
        values = list(updates.values()) + [member_id]

        cursor.execute(f"UPDATE members SET {set_clauses} WHERE id = ?", values)
        cursor.execute("""
        SELECT m.*, 
               (SELECT COUNT(*) FROM loans l WHERE l.member_id = m.id AND l.status IN ('active', 'overdue')) as active_loans_count
        FROM members m WHERE m.id = ?
        """, (member_id,))
        return dict(cursor.fetchone())

@router.delete("/{member_id}")
def delete_member(member_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM loans WHERE member_id = ? AND status IN ('active', 'overdue')", (member_id,))
        active_loans = cursor.fetchone()[0]
        if active_loans > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete member with {active_loans} active loan(s). Please ensure books are returned first."
            )

        cursor.execute("DELETE FROM members WHERE id = ?", (member_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Member not found")
        return {"message": "Member removed successfully", "id": member_id}

