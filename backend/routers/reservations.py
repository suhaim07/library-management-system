from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from datetime import date
from database import get_db
from models import ReservationCreate, ReservationResponse

router = APIRouter(prefix="/api/reservations", tags=["Reservations"])

@router.get("", response_model=List[ReservationResponse])
def get_reservations(status_filter: Optional[str] = Query(None, alias="status")):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
        SELECT r.*, b.title as book_title, m.name as member_name
        FROM reservations r
        JOIN books b ON r.book_id = b.id
        JOIN members m ON r.member_id = m.id
        WHERE 1=1
        """
        params = []
        if status_filter and status_filter != "all":
            query += " AND r.status = ?"
            params.append(status_filter)

        query += " ORDER BY r.id DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

@router.post("", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
def create_reservation(res_in: ReservationCreate):
    with get_db() as conn:
        cursor = conn.cursor()

        # Check book exists
        cursor.execute("SELECT id, title, available_copies FROM books WHERE id = ?", (res_in.book_id,))
        book = cursor.fetchone()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")

        # Check member exists
        cursor.execute("SELECT id, name, status FROM members WHERE id = ?", (res_in.member_id,))
        member = cursor.fetchone()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        if member["status"] != "Active":
            raise HTTPException(status_code=400, detail="Only active members can place reservations")

        # Check existing active reservation for same book & member
        cursor.execute("""
        SELECT id FROM reservations WHERE book_id = ? AND member_id = ? AND status = 'pending'
        """, (res_in.book_id, res_in.member_id))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Member already has a pending reservation for this book")

        today_str = date.today().isoformat()
        cursor.execute("""
        INSERT INTO reservations (book_id, member_id, reservation_date, status, notification_sent)
        VALUES (?, ?, ?, 'pending', 0)
        """, (res_in.book_id, res_in.member_id, today_str))

        res_id = cursor.lastrowid
        cursor.execute("""
        SELECT r.*, b.title as book_title, m.name as member_name
        FROM reservations r
        JOIN books b ON r.book_id = b.id
        JOIN members m ON r.member_id = m.id
        WHERE r.id = ?
        """, (res_id,))
        return dict(cursor.fetchone())

@router.post("/{reservation_id}/cancel")
def cancel_reservation(reservation_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE reservations SET status = 'cancelled' WHERE id = ?", (reservation_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Reservation not found")
        return {"message": "Reservation cancelled successfully", "id": reservation_id}

@router.post("/{reservation_id}/fulfill")
def fulfill_reservation(reservation_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE reservations SET status = 'fulfilled' WHERE id = ?", (reservation_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Reservation not found")
        return {"message": "Reservation fulfilled successfully", "id": reservation_id}

