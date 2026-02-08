from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Project
from ..schemas import ChatRequest, ChatResponse
from ..schemas.chat import ChatMetadata
from ..utils import get_current_user

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    AI Chat endpoint that routes to Global or Local AI agent.
    
    This is a placeholder implementation. In production, this would:
    1. Connect to LangChain/CrewAI for agent orchestration
    2. Use vector stores for project knowledge cells
    3. Implement RAG for context-aware responses
    """
    
    last_message = request.messages[-1].content if request.messages else ""
    agent_type = request.agent_type
    project_id = request.project_id
    
    # Get project context if local agent
    project_name = None
    if project_id:
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            project_name = project.name
    
    # Simulate AI response based on agent type and query
    if agent_type.value == "global":
        response = generate_global_response(last_message)
    else:
        response = generate_local_response(last_message, project_name)
    
    return ChatResponse(
        message=response,
        metadata=ChatMetadata(
            sources=["project_data", "calendar", "tasks"] if agent_type.value == "local" else ["master_calendar", "resource_allocation"],
            confidence=0.85
        )
    )


def generate_global_response(query: str) -> str:
    """Generate response for Global AI (cross-project insights)."""
    query_lower = query.lower()
    
    if "schedule" in query_lower or "meeting" in query_lower:
        return """📅 **Schedule Analysis**

I've analyzed the master calendar and team availability:

- **Best time for team meeting**: Thursday 2:00 PM - 3:00 PM
- **All stakeholders available**: ✓
- **No conflicts detected** with other critical reviews

Would you like me to schedule this meeting?"""
    
    if "status" in query_lower or "overview" in query_lower:
        return """📊 **Enterprise Overview**

**Active Projects**: 3
- Website Redesign: 75% complete (Healthy)
- Mobile App: 45% complete (At Risk)
- Analytics Platform: 90% complete (Healthy)

**Team Capacity**: 85% utilized
**Upcoming Deadlines**: 2 this week

⚠️ **Alert**: One team member is overallocated. Consider redistributing tasks."""
    
    if "capacity" in query_lower or "resource" in query_lower:
        return """👥 **Resource Allocation Report**

**Team Overview**:
- 4 team members across 3 active projects
- Average utilization: 85%

**Recommendations**:
1. Redistribute 10h from overallocated members
2. Consider hiring for Q2 projects
3. Review Mobile App timeline - needs additional resources"""
    
    return """🌐 **Global AI Response**

Based on my cross-project analysis, I can provide insights on:
- Resource allocation across projects
- Schedule optimization
- Enterprise-wide metrics

What specific aspect would you like me to analyze?"""


def generate_local_response(query: str, project_name: str = None) -> str:
    """Generate response for Local AI (project-specific context)."""
    query_lower = query.lower()
    
    if not project_name:
        return "🎯 Please select a project to get context-specific insights from the Local AI."
    
    if "status" in query_lower or "update" in query_lower:
        return f"""🎯 **{project_name} Status**

**Progress**: 75%
**Health**: Healthy
**Priority**: High

**Recent Activity**:
- 3 tasks completed this week
- Design review scheduled for tomorrow
- Sprint goal on track

**Recommendations**:
1. Focus on completing remaining UI components
2. Schedule stakeholder demo for Friday"""
    
    if "task" in query_lower:
        return f"""📋 **{project_name} - Task Summary**

**Open Tasks**: 8
- To Do: 3
- In Progress: 4
- Blocked: 1

**Priority Breakdown**:
- High: 2 tasks (API integration, Auth flow)
- Medium: 4 tasks
- Low: 2 tasks

**Next Action**: Complete the blocked task by resolving dependency with DevOps team."""
    
    if "team" in query_lower or "member" in query_lower:
        return f"""👥 **{project_name} - Team Dynamics**

**Team Size**: 4 members
**Cognitive Load**:
- Jane Smith: 30% (Available)
- Bob Wilson: 85% (Overloaded)

**Recommendation**: Consider reassigning 2 tasks from Bob to balance workload."""
    
    return f"""🎯 **Local AI - {project_name}**

I have full context on this project including:
- Task history and current status
- Team member contributions
- Meeting transcripts and decisions

What would you like to know about {project_name}?"""
