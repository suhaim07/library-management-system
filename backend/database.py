import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(__file__), "library.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Users table (for authentication)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL DEFAULT 'librarian', -- 'admin', 'librarian', 'member'
            created_at TEXT NOT NULL
        );
        """)

        # 2. Members table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            address TEXT,
            membership_type TEXT NOT NULL DEFAULT 'Standard', -- 'Student', 'Faculty', 'Premium', 'Standard'
            status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Suspended', 'Expired'
            max_borrow_limit INTEGER DEFAULT 5,
            created_at TEXT NOT NULL
        );
        """)

        # 3. Books table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            isbn TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            genre TEXT NOT NULL,
            publisher TEXT,
            publish_year INTEGER,
            total_copies INTEGER NOT NULL DEFAULT 1,
            available_copies INTEGER NOT NULL DEFAULT 1,
            shelf_location TEXT,
            cover_image TEXT,
            description TEXT,
            created_at TEXT NOT NULL
        );
        """)

        # 4. Loans table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
            member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
            loan_date TEXT NOT NULL,
            due_date TEXT NOT NULL,
            return_date TEXT,
            status TEXT NOT NULL DEFAULT 'active', -- 'active', 'returned', 'overdue'
            fine_amount REAL DEFAULT 0.0,
            fine_paid INTEGER DEFAULT 0,
            notes TEXT
        );
        """)

        # 5. Reservations table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
            member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
            reservation_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'fulfilled', 'cancelled'
            notification_sent INTEGER DEFAULT 0
        );
        """)

        # Indexes for fast querying
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_members_code ON members(member_code);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_loans_book ON loans(book_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_loans_member ON loans(member_id);")

