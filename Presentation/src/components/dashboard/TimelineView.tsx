import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Users,
  Sparkles,
  MessageSquare,
  Flag,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockEvents, mockProjects } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Event } from '@/types/enterprise';
import { MeetingDialog } from '@/components/meetings/MeetingDialog';
import { useMeetings } from '@/hooks/useMeetings';
import type { Meeting, CreateMeetingRequest } from '@/types/api';

export function TimelineView() {
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  
  const { createMeeting, updateMeeting, isCreating, isUpdating } = useMeetings();

  const sortedEvents = [...mockEvents].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  const handleCreateMeeting = () => {
    setSelectedMeeting(null);
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

  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'meeting': return MessageSquare;
      case 'milestone': return Flag;
      case 'decision': return CheckCircle;
      case 'conflict': return AlertTriangle;
      case 'insight': return Lightbulb;
      case 'update': return Clock;
      case 'alert': return AlertTriangle;
      default: return Clock;
    }
  };

  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case 'meeting': return 'text-primary bg-primary/10 border-primary/30';
      case 'milestone': return 'text-success bg-success/10 border-success/30';
      case 'decision': return 'text-accent bg-accent/10 border-accent/30';
      case 'conflict': return 'text-destructive bg-destructive/10 border-destructive/30';
      case 'insight': return 'text-warning bg-warning/10 border-warning/30';
      case 'update': return 'text-muted-foreground bg-muted/50 border-muted';
      case 'alert': return 'text-destructive bg-destructive/10 border-destructive/30';
      default: return 'text-muted-foreground bg-muted/50 border-muted';
    }
  };

  const getLineColor = (type: Event['type']) => {
    switch (type) {
      case 'milestone': return 'bg-success';
      case 'conflict': 
      case 'alert': return 'bg-destructive';
      case 'insight': return 'bg-warning';
      default: return 'bg-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Event Timeline</h2>
          <p className="text-muted-foreground">Chronological view of all enterprise events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleCreateMeeting}>
            <Plus className="w-4 h-4 mr-1" />
            Schedule Meeting
          </Button>
          <Badge variant="outline" className="gap-1.5">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>AI-generated</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <Users className="w-3 h-3" />
            <span>Manual</span>
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Today's Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-6">
              {sortedEvents.map((event, index) => {
                const Icon = getEventIcon(event.type);
                const project = mockProjects.find(p => p.id === event.projectId);

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-14"
                  >
                    {/* Timeline node */}
                    <div className={cn(
                      "absolute left-3 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10",
                      getEventColor(event.type)
                    )}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {/* Connecting line accent */}
                    <div className={cn(
                      "absolute left-[23px] w-1 h-full -top-3",
                      index > 0 ? getLineColor(sortedEvents[index - 1].type) : "bg-transparent"
                    )} style={{ height: '12px' }} />

                    {/* Event card */}
                    <div className={cn(
                      "p-4 rounded-lg border transition-all hover:shadow-lg cursor-pointer",
                      "bg-secondary/30 border-border/50 hover:border-primary/30"
                    )}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">{event.title}</h4>
                          {event.aiGenerated && (
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-xs", getEventColor(event.type))}>
                            {event.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Project:</span>
                          <Badge variant="outline" className="text-xs">
                            {project?.name || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{event.stakeholders.length} stakeholders</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Dialog */}
      <MeetingDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        meeting={selectedMeeting}
        onSubmit={handleMeetingSubmit}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
}
