import { useState, useEffect } from 'react';
import { Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import ProjectMemberManager from './ProjectMemberManager';
import type { Project, ProjectHealth, ProjectPriority, User } from '@/types';

interface ProjectSettingsDialogProps {
  project: Project;
  members: User[];
  onProjectUpdated: (project: Project) => void;
  onProjectDeleted: () => void;
  onMembersChanged: (members: User[]) => void;
}

export default function ProjectSettingsDialog({
  project,
  members,
  onProjectUpdated,
  onProjectDeleted,
  onMembersChanged,
}: ProjectSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    health: project.health as ProjectHealth,
    priority: project.priority as ProjectPriority,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const updated = await api.updateProject(project.id, {
        name: formData.name,
        description: formData.description || undefined,
        health: formData.health,
        priority: formData.priority,
      });
      onProjectUpdated(updated);
      setOpen(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteProject(project.id);
      onProjectDeleted();
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Project Settings</DialogTitle>
            <DialogDescription>
              Update project details or delete the project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Project name..."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Project description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Health Status</Label>
                <Select
                  value={formData.health}
                  onValueChange={(value: ProjectHealth) => setFormData({ ...formData, health: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: ProjectPriority) => setFormData({ ...formData, priority: value })}
                >
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
            </div>

            <Separator className="my-2" />

            {/* Team Members Section */}
            <ProjectMemberManager
              projectId={project.id}
              managerId={project.manager_id}
              currentMembers={members}
              onMembersChanged={onMembersChanged}
            />
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project
                    and all associated tasks, events, and meetings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
