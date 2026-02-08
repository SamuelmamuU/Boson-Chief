import { useState, useMemo } from 'react';
import { startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  Sparkles,
  Lightbulb,
  GripVertical,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { MeetingCalendarGrid } from '@/components/meetings/MeetingCalendarGrid';
import { MeetingDialog } from '@/components/meetings/MeetingDialog';
import { useMeetings } from '@/hooks/useMeetings';
import type { Meeting, CreateMeetingRequest } from '@/types/api';

// Mock data for capacity planning
const mockResources = [
  { id: 'r1', name: 'Elena Rodríguez', role: 'Admin', availability: 40, avatarInitials: 'ER' },
  { id: 'r2', name: 'Marcus Chen', role: 'Manager', availability: 40, avatarInitials: 'MC' },
  { id: 'r3', name: 'Sarah Okonkwo', role: 'Developer', availability: 40, avatarInitials: 'SO' },
  { id: 'r4', name: 'Aleksandr Petrov', role: 'Analyst', availability: 40, avatarInitials: 'AP' },
  { id: 'r5', name: 'Priya Sharma', role: 'Developer', availability: 40, avatarInitials: 'PS' },
];

const mockProjects = [
  { id: 'p1', name: 'Enterprise Migration Q2', color: 'bg-primary' },
  { id: 'p2', name: 'AI Analytics Platform', color: 'bg-warning' },
  { id: 'p3', name: 'Mobile App Redesign', color: 'bg-success' },
  { id: 'p4', name: 'Security Compliance', color: 'bg-destructive' },
];

const mockAllocations: Record<string, Record<string, { projectId: string; hours: number }[]>> = {
  'r1': {
    'week-0': [{ projectId: 'p1', hours: 20 }, { projectId: 'p2', hours: 16 }],
    'week-1': [{ projectId: 'p1', hours: 32 }],
    'week-2': [{ projectId: 'p2', hours: 24 }, { projectId: 'p3', hours: 8 }],
    'week-3': [{ projectId: 'p1', hours: 16 }, { projectId: 'p4', hours: 24 }],
  },
  'r2': {
    'week-0': [{ projectId: 'p1', hours: 24 }, { projectId: 'p4', hours: 20 }],
    'week-1': [{ projectId: 'p4', hours: 40 }],
    'week-2': [{ projectId: 'p1', hours: 16 }, { projectId: 'p4', hours: 24 }],
    'week-3': [{ projectId: 'p4', hours: 32 }],
  },
  'r3': {
    'week-0': [{ projectId: 'p2', hours: 32 }],
    'week-1': [{ projectId: 'p2', hours: 24 }, { projectId: 'p3', hours: 16 }],
    'week-2': [{ projectId: 'p3', hours: 40 }],
    'week-3': [{ projectId: 'p2', hours: 20 }, { projectId: 'p3', hours: 20 }],
  },
  'r4': {
    'week-0': [{ projectId: 'p1', hours: 16 }, { projectId: 'p2', hours: 16 }],
    'week-1': [{ projectId: 'p1', hours: 24 }, { projectId: 'p4', hours: 8 }],
    'week-2': [{ projectId: 'p2', hours: 32 }],
    'week-3': [{ projectId: 'p1', hours: 16 }, { projectId: 'p2', hours: 16 }],
  },
  'r5': {
    'week-0': [{ projectId: 'p3', hours: 32 }, { projectId: 'p4', hours: 8 }],
    'week-1': [{ projectId: 'p3', hours: 40 }],
    'week-2': [{ projectId: 'p3', hours: 24 }, { projectId: 'p4', hours: 16 }],
    'week-3': [{ projectId: 'p4', hours: 40 }],
  },
};

function getWeekDates(weekOffset: number): { start: Date; end: Date; label: string } {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 4);
  
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return {
    start: startOfWeek,
    end: endOfWeek,
    label: `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`,
  };
}

export function CapacityPlanningView() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [draggedItem, setDraggedItem] = useState<{ resourceId: string; weekKey: string; projectId: string } | null>(null);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [defaultMeetingDate, setDefaultMeetingDate] = useState<Date | undefined>();

  // Calculate date range for meetings query
  const currentDate = useMemo(() => {
    const now = new Date();
    return addWeeks(now, weekOffset);
  }, [weekOffset]);
  
  const meetingStartDate = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const meetingEndDate = useMemo(() => endOfWeek(addWeeks(currentDate, 3), { weekStartsOn: 1 }), [currentDate]);

  const { meetings, isLoading: meetingsLoading, createMeeting, updateMeeting, isCreating, isUpdating } = useMeetings(
    meetingStartDate,
    meetingEndDate
  );

  const handleCreateMeeting = (date?: Date) => {
    setSelectedMeeting(null);
    setDefaultMeetingDate(date);
    setMeetingDialogOpen(true);
  };

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setDefaultMeetingDate(undefined);
    setMeetingDialogOpen(true);
  };

  const handleMeetingSubmit = (data: CreateMeetingRequest) => {
    if (selectedMeeting) {
      updateMeeting({ id: selectedMeeting.id, ...data });
    } else {
      createMeeting(data);
    }
    setMeetingDialogOpen(false);
  };

  const weeks = useMemo(() => {
    return [0, 1, 2, 3].map(i => ({
      key: `week-${i}`,
      ...getWeekDates(weekOffset + i),
    }));
  }, [weekOffset]);

  const getProjectById = (id: string) => mockProjects.find(p => p.id === id);

  const getTotalHours = (resourceId: string, weekKey: string) => {
    const allocations = mockAllocations[resourceId]?.[weekKey] || [];
    return allocations.reduce((sum, a) => sum + a.hours, 0);
  };

  const getUtilization = (hours: number, availability: number) => {
    return Math.round((hours / availability) * 100);
  };

  const handleDragStart = (resourceId: string, weekKey: string, projectId: string) => {
    setDraggedItem({ resourceId, weekKey, projectId });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Capacity Planning</h2>
          <p className="text-muted-foreground">Resource allocation and workload management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset(w => w - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => setWeekOffset(0)}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset(w => w + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Insights Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">AI Recommendation</h4>
              <p className="text-sm text-muted-foreground">
                <Lightbulb className="w-4 h-4 inline mr-1 text-warning" />
                Marcus Chen is over-allocated by 20% next week. Consider reassigning Security Compliance tasks to Priya Sharma who has 8 hours available.
              </p>
            </div>
            <Button size="sm" variant="secondary">Apply</Button>
          </div>
        </CardContent>
      </Card>

      {/* Project Legend */}
      <div className="flex flex-wrap gap-3">
        {mockProjects.map(project => (
          <Badge key={project.id} variant="outline" className="gap-2">
            <span className={cn("w-3 h-3 rounded-full", project.color)} />
            {project.name}
          </Badge>
        ))}
      </div>

      {/* Capacity Grid */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Resource Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary/30">
                  <th className="p-4 text-left font-medium text-foreground w-56 border-r border-border">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Resource
                    </div>
                  </th>
                  {weeks.map(week => (
                    <th key={week.key} className="p-4 text-center font-medium text-foreground min-w-[200px] border-r border-border last:border-r-0">
                      {week.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockResources.map((resource, idx) => {
                  return (
                    <motion.tr
                      key={resource.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-border last:border-b-0 hover:bg-secondary/20"
                    >
                      <td className="p-4 border-r border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-medium text-primary-foreground">
                            {resource.avatarInitials}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{resource.name}</p>
                            <p className="text-xs text-muted-foreground">{resource.role}</p>
                          </div>
                        </div>
                      </td>
                      {weeks.map(week => {
                        const allocations = mockAllocations[resource.id]?.[week.key] || [];
                        const totalHours = getTotalHours(resource.id, week.key);
                        const utilization = getUtilization(totalHours, resource.availability);
                        const isOverallocated = utilization > 100;

                        return (
                          <td 
                            key={week.key} 
                            className="p-2 border-r border-border last:border-r-0 align-top"
                          >
                            <div className="space-y-2">
                              {/* Utilization bar */}
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={Math.min(utilization, 100)} 
                                  className={cn(
                                    "h-2 flex-1",
                                    isOverallocated && "[&>div]:bg-destructive"
                                  )}
                                />
                                <span className={cn(
                                  "text-xs font-medium w-10 text-right",
                                  isOverallocated ? "text-destructive" : "text-muted-foreground"
                                )}>
                                  {utilization}%
                                </span>
                                {isOverallocated && (
                                  <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                                )}
                              </div>

                              {/* Project allocations */}
                              <div className="space-y-1">
                                {allocations.map((allocation, i) => {
                                  const project = getProjectById(allocation.projectId);
                                  if (!project) return null;

                                  return (
                                    <motion.div
                                      key={`${allocation.projectId}-${i}`}
                                      draggable
                                      onDragStart={() => handleDragStart(resource.id, week.key, allocation.projectId)}
                                      onDragEnd={handleDragEnd}
                                      whileHover={{ scale: 1.02 }}
                                      className={cn(
                                        "flex items-center gap-2 p-2 rounded-md cursor-grab active:cursor-grabbing",
                                        "bg-secondary/50 border border-border/50 hover:border-primary/30",
                                        draggedItem?.resourceId === resource.id && 
                                        draggedItem?.weekKey === week.key && 
                                        draggedItem?.projectId === allocation.projectId && 
                                        "opacity-50"
                                      )}
                                    >
                                      <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", project.color)} />
                                      <span className="text-xs text-foreground truncate flex-1">
                                        {project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name}
                                      </span>
                                      <span className="text-xs font-medium text-muted-foreground">
                                        {allocation.hours}h
                                      </span>
                                    </motion.div>
                                  );
                                })}
                              </div>

                              {/* Total hours */}
                              <p className="text-xs text-muted-foreground text-right">
                                {totalHours}/{resource.availability}h
                              </p>
                            </div>
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Calendar Grid */}
      <MeetingCalendarGrid
        meetings={meetings}
        onCreateMeeting={handleCreateMeeting}
        onMeetingClick={handleMeetingClick}
        isLoading={meetingsLoading}
      />

      {/* Meeting Dialog */}
      <MeetingDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        meeting={selectedMeeting}
        onSubmit={handleMeetingSubmit}
        isSubmitting={isCreating || isUpdating}
        defaultDate={defaultMeetingDate}
      />
    </div>
  );
}
