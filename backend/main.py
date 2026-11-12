from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from seed_data import seed_database
from routers import auth_routes, books, members, loans, reservations, stats

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema & initial seed data
    init_db()
    seed_database()
    yield

app = FastAPI(
    title="Library Management System API",
    description="Modern REST API for Library Inventory, Circulation, Member Management, and Analytics.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend (default port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_routes.router)
app.include_router(books.router)
app.include_router(members.router)
app.include_router(loans.router)
app.include_router(reservations.router)
app.include_router(stats.router)

@app.get("/")
def root():
    return {
        "name": "Library Management System API",
        "status": "operational",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

