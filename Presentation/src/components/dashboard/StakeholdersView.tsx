import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Minus,
  FolderKanban,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockStakeholders, mockProjects } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function StakeholdersView() {
  const getLoadColor = (load: number) => {
    if (load >= 80) return 'text-destructive';
    if (load >= 60) return 'text-warning';
    return 'text-success';
  };

  const getLoadBg = (load: number) => {
    if (load >= 80) return 'bg-destructive';
    if (load >= 60) return 'bg-warning';
    return 'bg-success';
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-success';
      case 'busy': return 'bg-warning';
      case 'focus': return 'bg-primary';
      case 'offline': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'border-primary/50 text-primary bg-primary/10';
      case 'manager': return 'border-accent/50 text-accent bg-accent/10';
      case 'developer': return 'border-success/50 text-success bg-success/10';
      case 'analyst': return 'border-warning/50 text-warning bg-warning/10';
      default: return 'border-muted text-muted-foreground bg-muted/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Stakeholders</h2>
          <p className="text-muted-foreground">Team members and cognitive load monitoring</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-muted-foreground">Busy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Focus</span>
          </div>
        </div>
      </div>

      {/* Stakeholder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockStakeholders.map((stakeholder, index) => {
          const projects = mockProjects.filter(p => 
            stakeholder.projectIds.includes(p.id)
          );

          const loadTrend = Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable';

          return (
            <motion.div
              key={stakeholder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-semibold text-primary-foreground">
                        {stakeholder.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className={cn(
                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card",
                        getAvailabilityColor(stakeholder.availability)
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{stakeholder.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={cn("text-xs", getRoleBadge(stakeholder.role))}>
                          {stakeholder.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{stakeholder.email}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Cognitive Load */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Cognitive Load</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("font-semibold", getLoadColor(stakeholder.cognitiveLoad))}>
                          {stakeholder.cognitiveLoad}%
                        </span>
                        {loadTrend === 'up' && <TrendingUp className="w-4 h-4 text-destructive" />}
                        {loadTrend === 'down' && <TrendingDown className="w-4 h-4 text-success" />}
                        {loadTrend === 'stable' && <Minus className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stakeholder.cognitiveLoad}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                        className={cn("h-full rounded-full", getLoadBg(stakeholder.cognitiveLoad))}
                      />
                    </div>
                    {stakeholder.cognitiveLoad >= 80 && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        ⚠️ High load detected - consider task redistribution
                      </p>
                    )}
                  </div>

                  {/* Projects */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FolderKanban className="w-4 h-4" />
                      <span>Assigned Projects ({projects.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {projects.map(project => (
                        <div 
                          key={project.id}
                          className="flex items-center justify-between text-sm p-2 rounded-lg bg-secondary/50 border border-border/50"
                        >
                          <span className="text-foreground truncate flex-1">{project.name}</span>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs ml-2",
                              project.health === 'healthy' && "border-success/50 text-success",
                              project.health === 'at-risk' && "border-warning/50 text-warning",
                              project.health === 'critical' && "border-destructive/50 text-destructive"
                            )}
                          >
                            {project.progress}%
                          </Badge>
                        </div>
                      ))}
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
