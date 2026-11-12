# 📚 Library Management System (LMS)

A complete, production-ready Library Management System featuring a high-performance **Python FastAPI** backend with **SQLite**, alongside **two modern frontend interfaces**:
1. **Next.js 16 Web Application** (React 19, TypeScript, Tailwind CSS, Dual-Mode Classic/Modern views)
2. **Pure HTML/CSS/JavaScript Application** (Standalone, zero-framework, offline-ready)

---

## 📑 Table of Contents
- [Project Overview](#-project-overview)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Features](#-features)
  - [1. Backend API (FastAPI)](#1-backend-api-fastapi)
  - [2. Next.js Frontend](#2-nextjs-frontend)
  - [3. Standalone HTML/CSS/JS Frontend](#3-standalone-htmlcssjs-frontend)
- [Quick Start Guide](#-quick-start-guide)
  - [Option A: One-Click Startup (Windows)](#option-a-one-click-startup-windows)
  - [Option B: Manual Startup](#option-b-manual-startup)
  - [Option C: Standalone HTML Application](#option-c-standalone-html-application)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Pre-Seeded Sample Data](#-pre-seeded-sample-data)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Git & Ignore Policies](#-git--ignore-policies)

---

## 🌟 Project Overview

This system streamlines library management operations, including book inventory control, member circulation, check-outs/check-ins, automated overdue fine calculations, waitlist reservations, and analytics.

---

## 🏗️ Architecture & Tech Stack

### Backend
- **Python 3.10+ / FastAPI**: Fast, async, type-safe RESTful API with automated OpenAPI / Swagger documentation.
- **SQLite3 & Pydantic v2**: Zero-configuration, zero-dependency lightweight relational database with ACID compliance and strict request/response data schemas.
- **PBKDF2-HMAC & JWT Authentication**: Token-based security and password hashing.

### Frontends
- **Next.js 16 (React 19, TypeScript, Tailwind CSS)**:
  - **Classic Desktop GUI Mode**: Styled to replicate classic desktop library software with title bar, system menus, Courier New monospace typography, and interactive data grids.
  - **Modern Dashboard Mode**: Responsive cards, real-time KPI metrics, circulation feeds, search filters, and modal dialogs.
- **Standalone HTML5 / CSS3 / Vanilla JavaScript**:
  - Completely framework-free single-page application with mock data, circulation tab flows, reports with pure CSS bar charts, and `localStorage` persistence.

---

## 📁 Project Directory Structure

```
library-management-system/
│
├── index.html                      # Standalone zero-framework HTML/CSS/JS frontend
├── .gitignore                      # Git exclusion rules for secrets, DB, and builds
├── README.md                       # Complete project documentation
│
├── start_all.bat                   # 1-Click launcher: starts Backend & Next.js Frontend
├── start_all.ps1                   # PowerShell 1-Click launcher
├── run_backend.bat                 # Standalone backend launcher (cmd)
├── run_backend.ps1                 # Standalone backend launcher (PowerShell)
├── run_frontend.bat                # Standalone Next.js launcher (cmd)
├── run_frontend.ps1                # Standalone Next.js launcher (PowerShell)
│
├── backend/                        # Python FastAPI Backend
│   ├── main.py                     # App entry point, CORS middleware, router setup
│   ├── database.py                 # SQLite connection manager & table schema creation
│   ├── models.py                   # Pydantic v2 validation models
│   ├── auth.py                     # Password hashing (PBKDF2) & JWT utilities
│   ├── seed_data.py                # Initial mock books, members, and loan records
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Sample backend environment variables
│   └── routers/
│       ├── auth_routes.py          # /api/auth (Login, register, me)
│       ├── books.py                # /api/books (Catalog CRUD, search, filter)
│       ├── members.py              # /api/members (Patron directory, borrow quotas)
│       ├── loans.py                # /api/loans (Check-out, check-in, fines, renewals)
│       ├── reservations.py         # /api/reservations (Hold queue & waitlist)
│       └── stats.py                # /api/stats (Dashboard analytics & metrics)
│
└── frontend/                       # Next.js 16 Web Application
    ├── package.json                # Node dependencies & npm scripts
    ├── tsconfig.json               # TypeScript configuration
    ├── next.config.ts              # Next.js settings & remote image patterns
    ├── eslint.config.mjs           # ESLint configuration
    ├── index.html                  # Standalone frontend copy
    ├── .env.example                # Sample frontend environment variables
    ├── public/                     # Static assets & icons
    └── src/
        ├── app/
        │   ├── layout.tsx          # Root HTML layout & fonts
        │   ├── globals.css         # Tailwind styles & theme variables
        │   └── page.tsx            # Main application controller with view switching
        ├── components/
        │   ├── ClassicDesktopView.tsx  # Classic GUI matching desktop system design
        │   ├── DashboardView.tsx   # Modern statistics dashboard
        │   ├── BooksView.tsx       # Catalog grid and table views
        │   ├── LoansView.tsx       # Circulation desk & overdue tracking
        │   ├── MembersView.tsx     # Member directory & status controls
        │   ├── ReservationsView.tsx# Waitlist queue manager
        │   ├── Header.tsx          # Navigation header & live API ping badge
        │   ├── Sidebar.tsx         # Sidebar navigation with notification pills
        │   └── modals/             # Issue, Return, Book, and Member modal dialogs
        └── lib/
            ├── api.ts              # Centralized typed HTTP client
            └── types.ts            # TypeScript interfaces
```

---

## ✨ Features

### 1. Backend API (FastAPI)
- **FastAPI OpenAPI Integration**: Interactive Swagger documentation accessible at `http://127.0.0.1:8000/docs`.
- **Automatic Database Seeding**: On first run, SQLite `library.db` is initialized and populated with books, members, active loans, and overdue records.
- **Dynamic Fines Calculation**: Computes overdue duration and late fines dynamically at a configurable daily rate ($0.50/day).
- **Borrow Limits & Availability Verification**: Enforces max borrow counts by membership tier (*Student: 5*, *Faculty: 12*, *Premium: 8*) and decrements/increments available copies atomically.

### 2. Next.js Frontend
- **Dual Visual Modes**:
  - **Classic Desktop GUI Mode**: Inspired by classic desktop library software with a Windows title bar, system menus (`Add`, `Admin Tools`), centered Courier New typography, input controls (`ENTER STUDENT`, `ENTER THE BOOK ID`), and an interactive treeview table.
  - **Modern Dashboard Mode**: Clean modern SaaS UI with KPI cards, charts, badges, and responsive tables.
- **Seamless Switching**: Switch between Classic and Modern modes using the top-right menu toggle.
- **Live Backend Connection Indicator**: Real-time ping badge showing whether the backend API is online.
- **Search & Filter Controls**: Real-time filtering by keyword, genre, and availability.

### 3. Standalone HTML/CSS/JS Frontend (`index.html`)
- **100% Framework-Free**: Single file containing all HTML, CSS, and vanilla JavaScript.
- **Works Completely Offline**: No Node.js, external libraries, or build steps required.
- **6 Full Screens**:
  1. *Dashboard*: 4 metric stat cards, overdue priority table, upcoming due dates, and activity feed.
  2. *Catalog*: Search, genre/status filters, book detail modal with placeholder cover, add/edit/delete actions.
  3. *Circulation*: Interactive Check-Out and Check-In tabs with preview displays and fine calculations.
  4. *Members*: Patron table, borrow quotas, and member detail modal with active and past loan history.
  5. *Reports*: Top metric cards, monthly checkouts CSS bar chart, genre distribution, CSV export, and print preview.
  6. *Settings*: Library info, circulation rules, notifications, and `localStorage` persistence.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: v18 or higher (optional, only needed for the Next.js frontend)

---

### Option A: One-Click Startup (Windows)

Simply double-click `start_all.bat` or run in PowerShell:
```powershell
.\start_all.ps1
```
This automatically starts:
- **FastAPI Backend**: `http://127.0.0.1:8000`
- **Next.js Frontend**: `http://localhost:3000`

---

### Option B: Manual Startup

#### Step 1: Start the Backend (FastAPI)
```powershell
# Navigate to backend directory
cd backend

# Install dependencies (if needed)
pip install -r requirements.txt

# Start server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base: `http://127.0.0.1:8000`
- Swagger Docs: `http://127.0.0.1:8000/docs`

#### Step 2: Start the Next.js Frontend
```powershell
# In a separate terminal, navigate to frontend directory
cd frontend

# Install packages (if needed)
npm install

# Start Next.js development server
npm run dev
```
- Application Portal: `http://localhost:3000`

---

### Option C: Standalone HTML Application

Open `index.html` directly in your browser:
```powershell
# In Windows PowerShell:
start index.html
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and version metadata |
| `GET` | `/docs` | Interactive Swagger UI documentation |
| `GET` | `/api/stats/dashboard` | Dashboard metrics (titles, copies, loans, fines, genres) |
| `GET` | `/api/books` | List books with search, genre, and availability filters |
| `POST` | `/api/books` | Add a new book to inventory |
| `GET` | `/api/books/{id}` | Retrieve specific book details |
| `PUT` | `/api/books/{id}` | Update book details and copy counts |
| `DELETE` | `/api/books/{id}` | Delete book (verifies no active loans exist) |
| `GET` | `/api/books/genres/list` | List all unique genres in catalog |
| `GET` | `/api/members` | List patrons with active loan counts and filters |
| `POST` | `/api/members` | Register a new patron |
| `GET` | `/api/members/{id}` | Retrieve member profile with borrowing history |
| `PUT` | `/api/members/{id}` | Update member profile |
| `DELETE` | `/api/members/{id}` | Remove member (verifies no active loans) |
| `GET` | `/api/loans` | List circulation records with computed overdue fines |
| `POST` | `/api/loans` | Issue a book to a member |
| `POST` | `/api/loans/{id}/return` | Check in a book & settle penalty fines |
| `POST` | `/api/loans/{id}/extend` | Extend loan due date (+7 days) |
| `GET` | `/api/reservations` | List waitlist reservations |
| `POST` | `/api/reservations` | Place a reservation on a borrowed title |
| `POST` | `/api/reservations/{id}/fulfill` | Fulfill reservation |
| `POST` | `/api/reservations/{id}/cancel` | Cancel reservation |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT token |
| `POST` | `/api/auth/register` | Register new user account |
| `GET` | `/api/auth/me` | Current authenticated user profile |

---

## 📚 Pre-Seeded Sample Data

The SQLite database and mock store come pre-loaded with:
- **Books**:
  - *Clean Code* by Robert C. Martin (Computer Science)
  - *Designing Data-Intensive Applications* by Martin Kleppmann (Computer Science)
  - *To Kill a Mockingbird* by Harper Lee (Classic Literature)
  - *1984* by George Orwell (Dystopian Fiction)
  - *Sapiens: A Brief History of Humankind* by Yuval Noah Harari (History)
  - *Thinking, Fast and Slow* by Daniel Kahneman (Science/Psychology)
  - *Atomic Habits* by James Clear (Self-Help)
  - *A Brief History of Time* by Stephen Hawking (Science)
  - *Dune* by Frank Herbert (Sci-Fi)
  - *Project Hail Mary* by Andy Weir (Sci-Fi)
  - *The Psychology of Money* by Morgan Housel (Finance)
  - *The Pragmatic Programmer* by David Thomas & Andrew Hunt (Computer Science)
- **Members**:
  - Sarah Connor (Faculty, MEM-1001)
  - Alex Mercer (Student, MEM-1002)
  - Diana Prince (Premium, MEM-1003)
  - Bruce Wayne (Faculty, MEM-1004)
  - Peter Parker (Student, MEM-1005)
- **Circulation Records**:
  - Multiple active loans across members.
  - Overdue loan with calculated penalty fines.
  - Completed and returned loans history.
  - Active reservation waitlist.

---

## ⚙️ Configuration & Environment Variables

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` to configure:
```env
JWT_SECRET=your-secure-random-jwt-secret-key-here
HOST=127.0.0.1
PORT=8000
```

### Frontend (`frontend/.env.local`)
Copy `frontend/.env.example` to `frontend/.env.local` to configure:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 🛡️ Git & Ignore Policies

The project includes a comprehensive [`.gitignore`](.gitignore) that excludes:
- **Local SQLite databases**: `*.db`, `*.sqlite3`, `backend/library.db`
- **Node.js dependencies & build cache**: `node_modules/`, `.next/`, `out/`, `*.tsbuildinfo`
- **Python cache & virtual environments**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`
- **Environment & secret files**: `.env`, `.env.local` (safe `.env.example` files remain tracked)
- **Operating system files**: `.DS_Store`, `Thumbs.db`, `Desktop.ini`
- **IDE configuration**: `.vscode/`, `.idea/`

---

## 📄 License
This project is open-source and free to use for educational and institutional purposes.
