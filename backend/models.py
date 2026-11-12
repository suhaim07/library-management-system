from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# --- Auth Schemas ---
class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    email: str
    role: str = "librarian"

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Book Schemas ---
class BookBase(BaseModel):
    isbn: str
    title: str
    author: str
    genre: str
    publisher: Optional[str] = None
    publish_year: Optional[int] = None
    total_copies: int = 1
    shelf_location: Optional[str] = "Main Stacks"
    cover_image: Optional[str] = None
    description: Optional[str] = None

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    isbn: Optional[str] = None
    title: Optional[str] = None
    author: Optional[str] = None
    genre: Optional[str] = None
    publisher: Optional[str] = None
    publish_year: Optional[int] = None
    total_copies: Optional[int] = None
    shelf_location: Optional[str] = None
    cover_image: Optional[str] = None
    description: Optional[str] = None

class BookResponse(BookBase):
    id: int
    available_copies: int
    created_at: str

# --- Member Schemas ---
class MemberBase(BaseModel):
    member_code: str
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    membership_type: str = "Standard"
    status: str = "Active"
    max_borrow_limit: int = 5

class MemberCreate(BaseModel):
    member_code: Optional[str] = None  # auto-generated if omitted
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    membership_type: str = "Standard"
    max_borrow_limit: int = 5

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    membership_type: Optional[str] = None
    status: Optional[str] = None
    max_borrow_limit: Optional[int] = None

class MemberResponse(MemberBase):
    id: int
    created_at: str
    active_loans_count: Optional[int] = 0

# --- Loan Schemas ---
class LoanCreate(BaseModel):
    book_id: int
    member_id: int
    due_days: int = 14
    notes: Optional[str] = None

class LoanReturn(BaseModel):
    fine_paid: bool = True
    notes: Optional[str] = None

class LoanExtend(BaseModel):
    additional_days: int = 7

class LoanResponse(BaseModel):
    id: int
    book_id: int
    book_title: Optional[str] = None
    book_author: Optional[str] = None
    book_isbn: Optional[str] = None
    member_id: int
    member_name: Optional[str] = None
    member_code: Optional[str] = None
    member_email: Optional[str] = None
    loan_date: str
    due_date: str
    return_date: Optional[str] = None
    status: str
    fine_amount: float
    fine_paid: int
    notes: Optional[str] = None
    days_overdue: Optional[int] = 0

# --- Reservation Schemas ---
class ReservationCreate(BaseModel):
    book_id: int
    member_id: int

class ReservationResponse(BaseModel):
    id: int
    book_id: int
    book_title: Optional[str] = None
    member_id: int
    member_name: Optional[str] = None
    reservation_date: str
    status: str
    notification_sent: int

# --- Stats & Activity Schemas ---
class DashboardStats(BaseModel):
    total_books: int
    total_copies: int
    available_copies: int
    borrowed_copies: int
    total_members: int
    active_loans: int
    overdue_loans: int
    total_fines_due: float
    total_fines_collected: float
    genre_distribution: List[dict]
    monthly_loans: List[dict]
