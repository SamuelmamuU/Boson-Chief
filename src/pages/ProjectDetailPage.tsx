import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  CheckSquare,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import CreateTaskDialog from '@/components/project/CreateTaskDialog';
import ProjectSettingsDialog from '@/components/project/ProjectSettingsDialog';
import ProjectTimeline from '@/components/project/ProjectTimeline';
import type { Project, Task, User, ProjectEvent } from '@/types';

const healthStyles = {
  healthy: 'bg-success/10 text-success border-success/20',
  'at-risk': 'bg-warning/10 text-warning border-warning/20',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
  blocked: 'bg-muted text-muted-foreground border-muted',
};

const statusStyles = {
  todo: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/10 text-primary',
  done: 'bg-success/10 text-success',
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isManager } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progressValue, setProgressValue] = useState([0]);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [projectData, tasksData, membersData, eventsData] = await Promise.all([
          api.getProject(id),
          api.getProjectTasks(id),
          api.getProjectMembers(id),
          api.getProjectEvents(id),
        ]);
        setProject(projectData);
        setTasks(tasksData);
        setMembers(membersData);
        setEvents(eventsData);
        setProgressValue([projectData.progress]);
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleProgressUpdate = async (value: number[]) => {
    if (!project) return;
    setProgressValue(value);
    try {
      await api.updateProject(project.id, { progress: value[0] });
      setProject({ ...project, progress: value[0] });
    } catch (error) {
      console.log('Failed to update progress');
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <div className="py-12 text-center text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <div className="py-12 text-center text-muted-foreground">Project not found.</div>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Button variant="ghost" className="mb-6" onClick={() => navigate('/projects')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>

      {/* Project Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge className={cn('font-medium', healthStyles[project.health])}>
              {project.health.replace('-', ' ')}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl">{project.description}</p>
        </div>
        {isManager && (
          <ProjectSettingsDialog
            project={project}
            members={members}
            onProjectUpdated={(updated) => setProject(updated)}
            onProjectDeleted={() => navigate('/projects')}
            onMembersChanged={setMembers}
          />
        )}
      </div>

      {/* Progress Section */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Project Progress</h3>
              <p className="text-sm text-muted-foreground">
                {completedTasks} of {tasks.length} tasks completed ({taskProgress}% based on tasks)
              </p>
            </div>
            <span className="text-3xl font-bold text-primary">{progressValue[0]}%</span>
          </div>
          <Slider
            value={progressValue}
            onValueChange={setProgressValue}
            onValueCommit={handleProgressUpdate}
            max={100}
            step={5}
            className="w-full"
            disabled={!isManager}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Not Started</span>
            <span>In Progress</span>
            <span>Complete</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="tasks" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="ai-chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <CreateTaskDialog
              projectId={project.id}
              members={members}
              onTaskCreated={(task) => setTasks([...tasks, task])}
            />
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge className={cn('font-medium', statusStyles[task.status])}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      {task.due_date && (
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {task.assigned_to && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(members.find((m) => m.id === task.assigned_to)?.full_name || 'UN')}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <h2 className="text-xl font-semibold">Team Members</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={member.id} className="border-0 shadow-sm">
                <CardContent className="py-4 flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{member.full_name}</h4>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        member.roles.includes('manager') 
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {member.roles.includes('manager') ? 'Manager' : 'Employee'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        member.availability === 'available' 
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {member.availability}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <h2 className="text-xl font-semibold">Project Timeline</h2>
          <ProjectTimeline events={events} />
        </TabsContent>

        {/* AI Chat Tab */}
        <TabsContent value="ai-chat">
          <Card className="border-0 shadow-sm">
            <CardHeader className="gradient-ai rounded-t-lg">
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Local AI Agent - Project Context
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ask the Local AI about this project's details, status, or get suggestions.</p>
                <Button className="mt-4" variant="outline" onClick={() => navigate('/chat')}>
                  Open AI Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
