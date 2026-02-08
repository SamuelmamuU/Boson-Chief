import { motion } from 'framer-motion';
import { 
  Activity, 
  Users, 
  Calendar,
  MessageSquare,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockProjects, mockStakeholders } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Project } from '@/types/enterprise';

interface ProjectGridProps {
  onSelectProject: (project: Project) => void;
}

export function ProjectGrid({ onSelectProject }: ProjectGridProps) {
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-success border-success/30 bg-success/10';
      case 'at-risk': return 'text-warning border-warning/30 bg-warning/10';
      case 'critical': return 'text-destructive border-destructive/30 bg-destructive/10';
      case 'blocked': return 'text-muted-foreground border-muted bg-muted/50';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'high': return 'bg-warning/10 text-warning border-warning/30';
      case 'medium': return 'bg-primary/10 text-primary border-primary/30';
      case 'low': return 'bg-muted text-muted-foreground border-muted';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'processing': return 'bg-warning animate-pulse';
      case 'idle': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Knowledge Cells</h2>
          <p className="text-muted-foreground">Project workspaces with Local IA integration</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockProjects.map((project, index) => {
          const projectStakeholders = mockStakeholders.filter(s => 
            project.stakeholders.includes(s.id)
          );

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => onSelectProject(project)}
              className="cursor-pointer"
            >
              <Card className={cn(
                "bg-card border-border hover:border-primary/30 transition-all duration-300 hover:shadow-glow overflow-hidden",
                "group"
              )}>
                {/* Gradient accent bar */}
                <div className={cn(
                  "h-1 w-full",
                  project.health === 'healthy' && "bg-gradient-to-r from-success to-accent",
                  project.health === 'at-risk' && "bg-gradient-to-r from-warning to-destructive",
                  project.health === 'critical' && "bg-gradient-to-r from-destructive to-warning",
                  project.health === 'blocked' && "bg-gradient-to-r from-muted to-muted-foreground"
                )} />
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                        <Badge variant="outline" className={getHealthColor(project.health)}>
                          {project.health}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      <span>{project.eventCount} events</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{projectStakeholders.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{project.lastActivity.toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Stakeholder Avatars & Local AI Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex -space-x-2">
                      {projectStakeholders.slice(0, 4).map((stakeholder) => (
                        <div
                          key={stakeholder.id}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-medium text-primary-foreground border-2 border-card"
                          title={stakeholder.name}
                        >
                          {stakeholder.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      ))}
                      {projectStakeholders.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-card">
                          +{projectStakeholders.length - 4}
                        </div>
                      )}
                    </div>
                    
                    {/* Local AI Status */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
                      <MessageSquare className="w-3.5 h-3.5 text-accent" />
                      <span className="text-xs font-medium text-muted-foreground">Local IA</span>
                      <span className={cn("status-dot", getAgentStatusColor(project.localAgentStatus))} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
