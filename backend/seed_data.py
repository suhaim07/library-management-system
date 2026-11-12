from datetime import datetime, timedelta
from database import get_db
from auth import hash_password

SAMPLE_BOOKS = [
    {
        "isbn": "978-0132350884",
        "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
        "author": "Robert C. Martin",
        "genre": "Computer Science",
        "publisher": "Prentice Hall",
        "publish_year": 2008,
        "total_copies": 5,
        "available_copies": 4,
        "shelf_location": "Rack CS-01",
        "cover_image": "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600",
        "description": "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees."
    },
    {
        "isbn": "978-1449373320",
        "title": "Designing Data-Intensive Applications",
        "author": "Martin Kleppmann",
        "genre": "Computer Science",
        "publisher": "O'Reilly Media",
        "publish_year": 2017,
        "total_copies": 4,
        "available_copies": 3,
        "shelf_location": "Rack CS-02",
        "cover_image": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600",
        "description": "The definitive guide to the architecture of modern data systems, storage engines, distributed consensus, and stream processing."
    },
    {
        "isbn": "978-0061120084",
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "genre": "Classic Literature",
        "publisher": "Harper Perennial",
        "publish_year": 1960,
        "total_copies": 6,
        "available_copies": 6,
        "shelf_location": "Rack LIT-04",
        "cover_image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
        "description": "A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice."
    },
    {
        "isbn": "978-0451524935",
        "title": "1984",
        "author": "George Orwell",
        "genre": "Dystopian Fiction",
        "publisher": "Signet Classic",
        "publish_year": 1949,
        "total_copies": 7,
        "available_copies": 6,
        "shelf_location": "Rack LIT-01",
        "cover_image": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
        "description": "The dystopian social science fiction novel and cautionary tale about ubiquitous government surveillance."
    },
    {
        "isbn": "978-0062316097",
        "title": "Sapiens: A Brief History of Humankind",
        "author": "Yuval Noah Harari",
        "genre": "History",
        "publisher": "Harper",
        "publish_year": 2015,
        "total_copies": 4,
        "available_copies": 3,
        "shelf_location": "Rack HIST-03",
        "cover_image": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=600",
        "description": "Explores how an insignificant ape became the ruler of planet Earth, capable of splitting the atom and journeying to the moon."
    },
    {
        "isbn": "978-0374533557",
        "title": "Thinking, Fast and Slow",
        "author": "Daniel Kahneman",
        "genre": "Psychology",
        "publisher": "Farrar, Straus and Giroux",
        "publish_year": 2011,
        "total_copies": 3,
        "available_copies": 2,
        "shelf_location": "Rack PSY-02",
        "cover_image": "https://images.unsplash.com/photo-1507842229451-7f01be45c06b?auto=format&fit=crop&q=80&w=600",
        "description": "The renowned psychologist explains the two systems that drive the way we think: fast intuitive thinking, and slow deliberative thinking."
    },
    {
        "isbn": "978-0735211292",
        "title": "Atomic Habits",
        "author": "James Clear",
        "genre": "Self-Help",
        "publisher": "Avery",
        "publish_year": 2018,
        "total_copies": 8,
        "available_copies": 7,
        "shelf_location": "Rack SH-01",
        "cover_image": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
        "description": "No matter your goals, Atomic Habits offers a proven framework for improving every day."
    },
    {
        "isbn": "978-0553380163",
        "title": "A Brief History of Time",
        "author": "Stephen Hawking",
        "genre": "Astrophysics",
        "publisher": "Bantam",
        "publish_year": 1988,
        "total_copies": 4,
        "available_copies": 4,
        "shelf_location": "Rack SCI-05",
        "cover_image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
        "description": "A landmark volume in science writing by one of the great minds of our time, exploring black holes and the origins of space."
    },
    {
        "isbn": "978-0441013593",
        "title": "Dune",
        "author": "Frank Herbert",
        "genre": "Sci-Fi",
        "publisher": "Ace Books",
        "publish_year": 1965,
        "total_copies": 5,
        "available_copies": 4,
        "shelf_location": "Rack SF-02",
        "cover_image": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600",
        "description": "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world."
    },
    {
        "isbn": "978-0593135204",
        "title": "Project Hail Mary",
        "author": "Andy Weir",
        "genre": "Sci-Fi",
        "publisher": "Ballantine Books",
        "publish_year": 2021,
        "total_copies": 5,
        "available_copies": 5,
        "shelf_location": "Rack SF-03",
        "cover_image": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=600",
        "description": "A lone astronaut must save the earth from disaster in this incredible new science-based adventure."
    },
    {
        "isbn": "978-0857197689",
        "title": "The Psychology of Money",
        "author": "Morgan Housel",
        "genre": "Finance",
        "publisher": "Harriman House",
        "publish_year": 2020,
        "total_copies": 6,
        "available_copies": 6,
        "shelf_location": "Rack FIN-01",
        "cover_image": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600",
        "description": "Timeless lessons on wealth, greed, and happiness doing well with money isn't necessarily about what you know."
    },
    {
        "isbn": "978-0135957059",
        "title": "The Pragmatic Programmer: 20th Anniversary Edition",
        "author": "David Thomas, Andrew Hunt",
        "genre": "Computer Science",
        "publisher": "Addison-Wesley",
        "publish_year": 2019,
        "total_copies": 4,
        "available_copies": 4,
        "shelf_location": "Rack CS-03",
        "cover_image": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600",
        "description": "Illustrates the best approaches and major pitfalls of modern software development."
    }
]

SAMPLE_MEMBERS = [
    {
        "member_code": "MEM-1001",
        "name": "Sarah Connor",
        "email": "sarah.connor@example.com",
        "phone": "+1 (555) 234-5678",
        "address": "742 Evergreen Terrace, Springfield",
        "membership_type": "Faculty",
        "status": "Active",
        "max_borrow_limit": 10
    },
    {
        "member_code": "MEM-1002",
        "name": "Alex Mercer",
        "email": "alex.mercer@example.com",
        "phone": "+1 (555) 876-5432",
        "address": "1204 Elm St, Metropolis",
        "membership_type": "Student",
        "status": "Active",
        "max_borrow_limit": 5
    },
    {
        "member_code": "MEM-1003",
        "name": "Diana Prince",
        "email": "diana.prince@example.com",
        "phone": "+1 (555) 345-6789",
        "address": "350 5th Ave, New York",
        "membership_type": "Premium",
        "status": "Active",
        "max_borrow_limit": 8
    },
    {
        "member_code": "MEM-1004",
        "name": "Bruce Wayne",
        "email": "bruce.wayne@example.com",
        "phone": "+1 (555) 999-0000",
        "address": "1007 Mountain Drive, Gotham",
        "membership_type": "Faculty",
        "status": "Active",
        "max_borrow_limit": 15
    },
    {
        "member_code": "MEM-1005",
        "name": "Peter Parker",
        "email": "peter.parker@example.com",
        "phone": "+1 (555) 123-4567",
        "address": "20 Ingram St, Queens",
        "membership_type": "Student",
        "status": "Active",
        "max_borrow_limit": 5
    }
]

def seed_database():
    now_str = datetime.now().isoformat()
    today = datetime.now()

    with get_db() as conn:
        cursor = conn.cursor()

        # Check if users exist
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            # Seed Admin and Librarian
            pwd_hash, salt = hash_password("admin123")
            cursor.execute("""
            INSERT INTO users (username, password_hash, salt, full_name, email, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, ("admin", pwd_hash, salt, "Chief Librarian", "admin@library.org", "admin", now_str))

            pwd_hash_lib, salt_lib = hash_password("lib123")
            cursor.execute("""
            INSERT INTO users (username, password_hash, salt, full_name, email, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, ("librarian", pwd_hash_lib, salt_lib, "Staff Librarian", "staff@library.org", "librarian", now_str))

        # Check if books exist
        cursor.execute("SELECT COUNT(*) FROM books")
        if cursor.fetchone()[0] == 0:
            for b in SAMPLE_BOOKS:
                cursor.execute("""
                INSERT INTO books (isbn, title, author, genre, publisher, publish_year, total_copies, available_copies, shelf_location, cover_image, description, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    b["isbn"], b["title"], b["author"], b["genre"], b["publisher"],
                    b["publish_year"], b["total_copies"], b["available_copies"],
                    b["shelf_location"], b["cover_image"], b["description"], now_str
                ))

        # Check if members exist
        cursor.execute("SELECT COUNT(*) FROM members")
        if cursor.fetchone()[0] == 0:
            for m in SAMPLE_MEMBERS:
                cursor.execute("""
                INSERT INTO members (member_code, name, email, phone, address, membership_type, status, max_borrow_limit, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    m["member_code"], m["name"], m["email"], m["phone"],
                    m["address"], m["membership_type"], m["status"],
                    m["max_borrow_limit"], now_str
                ))

        # Check if loans exist
        cursor.execute("SELECT COUNT(*) FROM loans")
        if cursor.fetchone()[0] == 0:
            # 1. Clean Code borrowed by Sarah Connor (Active, due in 5 days)
            loan_date_1 = (today - timedelta(days=9)).strftime("%Y-%m-%d")
            due_date_1 = (today + timedelta(days=5)).strftime("%Y-%m-%d")
            cursor.execute("""
            INSERT INTO loans (book_id, member_id, loan_date, due_date, status, fine_amount, fine_paid, notes)
            VALUES (1, 1, ?, ?, 'active', 0.0, 0, 'Standard loan for coursework')
            """, (loan_date_1, due_date_1))

            # 2. Designing Data-Intensive Applications borrowed by Alex Mercer (Active, due in 2 days)
            loan_date_2 = (today - timedelta(days=12)).strftime("%Y-%m-%d")
            due_date_2 = (today + timedelta(days=2)).strftime("%Y-%m-%d")
            cursor.execute("""
            INSERT INTO loans (book_id, member_id, loan_date, due_date, status, fine_amount, fine_paid, notes)
            VALUES (2, 2, ?, ?, 'active', 0.0, 0, 'Database research')
            """, (loan_date_2, due_date_2))

            # 3. 1984 borrowed by Diana Prince (Overdue by 4 days, $2.00 fine)
            loan_date_3 = (today - timedelta(days=18)).strftime("%Y-%m-%d")
            due_date_3 = (today - timedelta(days=4)).strftime("%Y-%m-%d")
            cursor.execute("""
            INSERT INTO loans (book_id, member_id, loan_date, due_date, status, fine_amount, fine_paid, notes)
            VALUES (4, 3, ?, ?, 'overdue', 2.00, 0, 'Overdue reminder notice sent via email')
            """, (loan_date_3, due_date_3))

            # 4. Sapiens borrowed by Bruce Wayne (Active, due in 8 days)
            loan_date_4 = (today - timedelta(days=6)).strftime("%Y-%m-%d")
            due_date_4 = (today + timedelta(days=8)).strftime("%Y-%m-%d")
            cursor.execute("""
            INSERT INTO loans (book_id, member_id, loan_date, due_date, status, fine_amount, fine_paid, notes)
            VALUES (5, 4, ?, ?, 'active', 0.0, 0, 'History department research')
            """, (loan_date_4, due_date_4))

            # 5. Dune borrowed by Peter Parker (Active, due in 4 days)
            loan_date_5 = (today - timedelta(days=10)).strftime("%Y-%m-%d")
            due_date_5 = (today + timedelta(days=4)).strftime("%Y-%m-%d")
            cursor.execute("""
            INSERT INTO loans (book_id, member_id, loan_date, due_date, status, fine_amount, fine_paid, notes)
            VALUES (9, 5, ?, ?, 'active', 0.0, 0, 'Leisure reading')
            """, (loan_date_5, due_date_5))

            # 6. Atomic Habits borrowed and returned previously by Sarah Connor
            past_loan_date = (today - timedelta(days=35)).strftime("%Y-%m-%d")
            past_due_date = (today - timedelta(days=21)).strftime("%Y-%m-%d")
            past_return_date = (today - timedelta(days=23)).strftime("%Y-%m-%d")
            cursor.execute("""
            INSERT INTO loans (book_id, member_id, loan_date, due_date, return_date, status, fine_amount, fine_paid, notes)
            VALUES (7, 1, ?, ?, ?, 'returned', 0.0, 1, 'Returned in pristine condition')
            """, (past_loan_date, past_due_date, past_return_date))

        # Check if reservations exist
        cursor.execute("SELECT COUNT(*) FROM reservations")
        if cursor.fetchone()[0] == 0:
            res_date = (today - timedelta(days=1)).strftime("%Y-%m-%d")
            cursor.execute("""
            INSERT INTO reservations (book_id, member_id, reservation_date, status, notification_sent)
            VALUES (2, 5, ?, 'pending', 0)
            """, (res_date,))

