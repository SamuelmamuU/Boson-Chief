import { useMemo, useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Video, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Meeting, MeetingType } from '@/types/api';

interface MeetingCalendarGridProps {
  meetings: Meeting[];
  onCreateMeeting: (date?: Date) => void;
  onMeetingClick: (meeting: Meeting) => void;
  isLoading?: boolean;
}

const MEETING_TYPE_STYLES: Record<MeetingType, { bg: string; border: string; icon: typeof Video }> = {
  internal: { bg: 'bg-primary/10', border: 'border-primary/30', icon: Users },
  external: { bg: 'bg-warning/10', border: 'border-warning/30', icon: Video },
  review: { bg: 'bg-success/10', border: 'border-success/30', icon: Calendar },
  standup: { bg: 'bg-accent/20', border: 'border-accent/30', icon: Clock },
};

export function MeetingCalendarGrid({
  meetings,
  onCreateMeeting,
  onMeetingClick,
  isLoading,
}: MeetingCalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekDays = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);

  const meetingsByDay = useMemo(() => {
    const grouped: Record<string, Meeting[]> = {};
    meetings.forEach(meeting => {
      const dateKey = format(new Date(meeting.start_time), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(meeting);
    });
    // Sort each day's meetings by start time
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
    });
    return grouped;
  }, [meetings]);

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <Card className="bg-card border-border">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Meeting Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button size="sm" onClick={() => onCreateMeeting()}>
              <Plus className="w-4 h-4 mr-1" />
              New Meeting
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-7 divide-x divide-border">
            {weekDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayMeetings = meetingsByDay[dateKey] || [];
              const isCurrentDay = isToday(day);

              return (
                <div key={dateKey} className="min-h-[200px]">
                  {/* Day Header */}
                  <div
                    className={cn(
                      'p-3 text-center border-b border-border',
                      isCurrentDay && 'bg-primary/5'
                    )}
                  >
                    <p className="text-xs text-muted-foreground uppercase">
                      {format(day, 'EEE')}
                    </p>
                    <p
                      className={cn(
                        'text-lg font-semibold mt-1',
                        isCurrentDay
                          ? 'w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto'
                          : 'text-foreground'
                      )}
                    >
                      {format(day, 'd')}
                    </p>
                  </div>

                  {/* Day Content */}
                  <div className="p-2 space-y-1.5">
                    {dayMeetings.length === 0 ? (
                      <button
                        onClick={() => onCreateMeeting(day)}
                        className="w-full h-12 border-2 border-dashed border-border/50 rounded-md flex items-center justify-center text-muted-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        {dayMeetings.slice(0, 3).map((meeting, mIdx) => {
                          const styles = MEETING_TYPE_STYLES[meeting.meeting_type] || MEETING_TYPE_STYLES.internal;
                          const Icon = styles.icon;

                          return (
                            <motion.button
                              key={meeting.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: mIdx * 0.05 }}
                              onClick={() => onMeetingClick(meeting)}
                              className={cn(
                                'w-full p-2 rounded-md text-left border transition-all',
                                'hover:shadow-md hover:scale-[1.02]',
                                styles.bg,
                                styles.border
                              )}
                            >
                              <div className="flex items-start gap-1.5">
                                <Icon className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-foreground truncate">
                                    {meeting.title}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {format(new Date(meeting.start_time), 'h:mm a')}
                                  </p>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                        {dayMeetings.length > 3 && (
                          <button
                            onClick={() => onCreateMeeting(day)}
                            className="w-full text-xs text-muted-foreground hover:text-foreground py-1"
                          >
                            +{dayMeetings.length - 3} more
                          </button>
                        )}
                        {dayMeetings.length <= 3 && (
                          <button
                            onClick={() => onCreateMeeting(day)}
                            className="w-full h-8 border border-dashed border-border/50 rounded-md flex items-center justify-center text-muted-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="p-3 border-t border-border flex flex-wrap gap-3">
          {Object.entries(MEETING_TYPE_STYLES).map(([type, styles]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded-full', styles.bg, 'border', styles.border)} />
              <span className="text-xs text-muted-foreground capitalize">{type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
