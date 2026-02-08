import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  Project,
  CreateProjectRequest,
  Task,
  CreateTaskRequest,
  ProjectEvent,
  Meeting,
  CreateMeetingRequest,
  CapacityAllocation,
  ChatRequest,
  ChatResponse,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.45:8000';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'An error occurred');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.fetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.access_token);
    return response;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.fetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.access_token);
    return response;
  }

  async logout(): Promise<void> {
    await this.fetch('/api/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    return this.fetch<User>('/api/users/me');
  }

  async getUsers(): Promise<User[]> {
    return this.fetch<User[]>('/api/users');
  }

  async getUser(id: string): Promise<User> {
    return this.fetch<User>(`/api/users/${id}`);
  }

  // Project endpoints
  async getProjects(): Promise<Project[]> {
    return this.fetch<Project[]>('/api/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.fetch<Project>(`/api/projects/${id}`);
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    return this.fetch<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return this.fetch<Project>(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.fetch(`/api/projects/${id}`, { method: 'DELETE' });
  }

  async getProjectMembers(projectId: string): Promise<User[]> {
    return this.fetch<User[]>(`/api/projects/${projectId}/members`);
  }

  async addProjectMember(projectId: string, userId: string): Promise<void> {
    await this.fetch(`/api/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await this.fetch(`/api/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async getProjectTasks(projectId: string): Promise<Task[]> {
    return this.fetch<Task[]>(`/api/projects/${projectId}/tasks`);
  }

  async getProjectEvents(projectId: string): Promise<ProjectEvent[]> {
    return this.fetch<ProjectEvent[]>(`/api/projects/${projectId}/events`);
  }

  // Task endpoints
  async getTasks(): Promise<Task[]> {
    return this.fetch<Task[]>('/api/tasks');
  }

  async getTask(id: string): Promise<Task> {
    return this.fetch<Task>(`/api/tasks/${id}`);
  }

  async createTask(data: CreateTaskRequest): Promise<Task> {
    return this.fetch<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    return this.fetch<Task>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string): Promise<void> {
    await this.fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  }

  // Event endpoints
  async getEvents(): Promise<ProjectEvent[]> {
    return this.fetch<ProjectEvent[]>('/api/events');
  }

  // Meeting endpoints
  async getMeetings(startDate?: string, endDate?: string): Promise<Meeting[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch<Meeting[]>(`/api/meetings${query}`);
  }

  async getMeeting(id: string): Promise<Meeting> {
    return this.fetch<Meeting>(`/api/meetings/${id}`);
  }

  async createMeeting(data: CreateMeetingRequest): Promise<Meeting> {
    return this.fetch<Meeting>('/api/meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMeeting(id: string, data: Partial<CreateMeetingRequest>): Promise<Meeting> {
    return this.fetch<Meeting>(`/api/meetings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMeeting(id: string): Promise<void> {
    await this.fetch(`/api/meetings/${id}`, { method: 'DELETE' });
  }

  // Capacity endpoints
  async getCapacityAllocations(weekStart?: string): Promise<CapacityAllocation[]> {
    const params = weekStart ? `?week_start=${weekStart}` : '';
    return this.fetch<CapacityAllocation[]>(`/api/capacity-allocations${params}`);
  }

  async createCapacityAllocation(data: {
    profile_id: string;
    project_id: string;
    week_start: string;
    hours_allocated: number;
  }): Promise<CapacityAllocation> {
    return this.fetch<CapacityAllocation>('/api/capacity-allocations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCapacityAllocation(id: string, hoursAllocated: number): Promise<CapacityAllocation> {
    return this.fetch<CapacityAllocation>(`/api/capacity-allocations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ hours_allocated: hoursAllocated }),
    });
  }

  // AI Chat endpoint
  async chat(request: ChatRequest): Promise<ChatResponse> {
    return this.fetch<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const api = new ApiClient();
