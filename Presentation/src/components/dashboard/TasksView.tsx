import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  ArrowUpDown,
  Calendar,
  FolderKanban,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Mock tasks data
const mockTasks = [
  {
    id: 't1',
    title: 'Complete API integration for analytics module',
    description: 'Integrate the real-time data pipeline with the dashboard',
    project: 'AI Analytics Platform',
    projectColor: 'bg-warning',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date('2024-02-08'),
    estimatedHours: 8,
  },
  {
    id: 't2',
    title: 'Review security compliance documentation',
    description: 'Ensure all SOC2 requirements are documented',
    project: 'Security Compliance Audit',
    projectColor: 'bg-destructive',
    status: 'pending',
    priority: 'critical',
    dueDate: new Date('2024-02-10'),
    estimatedHours: 4,
  },
  {
    id: 't3',
    title: 'Design mobile navigation patterns',
    description: 'Create wireframes for the new bottom navigation',
    project: 'Mobile App Redesign',
    projectColor: 'bg-success',
    status: 'completed',
    priority: 'medium',
    dueDate: new Date('2024-02-05'),
    estimatedHours: 6,
  },
  {
    id: 't4',
    title: 'Database migration scripts',
    description: 'Write and test migration scripts for Phase 3',
    project: 'Enterprise Migration Q2',
    projectColor: 'bg-primary',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date('2024-02-12'),
    estimatedHours: 12,
  },
  {
    id: 't5',
    title: 'Performance testing setup',
    description: 'Configure load testing environment',
    project: 'Enterprise Migration Q2',
    projectColor: 'bg-primary',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date('2024-02-15'),
    estimatedHours: 5,
  },
  {
    id: 't6',
    title: 'User acceptance testing coordination',
    description: 'Coordinate with stakeholders for UAT sessions',
    project: 'Mobile App Redesign',
    projectColor: 'bg-success',
    status: 'blocked',
    priority: 'high',
    dueDate: new Date('2024-02-20'),
    estimatedHours: 3,
  },
];

type SortField = 'priority' | 'dueDate' | 'status';
type StatusFilter = 'all' | 'pending' | 'in-progress' | 'completed' | 'blocked';

const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
const statusOrder = { blocked: 0, 'in-progress': 1, pending: 2, completed: 3 };

export function TasksView() {
  const [sortBy, setSortBy] = useState<SortField>('priority');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredTasks = mockTasks.filter(task => 
    statusFilter === 'all' || task.status === statusFilter
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    }
    if (sortBy === 'dueDate') {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    if (sortBy === 'status') {
      return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
    }
    return 0;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-primary" />;
      case 'blocked': return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success border-success/30';
      case 'in-progress': return 'bg-primary/10 text-primary border-primary/30';
      case 'blocked': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'high': return 'bg-warning/10 text-warning border-warning/30';
      case 'medium': return 'bg-primary/10 text-primary border-primary/30';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  // KPI calculations
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = mockTasks.filter(t => t.status === 'in-progress').length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">My Tasks</h2>
          <p className="text-muted-foreground">All assigned tasks across projects</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                {statusFilter === 'all' ? 'All Status' : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('in-progress')}>In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('completed')}>Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('blocked')}>Blocked</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Sort by {sortBy}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('priority')}>Priority</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('dueDate')}>Due Date</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('status')}>Status</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedTasks}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{inProgressTasks}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-sm font-medium text-foreground">{completionRate}%</p>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary" />
            Task List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {sortedTasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getStatusIcon(task.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="font-medium text-foreground">{task.title}</h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className={cn("text-xs", getStatusColor(task.status))}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", task.projectColor)} />
                        {task.project}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {task.dueDate.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedHours}h estimated
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
