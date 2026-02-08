import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { User, Project, Task, Meeting } from '@/types';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from 'date-fns';

const MAX_WEEKLY_HOURS = 40;

export default function CapacityPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [usersData, projectsData, tasksData, meetingsData] = await Promise.all([
          api.getUsers(),
          api.getProjects(),
          api.getTasks(),
          api.getMeetings(weekStart.toISOString(), weekEnd.toISOString()),
        ]);
        setUsers(usersData);
        setProjects(projectsData);
        setTasks(tasksData);
        setMeetings(meetingsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [weekStartStr]);

  // Get tasks assigned to user with due_date in the current week (exclude completed tasks)
  const getUserTasksForWeek = (userId: string) => {
    return tasks.filter((task) => {
      if (task.assigned_to !== userId || !task.due_date) return false;
      if (task.status === 'done') return false; // Don't count completed tasks
      const dueDate = parseISO(task.due_date);
      return dueDate >= weekStart && dueDate <= weekEnd;
    });
  };

  // Calculate total estimated hours from tasks
  const getUserTotalHours = (userId: string) => {
    return getUserTasksForWeek(userId).reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const overallocatedUsers = users.filter((u) => getUserTotalHours(u.id) > MAX_WEEKLY_HOURS);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Capacity Planning</h1>
          <p className="text-muted-foreground mt-1">
            Team workload calculated from task assignments.
          </p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <h2 className="text-xl font-semibold">
          Week of {format(weekStart, 'MMM d, yyyy')}
        </h2>
        <Button variant="outline" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Alert for overallocated */}
      {overallocatedUsers.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="py-4 flex items-center gap-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-warning">Overallocation Detected</p>
              <p className="text-sm text-muted-foreground">
                {overallocatedUsers.map((u) => u.full_name).join(', ')} exceed{overallocatedUsers.length === 1 ? 's' : ''} {MAX_WEEKLY_HOURS}h weekly capacity.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team View
          </TabsTrigger>
          <TabsTrigger value="calendar">
            Calendar
          </TabsTrigger>
        </TabsList>

        {/* Team View */}
        <TabsContent value="team" className="space-y-6">
          <div className="grid gap-4">
            {users.map((user) => {
              const totalHours = getUserTotalHours(user.id);
              const percentage = Math.min((totalHours / MAX_WEEKLY_HOURS) * 100, 100);
              const isOverallocated = totalHours > MAX_WEEKLY_HOURS;
              const userTasks = getUserTasksForWeek(user.id);

              return (
                <Card key={user.id} className="border-0 shadow-sm">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.full_name}</h3>
                          {isOverallocated && (
                            <Badge variant="destructive" className="text-xs">Overallocated</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-2xl font-bold', isOverallocated && 'text-destructive')}>
                          {totalHours}h
                        </p>
                        <p className="text-sm text-muted-foreground">of {MAX_WEEKLY_HOURS}h</p>
                      </div>
                    </div>
                    <Progress
                      value={percentage}
                      className={cn('h-2', isOverallocated && '[&>div]:bg-destructive')}
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                      {userTasks.map((task) => {
                        const project = projects.find((p) => p.id === task.project_id);
                        return (
                          <Badge key={task.id} variant="secondary" className="text-xs">
                            {task.title} ({project?.name}): {task.estimated_hours || 0}h
                          </Badge>
                        );
                      })}
                      {userTasks.length === 0 && (
                        <span className="text-sm text-muted-foreground">No tasks due this week</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-8 border-b bg-muted/50">
                  <div className="p-3 text-sm font-medium text-muted-foreground">Team</div>
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
                        'text-lg font-bold',
                        isSameDay(day, new Date()) && 'text-primary'
                      )}>
                        {format(day, 'd')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Team rows */}
                {users.map((user) => (
                  <div key={user.id} className="grid grid-cols-8 border-b last:border-0">
                    <div className="p-3 flex items-center gap-2 border-r">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">{user.full_name}</span>
                    </div>
                    {weekDays.map((day) => {
                      const dayMeetings = meetings.filter((m) => {
                        const hasParticipant = m.participants?.some((p) => p.profile_id === user.id);
                        return hasParticipant && isSameDay(parseISO(m.start_time), day);
                      });
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
                              className="p-1 mb-1 text-xs bg-primary/10 text-primary rounded truncate"
                            >
                              {meeting.title}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
