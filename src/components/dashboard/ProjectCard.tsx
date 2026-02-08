import { FolderKanban, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  memberCount?: number;
  onClick?: () => void;
}

const healthStyles = {
  healthy: 'bg-success/10 text-success border-success/20',
  'at-risk': 'bg-warning/10 text-warning border-warning/20',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
  blocked: 'bg-muted text-muted-foreground border-muted',
};

const priorityStyles = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning',
  critical: 'bg-destructive/10 text-destructive',
};

export function ProjectCard({ project, memberCount, onClick }: ProjectCardProps) {
  return (
    <Card
      className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                {project.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                {project.description}
              </p>
            </div>
          </div>
          <Badge className={cn('font-medium', priorityStyles[project.priority])}>
            {project.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <Badge variant="outline" className={cn('font-medium', healthStyles[project.health])}>
            {project.health.replace('-', ' ')}
          </Badge>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{memberCount ?? '-'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>2d</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
