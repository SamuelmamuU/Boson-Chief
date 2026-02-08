import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Users,
  Flag,
  Sparkles,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectEvent, EventType } from '@/types';

interface ProjectTimelineProps {
  events: ProjectEvent[];
}

const eventConfig: Record<EventType, { icon: React.ElementType; color: string; bgColor: string }> = {
  meeting: { icon: Users, color: 'text-primary', bgColor: 'bg-primary/10' },
  milestone: { icon: Flag, color: 'text-success', bgColor: 'bg-success/10' },
  decision: { icon: CheckCircle, color: 'text-info', bgColor: 'bg-info/10' },
  conflict: { icon: AlertTriangle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  insight: { icon: Lightbulb, color: 'text-warning', bgColor: 'bg-warning/10' },
  update: { icon: MessageSquare, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  alert: { icon: Bell, color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

export default function ProjectTimeline({ events }: ProjectTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No events yet. Activity will appear here as the project progresses.</p>
      </div>
    );
  }

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = format(parseISO(event.created_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, ProjectEvent[]>);

  const sortedDates = Object.keys(groupedEvents).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-8">
        {sortedDates.map((date) => (
          <div key={date} className="relative">
            {/* Date header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative z-10 w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">
                {format(parseISO(date), "EEEE, d 'de' MMMM", { locale: es })}
              </h3>
            </div>

            {/* Events for this date */}
            <div className="ml-14 space-y-3">
              {groupedEvents[date].map((event) => {
                const config = eventConfig[event.type] || eventConfig.update;
                const Icon = config.icon;

                return (
                  <div
                    key={event.id}
                    className={cn(
                      'relative p-4 rounded-lg border transition-all hover:shadow-md',
                      event.ai_generated 
                        ? 'border-ai-global/30 bg-ai-global/5' 
                        : 'border-border bg-card'
                    )}
                  >
                    {/* Connection dot */}
                    <div 
                      className={cn(
                        'absolute -left-[2.65rem] top-5 w-3 h-3 rounded-full border-2 border-background',
                        config.bgColor
                      )} 
                    />

                    <div className="flex items-start gap-3">
                      <div className={cn('p-2 rounded-lg shrink-0', config.bgColor)}>
                        {event.ai_generated ? (
                          <Sparkles className="h-4 w-4 text-ai-global" />
                        ) : (
                          <Icon className={cn('h-4 w-4', config.color)} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{event.title}</h4>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full capitalize',
                            config.bgColor,
                            config.color
                          )}>
                            {event.type}
                          </span>
                          {event.ai_generated && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-ai-global/10 text-ai-global">
                              AI Generated
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(parseISO(event.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
