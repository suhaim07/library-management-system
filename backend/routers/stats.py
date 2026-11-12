from fastapi import APIRouter
from database import get_db
from models import DashboardStats
from datetime import date, datetime

router = APIRouter(prefix="/api/stats", tags=["Dashboard Statistics"])

@router.get("/dashboard")
def get_dashboard_stats():
    with get_db() as conn:
        cursor = conn.cursor()

        # Book counts
        cursor.execute("SELECT COUNT(*), COALESCE(SUM(total_copies), 0), COALESCE(SUM(available_copies), 0) FROM books")
        total_books, total_copies, available_copies = cursor.fetchone()
        borrowed_copies = total_copies - available_copies

        # Member counts
        cursor.execute("SELECT COUNT(*) FROM members")
        total_members = cursor.fetchone()[0]

        # Loan counts
        today_str = date.today().isoformat()
        cursor.execute("SELECT COUNT(*) FROM loans WHERE status = 'active' AND due_date >= ?", (today_str,))
        active_loans = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM loans WHERE status = 'overdue' OR (status = 'active' AND due_date < ?)", (today_str,))
        overdue_loans = cursor.fetchone()[0]

        # Fines
        cursor.execute("SELECT COALESCE(SUM(fine_amount), 0.0) FROM loans WHERE status IN ('overdue', 'active') AND fine_paid = 0")
        fines_due = float(cursor.fetchone()[0])

        cursor.execute("SELECT COALESCE(SUM(fine_amount), 0.0) FROM loans WHERE fine_paid = 1")
        fines_collected = float(cursor.fetchone()[0])

        # Genre distribution
        cursor.execute("""
        SELECT genre, COUNT(*) as count 
        FROM books 
        GROUP BY genre 
        ORDER BY count DESC 
        LIMIT 6
        """)
        genre_dist = [{"genre": r["genre"], "count": r["count"]} for r in cursor.fetchall()]

        # Recent activities (last 5 loans/returns)
        cursor.execute("""
        SELECT l.id, l.status, l.loan_date, l.due_date, l.return_date, 
               b.title as book_title, m.name as member_name
        FROM loans l
        JOIN books b ON l.book_id = b.id
        JOIN members m ON l.member_id = m.id
        ORDER BY l.id DESC
        LIMIT 6
        """)
        recent_activity = [dict(r) for r in cursor.fetchall()]

        return {
            "total_books": total_books,
            "total_copies": total_copies,
            "available_copies": available_copies,
            "borrowed_copies": borrowed_copies,
            "total_members": total_members,
            "active_loans": active_loans,
            "overdue_loans": overdue_loans,
            "total_fines_due": fines_due,
            "total_fines_collected": fines_collected,
            "genre_distribution": genre_dist,
            "recent_activity": recent_activity
        }

