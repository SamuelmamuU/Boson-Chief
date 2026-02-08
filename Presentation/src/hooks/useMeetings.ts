import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Meeting, CreateMeetingRequest, UpdateMeetingRequest } from '@/types/api';

export function useMeetings(startDate?: Date, endDate?: Date) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Build query params for date filtering
  const buildEndpoint = () => {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('start_date', startDate.toISOString());
    }
    if (endDate) {
      params.append('end_date', endDate.toISOString());
    }
    const queryString = params.toString();
    return queryString ? `/api/meetings?${queryString}` : '/api/meetings';
  };

  const meetingsQuery = useQuery<Meeting[], ApiError>({
    queryKey: ['meetings', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: () => api.get<Meeting[]>(buildEndpoint()),
  });

  const createMeetingMutation = useMutation<Meeting, ApiError, CreateMeetingRequest>({
    mutationFn: (data) => api.post<Meeting>('/api/meetings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: 'Meeting created',
        description: 'The meeting has been scheduled successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating meeting',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMeetingMutation = useMutation<Meeting, ApiError, { id: string } & UpdateMeetingRequest>({
    mutationFn: ({ id, ...data }) => api.patch<Meeting>(`/api/meetings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: 'Meeting updated',
        description: 'The meeting has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating meeting',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMeetingMutation = useMutation<void, ApiError, string>({
    mutationFn: (meetingId) => api.delete(`/api/meetings/${meetingId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: 'Meeting deleted',
        description: 'The meeting has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting meeting',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    meetings: meetingsQuery.data || [],
    isLoading: meetingsQuery.isLoading,
    error: meetingsQuery.error,
    createMeeting: createMeetingMutation.mutate,
    updateMeeting: updateMeetingMutation.mutate,
    deleteMeeting: deleteMeetingMutation.mutate,
    isCreating: createMeetingMutation.isPending,
    isUpdating: updateMeetingMutation.isPending,
    isDeleting: deleteMeetingMutation.isPending,
  };
}
