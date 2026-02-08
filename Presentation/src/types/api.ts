// API Response Types for Python Backend
// Update these types to match your Python API responses

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  availability?: 'available' | 'busy' | 'focus' | 'offline';
  cognitive_load?: number;
  roles: AppRole[];
  created_at: string;
  updated_at: string;
}

export type AppRole = 'admin' | 'manager' | 'employee';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  health: 'healthy' | 'at-risk' | 'critical' | 'blocked';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  manager_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  project_id: string;
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  project_id: string;
  type: 'meeting' | 'milestone' | 'decision' | 'conflict' | 'insight' | 'update' | 'alert';
  title: string;
  description?: string;
  ai_generated: boolean;
  created_at: string;
}

export interface CapacityAllocation {
  id: string;
  profile_id: string;
  project_id: string;
  week_start: string;
  hours_allocated: number;
  created_at: string;
  updated_at: string;
}

// AI/Agent types
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
  metadata?: Record<string, unknown>;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
