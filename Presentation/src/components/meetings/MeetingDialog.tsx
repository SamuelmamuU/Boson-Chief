import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, Users, Video } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Meeting, MeetingType, CreateMeetingRequest, User, Project } from '@/types/api';

interface MeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting?: Meeting | null;
  onSubmit: (data: CreateMeetingRequest) => void;
  isSubmitting?: boolean;
  defaultDate?: Date;
}

const MEETING_TYPES: { value: MeetingType; label: string; icon: typeof Video }[] = [
  { value: 'internal', label: 'Internal Meeting', icon: Users },
  { value: 'external', label: 'External Meeting', icon: Video },
  { value: 'review', label: 'Review', icon: CalendarIcon },
  { value: 'standup', label: 'Standup', icon: Clock },
];

export function MeetingDialog({
  open,
  onOpenChange,
  meeting,
  onSubmit,
  isSubmitting,
  defaultDate,
}: MeetingDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(defaultDate || new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [meetingType, setMeetingType] = useState<MeetingType>('internal');
  const [projectId, setProjectId] = useState<string>('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  // Fetch projects from API
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => api.get<Project[]>('/api/projects'),
  });

  // Fetch users/profiles from API
  const { data: profiles = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => api.get<User[]>('/api/users'),
  });

  // Reset form when dialog opens or meeting changes
  useEffect(() => {
    if (open) {
      if (meeting) {
        setTitle(meeting.title);
        setDescription(meeting.description || '');
        setDate(new Date(meeting.start_time));
        setStartTime(format(new Date(meeting.start_time), 'HH:mm'));
        setEndTime(format(new Date(meeting.end_time), 'HH:mm'));
        setLocation(meeting.location || '');
        setMeetingType(meeting.meeting_type);
        setProjectId(meeting.project_id || '');
        setSelectedParticipants(meeting.participants?.map(p => p.profile_id) || []);
      } else {
        setTitle('');
        setDescription('');
        setDate(defaultDate || new Date());
        setStartTime('09:00');
        setEndTime('10:00');
        setLocation('');
        setMeetingType('internal');
        setProjectId('');
        setSelectedParticipants([]);
      }
    }
  }, [open, meeting, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !title) return;

    const startDateTime = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(date);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    onSubmit({
      title,
      description: description || undefined,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      project_id: projectId && projectId !== 'none' ? projectId : undefined,
      location: location || undefined,
      meeting_type: meetingType,
      participant_ids: selectedParticipants,
    });
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{meeting ? 'Edit Meeting' : 'Schedule Meeting'}</DialogTitle>
          <DialogDescription>
            {meeting
              ? 'Update the meeting details below.'
              : 'Fill in the details to schedule a new meeting.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting title"
              required
            />
          </div>

          {/* Meeting Type */}
          <div className="space-y-2">
            <Label>Meeting Type</Label>
            <Select value={meetingType} onValueChange={(v) => setMeetingType(v as MeetingType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEETING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Meeting room or link"
                className="pl-10"
              />
            </div>
          </div>

          {/* Project */}
          <div className="space-y-2">
            <Label>Project (optional)</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <Label>Participants</Label>
            <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
              {profiles.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(user.id)}
                    onChange={() => toggleParticipant(user.id)}
                    className="rounded border-border"
                  />
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                    {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="text-sm">{user.full_name}</span>
                </label>
              ))}
              {profiles.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No team members available
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Meeting agenda or notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title || !date}>
              {isSubmitting ? 'Saving...' : meeting ? 'Update Meeting' : 'Schedule Meeting'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
