import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Task, TaskStatus, TaskPriority, Project, User } from '@/types';

const statusStyles = {
  todo: { bg: 'bg-muted', text: 'text-muted-foreground', icon: Circle },
  in_progress: { bg: 'bg-primary/10', text: 'text-primary', icon: Clock },
  done: { bg: 'bg-success/10', text: 'text-success', icon: CheckCircle2 },
};

const priorityStyles = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning',
};

export default function TasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  // New task form
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    project_id: '',
    assigned_to: '',
    due_date: '',
    estimated_hours: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [tasksData, projectsData, usersData] = await Promise.all([
          api.getTasks(),
          api.getProjects(),
          api.getUsers(),
        ]);
        setTasks(tasksData);
        setProjects(projectsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      toast({ title: 'Task updated', description: `Status changed to ${newStatus.replace('_', ' ')}` });
    } catch (error) {
      console.log('Failed to update task');
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.project_id) return;
    try {
      let dueDateValue: string | undefined = undefined;
      if (newTask.due_date) {
        dueDateValue = new Date(newTask.due_date).toISOString();
      }
      const created = await api.createTask({
        title: newTask.title,
        description: newTask.description || undefined,
        status: newTask.status,
        priority: newTask.priority,
        project_id: newTask.project_id,
        assigned_to: newTask.assigned_to || undefined,
        due_date: dueDateValue,
        estimated_hours: newTask.estimated_hours ? parseFloat(newTask.estimated_hours) : undefined,
      });
      setTasks((prev) => [created, ...prev]);
      setDialogOpen(false);
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', project_id: '', assigned_to: '', due_date: '', estimated_hours: '' });
      toast({ title: 'Task created' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create task', variant: 'destructive' });
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const groupedTasks = {
    todo: filteredTasks.filter((t) => t.status === 'todo'),
    in_progress: filteredTasks.filter((t) => t.status === 'in_progress'),
    done: filteredTasks.filter((t) => t.status === 'done'),
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage tasks across all your projects.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Add a new task to a project.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select
                    value={newTask.project_id}
                    onValueChange={(v) => setNewTask({ ...newTask, project_id: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(v) => setNewTask({ ...newTask, priority: v as TaskPriority })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select
                  value={newTask.assigned_to || 'unassigned'}
                  onValueChange={(v) => setNewTask({ ...newTask, assigned_to: v === 'unassigned' ? '' : v })}
                >
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Hours</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newTask.estimated_hours}
                    onChange={(e) => setNewTask({ ...newTask, estimated_hours: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <Button onClick={handleCreateTask} className="w-full gradient-primary text-white">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-6 md:grid-cols-3">
        {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((status) => {
          const style = statusStyles[status];
          const Icon = style.icon;
          return (
            <div key={status} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={cn('p-1.5 rounded-lg', style.bg)}>
                  <Icon className={cn('h-4 w-4', style.text)} />
                </div>
                <h2 className="font-semibold capitalize">{status.replace('_', ' ')}</h2>
                <Badge variant="secondary" className="ml-auto">{groupedTasks[status].length}</Badge>
              </div>
              <div className="space-y-3">
                {groupedTasks[status].map((task) => (
                  <Card key={task.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <Badge className={cn('text-xs', priorityStyles[task.priority])}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground">
                          {projects.find((p) => p.id === task.project_id)?.name || 'Unknown'}
                        </p>
                        {task.assigned_to ? (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(users.find((u) => u.id === task.assigned_to)?.full_name || 'UN')}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unassigned</span>
                        )}
                      </div>
                      {/* Quick status change */}
                      <Select
                        value={task.status}
                        onValueChange={(v) => handleStatusChange(task.id, v as TaskStatus)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                ))}
                {groupedTasks[status].length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
