from .auth import router as auth_router
from .users import router as users_router
from .projects import router as projects_router
from .tasks import router as tasks_router
from .meetings import router as meetings_router
from .capacity import router as capacity_router
from .events import router as events_router
from .chat import router as chat_router

__all__ = [
    "auth_router",
    "users_router",
    "projects_router",
    "tasks_router",
    "meetings_router",
    "capacity_router",
    "events_router",
    "chat_router",
]
