import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockGlobalInsights, mockProjects, mockStakeholders } from '@/data/mockData';
import { cn } from '@/lib/utils';

const statsCards = [
  {
    title: 'Active Projects',
    value: '4',
    change: '+1 this week',
    icon: TrendingUp,
    color: 'primary',
  },
  {
    title: 'Stakeholders',
    value: '5',
    subtitle: '3 available',
    icon: Users,
    color: 'accent',
  },
  {
    title: 'Events Today',
    value: '12',
    change: '3 AI-generated',
    icon: Zap,
    color: 'warning',
  },
  {
    title: 'Avg Cognitive Load',
    value: '59%',
    change: '+5% from avg',
    icon: Clock,
    color: 'destructive',
  },
];

export function GlobalPulse() {
  const healthyProjects = mockProjects.filter(p => p.health === 'healthy').length;
  const atRiskProjects = mockProjects.filter(p => p.health !== 'healthy').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Global Pulse</h2>
          <p className="text-muted-foreground">Enterprise-wide insights from Global IA</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <span className="status-dot bg-primary" />
          <span className="text-sm font-medium text-primary">Global IA Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-semibold text-foreground mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.change || stat.subtitle}
                      </p>
                    </div>
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      stat.color === 'primary' && "bg-primary/10",
                      stat.color === 'accent' && "bg-accent/10",
                      stat.color === 'warning' && "bg-warning/10",
                      stat.color === 'destructive' && "bg-destructive/10"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        stat.color === 'primary' && "text-primary",
                        stat.color === 'accent' && "text-accent",
                        stat.color === 'warning' && "text-warning",
                        stat.color === 'destructive' && "text-destructive"
                      )} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Health Overview & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Health */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Project Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-medium text-foreground">Healthy</span>
                </div>
                <span className="text-2xl font-semibold text-success">{healthyProjects}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span className="font-medium text-foreground">At Risk</span>
                </div>
                <span className="text-2xl font-semibold text-warning">{atRiskProjects}</span>
              </div>
              
              {/* Mini project list */}
              <div className="pt-4 border-t border-border space-y-2">
                {mockProjects.slice(0, 3).map(project => (
                  <div key={project.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate">{project.name}</span>
                    <Badge 
                      variant="outline" 
                      className={cn(
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
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning" />
                Global IA Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockGlobalInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={cn(
                    "p-4 rounded-lg border transition-all hover:shadow-lg cursor-pointer",
                    insight.severity === 'critical' && "bg-destructive/5 border-destructive/30 hover:border-destructive/50",
                    insight.severity === 'warning' && "bg-warning/5 border-warning/30 hover:border-warning/50",
                    insight.severity === 'info' && "bg-primary/5 border-primary/30 hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-foreground">{insight.title}</h4>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        insight.severity === 'critical' && "border-destructive text-destructive",
                        insight.severity === 'warning' && "border-warning text-warning",
                        insight.severity === 'info' && "border-primary text-primary"
                      )}
                    >
                      {insight.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                  {insight.actionable && insight.suggestedAction && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <ArrowRight className="w-4 h-4" />
                      <span>{insight.suggestedAction}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
