from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import BookCreate, BookUpdate, BookResponse

router = APIRouter(prefix="/api/books", tags=["Books"])

@router.get("", response_model=List[BookResponse])
def get_books(
    search: Optional[str] = Query(None, description="Search by title, author, or ISBN"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    available_only: Optional[bool] = Query(False, description="Filter by availability"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM books WHERE 1=1"
        params = []

        if search:
            search_param = f"%{search.strip()}%"
            query += " AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)"
            params.extend([search_param, search_param, search_param])

        if genre and genre != "All":
            query += " AND genre = ?"
            params.append(genre)

        if available_only:
            query += " AND available_copies > 0"

        query += " ORDER BY id DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

@router.get("/genres/list")
def get_genres():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL AND genre != '' ORDER BY genre ASC")
        rows = cursor.fetchall()
        return [row["genre"] for row in rows]

@router.get("/{book_id}", response_model=BookResponse)
def get_book(book_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Book not found")
        return dict(row)

@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(book_in: BookCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM books WHERE isbn = ?", (book_in.isbn,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="A book with this ISBN already exists")

        now_str = datetime.now().isoformat()
        cursor.execute("""
        INSERT INTO books (isbn, title, author, genre, publisher, publish_year, total_copies, available_copies, shelf_location, cover_image, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            book_in.isbn, book_in.title, book_in.author, book_in.genre,
            book_in.publisher, book_in.publish_year, book_in.total_copies,
            book_in.total_copies, book_in.shelf_location, book_in.cover_image,
            book_in.description, now_str
        ))
        book_id = cursor.lastrowid
        cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
        return dict(cursor.fetchone())

@router.put("/{book_id}", response_model=BookResponse)
def update_book(book_id: int, book_in: BookUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Book not found")

        current = dict(existing)
        updates = book_in.model_dump(exclude_unset=True)

        # Handle total_copies adjustment vs available_copies
        if "total_copies" in updates:
            new_total = updates["total_copies"]
            borrowed = current["total_copies"] - current["available_copies"]
            if new_total < borrowed:
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot reduce total copies below currently borrowed count ({borrowed})"
                )
            updates["available_copies"] = new_total - borrowed

        if not updates:
            return current

        set_clauses = ", ".join([f"{k} = ?" for k in updates.keys()])
        values = list(updates.values()) + [book_id]

        cursor.execute(f"UPDATE books SET {set_clauses} WHERE id = ?", values)
        cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
        return dict(cursor.fetchone())

@router.delete("/{book_id}")
def delete_book(book_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        # Check active loans
        cursor.execute("SELECT COUNT(*) FROM loans WHERE book_id = ? AND status IN ('active', 'overdue')", (book_id,))
        active_loans = cursor.fetchone()[0]
        if active_loans > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete book with {active_loans} active or overdue loan(s). Please return all copies first."
            )

        cursor.execute("DELETE FROM books WHERE id = ?", (book_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Book not found")
        return {"message": "Book deleted successfully", "id": book_id}

