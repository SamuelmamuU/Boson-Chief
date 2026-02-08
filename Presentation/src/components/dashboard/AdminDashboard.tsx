import { motion } from 'framer-motion';
import { 
  TrendingUp,
  Users,
  FolderKanban,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock KPI data
const kpiData = {
  totalProjects: 4,
  activeProjects: 3,
  completedTasks: 156,
  pendingTasks: 42,
  totalStakeholders: 5,
  avgProjectHealth: 72,
  onTimeDelivery: 85,
  resourceUtilization: 78,
};

const projectStats = [
  { name: 'Enterprise Migration Q2', health: 'healthy', progress: 68, trend: 'up' },
  { name: 'AI Analytics Platform', health: 'at-risk', progress: 42, trend: 'down' },
  { name: 'Mobile App Redesign', health: 'healthy', progress: 85, trend: 'up' },
  { name: 'Security Compliance', health: 'critical', progress: 23, trend: 'down' },
];

const recentActivity = [
  { type: 'milestone', message: 'Phase 2 Database Migration Complete', time: '2h ago', project: 'Enterprise Migration' },
  { type: 'alert', message: 'Resource Conflict Detected', time: '4h ago', project: 'AI Analytics' },
  { type: 'update', message: 'Design Review Session scheduled', time: '6h ago', project: 'Mobile Redesign' },
  { type: 'insight', message: 'Optimization opportunity identified', time: '8h ago', project: 'Enterprise Migration' },
];

export function AdminDashboard() {
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-success';
      case 'at-risk': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getHealthBg = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-success/10 border-success/30';
      case 'at-risk': return 'bg-warning/10 border-warning/30';
      case 'critical': return 'bg-destructive/10 border-destructive/30';
      default: return 'bg-muted border-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Executive Dashboard</h2>
        <p className="text-muted-foreground">Global KPIs and organizational performance</p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {kpiData.activeProjects}/{kpiData.totalProjects}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FolderKanban className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {kpiData.completedTasks}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpiData.pendingTasks} pending
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {kpiData.onTimeDelivery}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-warning" />
                </div>
              </div>
              <Progress value={kpiData.onTimeDelivery} className="h-2 mt-4" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resource Utilization</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {kpiData.resourceUtilization}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
              </div>
              <Progress value={kpiData.resourceUtilization} className="h-2 mt-4" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Project Health Overview and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Health */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Project Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectStats.map((project, idx) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getHealthBg(project.health), getHealthColor(project.health))}
                        >
                          {project.health}
                        </Badge>
                        {project.trend === 'up' ? (
                          <ArrowUp className="w-4 h-4 text-success" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={project.progress} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-8">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    activity.type === 'milestone' && "bg-success/10",
                    activity.type === 'alert' && "bg-destructive/10",
                    activity.type === 'update' && "bg-primary/10",
                    activity.type === 'insight' && "bg-warning/10"
                  )}>
                    {activity.type === 'milestone' && <CheckCircle2 className="w-4 h-4 text-success" />}
                    {activity.type === 'alert' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                    {activity.type === 'update' && <Clock className="w-4 h-4 text-primary" />}
                    {activity.type === 'insight' && <TrendingUp className="w-4 h-4 text-warning" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.project}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stakeholder Performance */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { name: 'Elena Rodríguez', role: 'Admin', load: 72, tasks: 12 },
              { name: 'Marcus Chen', role: 'Manager', load: 85, tasks: 8 },
              { name: 'Sarah Okonkwo', role: 'Developer', load: 45, tasks: 15 },
              { name: 'Aleksandr Petrov', role: 'Analyst', load: 60, tasks: 10 },
              { name: 'Priya Sharma', role: 'Developer', load: 35, tasks: 7 },
            ].map((person, idx) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-lg bg-secondary/30 border border-border/50 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-medium text-primary-foreground mx-auto mb-3">
                  {person.name.split(' ').map(n => n[0]).join('')}
                </div>
                <p className="text-sm font-medium text-foreground">{person.name}</p>
                <p className="text-xs text-muted-foreground mb-3">{person.role}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Load</span>
                    <span className={cn(
                      "font-medium",
                      person.load > 80 ? "text-destructive" : person.load > 60 ? "text-warning" : "text-success"
                    )}>
                      {person.load}%
                    </span>
                  </div>
                  <Progress 
                    value={person.load} 
                    className={cn(
                      "h-1.5",
                      person.load > 80 && "[&>div]:bg-destructive",
                      person.load > 60 && person.load <= 80 && "[&>div]:bg-warning"
                    )}
                  />
                  <p className="text-xs text-muted-foreground">{person.tasks} active tasks</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
