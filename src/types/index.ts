// User & Auth Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  availability: 'available' | 'busy' | 'away' | 'offline';
  cognitive_load: number;
  roles: ('manager' | 'employee')[];
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
}

// Project Types
export type ProjectHealth = 'healthy' | 'at-risk' | 'critical' | 'blocked';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  name: string;
  description: string;
  health: ProjectHealth;
  progress: number;
  priority: ProjectPriority;
  manager_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  priority: ProjectPriority;
  manager_id: string;
  member_ids?: string[];
}

// Task Types
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string;
  assigned_to: string | null;
  due_date: string | null;
  estimated_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  project_id: string;
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
}

// Event Types
export type EventType = 'meeting' | 'milestone' | 'decision' | 'conflict' | 'insight' | 'update' | 'alert';

export interface ProjectEvent {
  id: string;
  project_id: string;
  type: EventType;
  title: string;
  description: string;
  ai_generated: boolean;
  created_at: string;
}

// Meeting Types
export type MeetingType = 'internal' | 'external' | 'review' | 'standup';
export type ParticipantStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

export interface MeetingParticipant {
  id: string;
  profile_id: string;
  status: ParticipantStatus;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  project_id: string;
  created_by: string;
  location: string;
  meeting_type: MeetingType;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  participants?: MeetingParticipant[];
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  project_id: string;
  location?: string;
  meeting_type?: MeetingType;
  participant_ids?: string[];
}

// Capacity Allocation Types
export interface CapacityAllocation {
  id: string;
  profile_id: string;
  project_id: string;
  week_start: string;
  hours_allocated: number;
  created_at: string;
  updated_at: string;
}

// AI Chat Types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  project_id?: string;
  agent_type?: 'global' | 'local';
}

export interface ChatResponse {
  message: string;
  metadata?: {
    sources: string[];
    confidence: number;
  };
}

// API Error
export interface ApiError {
  detail: string;
  code?: string;
  errors?: {
    field: string;
    message: string;
  }[];
}
