import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Project } from '@/types';

export default function DashboardPage() {
  const { user, isManager } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI insights from API (empty for now)
  const insights: { id: string; type: 'warning' | 'suggestion' | 'success'; title: string; description: string; action?: string }[] = [];

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const data = await api.getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening across your projects today.
          </p>
        </div>
        {isManager && (
          <Button onClick={() => navigate('/projects/new')} className="gradient-primary text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Projects"
          value={isLoading ? '-' : projects.length}
          description={projects.length > 0 ? `${projects.length} active` : 'No projects yet'}
          icon={FolderKanban}
          variant="primary"
        />
        <StatsCard
          title="Tasks Completed"
          value={isLoading ? '-' : 0}
          description="This week"
          icon={CheckSquare}
          variant="success"
        />
        <StatsCard
          title="Team Members"
          value={isLoading ? '-' : 0}
          description="Across all projects"
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Productivity Score"
          value={isLoading ? '-' : '-'}
          description="No data yet"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Projects</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/projects')}
              className="text-muted-foreground hover:text-foreground"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              No projects yet. Create your first project to get started.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.slice(0, 4).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => navigate(`/projects/${project.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* AI Insights Sidebar */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">AI Pulse</h2>
          <AIInsightCard
            insights={insights}
            onAction={(insight) => {
              if (insight.action === 'View Capacity') {
                navigate('/capacity');
              } else if (insight.action === 'Schedule Meeting') {
                navigate('/calendar');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
