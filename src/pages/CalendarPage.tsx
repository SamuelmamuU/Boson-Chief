import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Meeting, Project, User, MeetingType } from '@/types';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
  parseISO,
  setHours,
  setMinutes,
} from 'date-fns';

const meetingTypeStyles = {
  internal: 'bg-primary/10 text-primary border-l-primary',
  external: 'bg-warning/10 text-warning border-l-warning',
  review: 'bg-info/10 text-info border-l-info',
  standup: 'bg-success/10 text-success border-l-success',
};

const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

export default function CalendarPage() {
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    project_id: '',
    location: '',
    meeting_type: 'internal' as MeetingType,
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [meetingsData, projectsData, usersData] = await Promise.all([
          api.getMeetings(weekStart.toISOString(), weekEnd.toISOString()),
          api.getProjects(),
          api.getUsers(),
        ]);
        setMeetings(meetingsData);
        setProjects(projectsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [currentWeek]);

  const getMeetingsForDayAndHour = (day: Date, hour: number) => {
    return meetings.filter((meeting) => {
      const meetingDate = parseISO(meeting.start_time);
      return isSameDay(meetingDate, day) && meetingDate.getHours() === hour;
    });
  };

  const handleCreateMeeting = async () => {
    if (!newMeeting.title || !newMeeting.start_time || !newMeeting.project_id) return;
    try {
      const created = await api.createMeeting({
        ...newMeeting,
        end_time: newMeeting.end_time || newMeeting.start_time,
      });
      setMeetings((prev) => [...prev, created]);
      setDialogOpen(false);
      setNewMeeting({ title: '', description: '', start_time: '', end_time: '', project_id: '', location: '', meeting_type: 'internal' });
      toast({ title: 'Meeting scheduled' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create meeting', variant: 'destructive' });
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="p-8 space-y-6 max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Team meetings and project events.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Meeting</DialogTitle>
              <DialogDescription>Create a new team meeting.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  placeholder="Meeting title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={newMeeting.start_time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="datetime-local"
                    value={newMeeting.end_time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, end_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select
                    value={newMeeting.project_id}
                    onValueChange={(v) => setNewMeeting({ ...newMeeting, project_id: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newMeeting.meeting_type}
                    onValueChange={(v) => setNewMeeting({ ...newMeeting, meeting_type: v as MeetingType })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="standup">Standup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={newMeeting.location}
                  onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                  placeholder="Room or link"
                />
              </div>
              <Button onClick={handleCreateMeeting} className="w-full gradient-primary text-white">
                Schedule Meeting
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <h2 className="text-xl font-semibold">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </h2>
        <Button variant="outline" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header */}
            <div className="grid grid-cols-8 border-b bg-muted/50">
              <div className="p-3 text-sm font-medium text-muted-foreground">Time</div>
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'p-3 text-center',
                    isSameDay(day, new Date()) && 'bg-primary/5'
                  )}
                >
                  <p className="text-sm font-medium">{format(day, 'EEE')}</p>
                  <p className={cn(
                    'text-2xl font-bold',
                    isSameDay(day, new Date()) && 'text-primary'
                  )}>
                    {format(day, 'd')}
                  </p>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b last:border-0">
                <div className="p-3 text-sm text-muted-foreground border-r">
                  {format(setHours(new Date(), hour), 'h a')}
                </div>
                {weekDays.map((day) => {
                  const dayMeetings = getMeetingsForDayAndHour(day, hour);
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'p-1 min-h-[60px] border-r last:border-0',
                        isSameDay(day, new Date()) && 'bg-primary/5'
                      )}
                    >
                      {dayMeetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className={cn(
                            'p-2 rounded text-xs border-l-2 cursor-pointer hover:opacity-80 transition-opacity',
                            meetingTypeStyles[meeting.meeting_type]
                          )}
                        >
                          <p className="font-medium truncate">{meeting.title}</p>
                          <p className="text-muted-foreground truncate">
                            {meeting.project?.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Upcoming Meetings List */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Today's Meetings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {meetings
              .filter((m) => isSameDay(parseISO(m.start_time), new Date()))
              .map((meeting) => (
                <div key={meeting.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <div className={cn(
                    'p-2 rounded-lg',
                    meetingTypeStyles[meeting.meeting_type].split(' ')[0]
                  )}>
                    <Clock className={cn('h-4 w-4', meetingTypeStyles[meeting.meeting_type].split(' ')[1])} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{meeting.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(meeting.start_time), 'h:mm a')} - {format(parseISO(meeting.end_time), 'h:mm a')}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {meeting.location || 'TBD'}
                      </span>
                      <Badge variant="outline">{meeting.project?.name}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            {meetings.filter((m) => isSameDay(parseISO(m.start_time), new Date())).length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No meetings today</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Team Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.full_name}</p>
                </div>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  user.availability === 'available'
                    ? 'bg-success/10 text-success'
                    : 'bg-warning/10 text-warning'
                )}>
                  {user.availability}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
