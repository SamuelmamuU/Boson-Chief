import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Project, ProjectHealth, ProjectPriority } from '@/types';

export default function ProjectsPage() {
  const { isManager } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState<ProjectHealth | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const data = await api.getProjects();
        setProjects(data);
        
        // Load member counts for each project
        const counts: Record<string, number> = {};
        await Promise.all(
          data.map(async (project) => {
            try {
              const members = await api.getProjectMembers(project.id);
              counts[project.id] = members.length;
            } catch {
              counts[project.id] = 0;
            }
          })
        );
        setMemberCounts(counts);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase());
    const matchesHealth = healthFilter === 'all' || project.health === healthFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    return matchesSearch && matchesHealth && matchesPriority;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all your projects in one place.
          </p>
        </div>
        {isManager && (
          <Button onClick={() => navigate('/projects/new')} className="gradient-primary text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={healthFilter} onValueChange={(v) => setHealthFilter(v as ProjectHealth | 'all')}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Health" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Health</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as ProjectPriority | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border rounded-lg p-1 bg-muted/50">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            memberCount={memberCounts[project.id]}
            onClick={() => navigate(`/projects/${project.id}`)}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
