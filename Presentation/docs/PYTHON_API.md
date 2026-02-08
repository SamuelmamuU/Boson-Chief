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
| `src/hooks/useApi.ts` | React Query hooks for data fetching |
| `src/hooks/useAuth.ts` | Authentication state management |
| `src/contexts/ApiAuthContext.tsx` | Auth context provider (swap with existing AuthContext) |
