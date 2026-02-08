import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import type { 
  Project, 
  Task, 
  Event, 
  CapacityAllocation, 
  User,
  PaginatedResponse,
  ChatRequest,
  ChatResponse,
  Meeting,
  CreateMeetingRequest,
  UpdateMeetingRequest,
} from '@/types/api';

// ============ Projects ============
export function useProjects(options?: Omit<UseQueryOptions<Project[], ApiError>, 'queryKey' | 'queryFn'>) {
  return useQuery<Project[], ApiError>({
    queryKey: ['projects'],
    queryFn: () => api.get<Project[]>('/api/projects'),
    ...options,
  });
}

export function useProject(id: string, options?: Omit<UseQueryOptions<Project, ApiError>, 'queryKey' | 'queryFn'>) {
  return useQuery<Project, ApiError>({
    queryKey: ['projects', id],
    queryFn: () => api.get<Project>(`/api/projects/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, ApiError, Partial<Project>>({
    mutationFn: (data) => api.post<Project>('/api/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, ApiError, { id: string; data: Partial<Project> }>({
    mutationFn: ({ id, data }) => api.patch<Project>(`/api/projects/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => api.delete(`/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ============ Tasks ============
export function useTasks(projectId?: string, options?: Omit<UseQueryOptions<Task[], ApiError>, 'queryKey' | 'queryFn'>) {
  const endpoint = projectId ? `/api/projects/${projectId}/tasks` : '/api/tasks';
  return useQuery<Task[], ApiError>({
    queryKey: projectId ? ['projects', projectId, 'tasks'] : ['tasks'],
    queryFn: () => api.get<Task[]>(endpoint),
    ...options,
  });
}

export function useTask(id: string, options?: Omit<UseQueryOptions<Task, ApiError>, 'queryKey' | 'queryFn'>) {
  return useQuery<Task, ApiError>({
    queryKey: ['tasks', id],
    queryFn: () => api.get<Task>(`/api/tasks/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation<Task, ApiError, Partial<Task>>({
    mutationFn: (data) => api.post<Task>('/api/tasks', data),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (task.project_id) {
        queryClient.invalidateQueries({ queryKey: ['projects', task.project_id, 'tasks'] });
      }
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation<Task, ApiError, { id: string; data: Partial<Task> }>({
    mutationFn: ({ id, data }) => api.patch<Task>(`/api/tasks/${id}`, data),
    onSuccess: (task, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      if (task.project_id) {
        queryClient.invalidateQueries({ queryKey: ['projects', task.project_id, 'tasks'] });
      }
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, { id: string; projectId?: string }>({
    mutationFn: ({ id }) => api.delete(`/api/tasks/${id}`),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      }
    },
  });
}

// ============ Events ============
export function useEvents(projectId?: string, options?: Omit<UseQueryOptions<Event[], ApiError>, 'queryKey' | 'queryFn'>) {
  const endpoint = projectId ? `/api/projects/${projectId}/events` : '/api/events';
  return useQuery<Event[], ApiError>({
    queryKey: projectId ? ['projects', projectId, 'events'] : ['events'],
    queryFn: () => api.get<Event[]>(endpoint),
    ...options,
  });
}

// ============ Capacity Allocations ============
export function useCapacityAllocations(weekStart?: string, options?: Omit<UseQueryOptions<CapacityAllocation[], ApiError>, 'queryKey' | 'queryFn'>) {
  const endpoint = weekStart 
    ? `/api/capacity-allocations?week_start=${weekStart}` 
    : '/api/capacity-allocations';
  return useQuery<CapacityAllocation[], ApiError>({
    queryKey: ['capacity-allocations', weekStart],
    queryFn: () => api.get<CapacityAllocation[]>(endpoint),
    ...options,
  });
}

export function useUpdateCapacityAllocation() {
  const queryClient = useQueryClient();
  return useMutation<CapacityAllocation, ApiError, { id: string; data: Partial<CapacityAllocation> }>({
    mutationFn: ({ id, data }) => api.patch<CapacityAllocation>(`/api/capacity-allocations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capacity-allocations'] });
    },
  });
}

// ============ Users / Profiles ============
export function useUsers(options?: Omit<UseQueryOptions<User[], ApiError>, 'queryKey' | 'queryFn'>) {
  return useQuery<User[], ApiError>({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>('/api/users'),
    ...options,
  });
}

export function useUser(id: string, options?: Omit<UseQueryOptions<User, ApiError>, 'queryKey' | 'queryFn'>) {
  return useQuery<User, ApiError>({
    queryKey: ['users', id],
    queryFn: () => api.get<User>(`/api/users/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useCurrentUser(options?: Omit<UseQueryOptions<User, ApiError>, 'queryKey' | 'queryFn'>) {
  return useQuery<User, ApiError>({
    queryKey: ['users', 'me'],
    queryFn: () => api.get<User>('/api/users/me'),
    ...options,
  });
}

// ============ AI Chat ============
export function useSendChatMessage(options?: UseMutationOptions<ChatResponse, ApiError, ChatRequest>) {
  return useMutation<ChatResponse, ApiError, ChatRequest>({
    mutationFn: (data) => api.post<ChatResponse>('/api/chat', data),
    ...options,
  });
}

// ============ Project Members ============
export function useProjectMembers(projectId: string, options?: Omit<UseQueryOptions<User[], ApiError>, 'queryKey' | 'queryFn'>) {
  return useQuery<User[], ApiError>({
    queryKey: ['projects', projectId, 'members'],
    queryFn: () => api.get<User[]>(`/api/projects/${projectId}/members`),
    enabled: !!projectId,
    ...options,
  });
}

// ============ Meetings ============
export function useMeetingsQuery(
  startDate?: Date, 
  endDate?: Date, 
  options?: Omit<UseQueryOptions<Meeting[], ApiError>, 'queryKey' | 'queryFn'>
) {
  const buildEndpoint = () => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate.toISOString());
    if (endDate) params.append('end_date', endDate.toISOString());
    const queryString = params.toString();
    return queryString ? `/api/meetings?${queryString}` : '/api/meetings';
  };

  return useQuery<Meeting[], ApiError>({
    queryKey: ['meetings', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: () => api.get<Meeting[]>(buildEndpoint()),
    ...options,
  });
}

export function useMeeting(id: string, options?: Omit<UseQueryOptions<Meeting, ApiError>, 'queryKey' | 'queryFn'>) {
  return useQuery<Meeting, ApiError>({
    queryKey: ['meetings', id],
    queryFn: () => api.get<Meeting>(`/api/meetings/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  return useMutation<Meeting, ApiError, CreateMeetingRequest>({
    mutationFn: (data) => api.post<Meeting>('/api/meetings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();
  return useMutation<Meeting, ApiError, { id: string; data: UpdateMeetingRequest }>({
    mutationFn: ({ id, data }) => api.patch<Meeting>(`/api/meetings/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meetings', id] });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: (id) => api.delete(`/api/meetings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}
