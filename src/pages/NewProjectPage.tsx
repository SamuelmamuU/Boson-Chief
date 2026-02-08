import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { User, ProjectPriority } from '@/types';

export default function NewProjectPage() {
  const { user, isManager } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ProjectPriority>('medium');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await api.getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  // If employee, auto-select only themselves
  useEffect(() => {
    if (!isManager && user) {
      setSelectedMembers([user.id]);
    }
  }, [isManager, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Filter out the manager from member_ids to avoid duplicates
      const membersToAdd = selectedMembers.filter(id => id !== user?.id);
      
      await api.createProject({
        name,
        description,
        priority,
        manager_id: user?.id || '',
        member_ids: membersToAdd,
      });
      toast({
        title: 'Project created',
        description: 'Your new project has been created successfully.',
      });
      navigate('/projects');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMember = (userId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!isManager) return; // Employees can't change selection
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/projects')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Project</CardTitle>
          <CardDescription>
            Set up a new project workspace for your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="e.g., Website Redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the project goals and scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as ProjectPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Label>Team Members</Label>
              </div>
              {!isManager && (
                <p className="text-sm text-muted-foreground">
                  As an employee, you'll be the only member of this project.
                </p>
              )}
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                {users.map((member) => {
                  const isDisabled = !isManager && member.id !== user?.id;
                  const isChecked = selectedMembers.includes(member.id);
                  return (
                    <label
                      key={member.id}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        disabled={isDisabled}
                        onCheckedChange={() => {
                          if (!isDisabled) {
                            toggleMember(member.id);
                          }
                        }}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url || ''} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(member.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.full_name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        member.availability === 'available' 
                          ? 'bg-success/10 text-success'
                          : member.availability === 'busy'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {member.availability}
                      </span>
                    </label>
                  );
                })}
              </div>
              {selectedMembers.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedMembers.length} member(s) selected
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/projects')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-white"
                disabled={isLoading || !name}
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
