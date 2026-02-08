# Python API Backend Reference

This React frontend is configured to connect to your Python API backend.

## Configuration

Set your API base URL in the `VITE_API_BASE_URL` secret (already configured).

## Expected API Endpoints

Your Python backend should implement these endpoints:

### Authentication

| Method | Endpoint | Request Body | Response |
|--------|----------|--------------|----------|
| POST | `/api/auth/login` | `{ email, password }` | `{ access_token, token_type, user }` |
| POST | `/api/auth/register` | `{ email, password, full_name }` | `{ access_token, token_type, user }` |
| POST | `/api/auth/logout` | - | `{}` |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current authenticated user |
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:id` | Get project by ID |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/:id/members` | Get project members |
| GET | `/api/projects/:id/tasks` | Get project tasks |
| GET | `/api/projects/:id/events` | Get project events |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Get task by ID |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events |
| GET | `/api/projects/:id/events` | Get project events |

### Meetings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meetings` | List all meetings (supports `?start_date=` and `?end_date=` query params) |
| POST | `/api/meetings` | Create a meeting |
| GET | `/api/meetings/:id` | Get meeting by ID with participants |
| PATCH | `/api/meetings/:id` | Update meeting |
| DELETE | `/api/meetings/:id` | Delete meeting |
| POST | `/api/meetings/:id/participants` | Add participants to meeting |
| DELETE | `/api/meetings/:id/participants/:profileId` | Remove participant from meeting |

#### Meeting Request/Response Schemas

**Create Meeting Request:**
```json
{
  "title": "string (required)",
  "description": "string | null",
  "start_time": "ISO datetime (required)",
  "end_time": "ISO datetime (required)",
  "project_id": "uuid | null",
  "location": "string | null",
  "meeting_type": "internal | external | review | standup",
  "participant_ids": ["uuid", "uuid"]
}
```

**Meeting Response:**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "start_time": "ISO datetime",
  "end_time": "ISO datetime",
  "project_id": "uuid | null",
  "created_by": "uuid",
  "location": "string | null",
  "meeting_type": "internal | external | review | standup",
  "created_at": "ISO datetime",
  "updated_at": "ISO datetime",
  "project": {
    "id": "uuid",
    "name": "string"
  } | null,
  "creator": {
    "id": "uuid",
    "full_name": "string",
    "avatar_url": "string | null"
  } | null,
  "participants": [
    {
      "id": "uuid",
      "profile_id": "uuid",
      "status": "pending | accepted | declined | tentative",
      "profile": {
        "id": "uuid",
        "full_name": "string",
        "avatar_url": "string | null"
      }
    }
  ]
}
```

### Capacity Allocations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/capacity-allocations` | List allocations (optional `?week_start=`) |
| PATCH | `/api/capacity-allocations/:id` | Update allocation |

### AI Chat

| Method | Endpoint | Request Body | Response |
|--------|----------|--------------|----------|
| POST | `/api/chat` | `{ messages, project_id?, agent_type? }` | `{ message, metadata? }` |

## Authentication

All endpoints except `/api/auth/*` require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## CORS

Your Python API must allow CORS from your frontend origin:

```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-lovable-app.lovable.app", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## User Object Schema

```json
{
  "id": "uuid",
  "email": "string",
  "full_name": "string",
  "avatar_url": "string | null",
  "availability": "available | busy | focus | offline",
  "cognitive_load": "number (0-100)",
  "roles": ["admin" | "manager" | "employee"],
  "created_at": "ISO datetime",
  "updated_at": "ISO datetime"
}
```

## Files Overview

| File | Purpose |
|------|---------|
| `src/lib/api.ts` | API client singleton with auth token management |
| `src/types/api.ts` | TypeScript types matching API responses |
| `src/hooks/useApi.ts` | React Query hooks for data fetching (projects, tasks, events, capacity) |
| `src/hooks/useMeetings.ts` | React Query hooks for meetings CRUD |
| `src/hooks/useAuth.ts` | Authentication state management |
| `src/contexts/ApiAuthContext.tsx` | Auth context provider |
| `src/types/meetings.ts` | Meeting-specific TypeScript types |

## Example FastAPI Implementation

```python
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID

app = FastAPI()
security = HTTPBearer()

# Meeting models
class MeetingParticipantCreate(BaseModel):
    profile_id: UUID
    status: str = "pending"

class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    project_id: Optional[UUID] = None
    location: Optional[str] = None
    meeting_type: str = "internal"
    participant_ids: List[UUID] = []

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    project_id: Optional[UUID] = None
    location: Optional[str] = None
    meeting_type: Optional[str] = None
    participant_ids: Optional[List[UUID]] = None

# Meeting endpoints
@app.get("/api/meetings")
async def list_meetings(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Implement: Return meetings filtered by date range
    pass

@app.post("/api/meetings")
async def create_meeting(
    meeting: MeetingCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Implement: Create meeting and add participants
    pass

@app.get("/api/meetings/{meeting_id}")
async def get_meeting(
    meeting_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Implement: Return meeting with participants
    pass

@app.patch("/api/meetings/{meeting_id}")
async def update_meeting(
    meeting_id: UUID,
    meeting: MeetingUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Implement: Update meeting
    pass

@app.delete("/api/meetings/{meeting_id}")
async def delete_meeting(
    meeting_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Implement: Delete meeting
    pass
```
