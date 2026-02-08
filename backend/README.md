# NexusAI Enterprise Hub - Python Backend

A FastAPI-based backend for the NexusAI Enterprise Hub application with dual AI agent architecture.

## Quick Start

### Prerequisites
- Python 3.11+
- MySQL 8.0+
- pip

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations (or execute schema.sql manually)
mysql -u root -p < database/schema.sql

# Start the server
uvicorn app.main:app --reload --port 8000
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/nexusai_db
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:5173,http://localhost:8080
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models/              # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── task.py
│   │   ├── meeting.py
│   │   └── ...
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── project.py
│   │   └── ...
│   ├── routers/             # API routes
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── projects.py
│   │   ├── tasks.py
│   │   ├── meetings.py
│   │   ├── capacity.py
│   │   └── chat.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   └── ai_service.py
│   └── utils/               # Utilities
│       ├── __init__.py
│       ├── security.py
│       └── dependencies.py
├── database/
│   └── schema.sql
├── requirements.txt
└── README.md
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## AI Agent Architecture

The system implements a dual-agent architecture:

1. **Global AI (Company Brain)**: Cross-project visibility for scheduling, resource allocation, and enterprise-wide insights.

2. **Local AI (Project Brain)**: Deep context for specific projects including task status, team dynamics, and project history.
