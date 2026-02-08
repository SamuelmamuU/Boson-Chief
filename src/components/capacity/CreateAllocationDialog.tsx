import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import type { User, Project, CapacityAllocation } from '@/types';

interface CreateAllocationDialogProps {
  users: User[];
  projects: Project[];
  weekStart: string;
  onAllocationCreated: (allocation: CapacityAllocation) => void;
}

export default function CreateAllocationDialog({
  users,
  projects,
  weekStart,
  onAllocationCreated,
}: CreateAllocationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    profile_id: '',
    project_id: '',
    hours_allocated: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.profile_id || !formData.project_id || !formData.hours_allocated) return;

    setIsSubmitting(true);
    try {
      const allocation = await api.createCapacityAllocation({
        profile_id: formData.profile_id,
        project_id: formData.project_id,
        week_start: weekStart,
        hours_allocated: parseFloat(formData.hours_allocated),
      });
      onAllocationCreated(allocation);
      setOpen(false);
      setFormData({
        profile_id: '',
        project_id: '',
        hours_allocated: '',
      });
    } catch (error) {
      console.error('Failed to create allocation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gradient-primary text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Allocation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Allocate Hours</DialogTitle>
            <DialogDescription>
              Assign work hours to a team member for a specific project this week.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Team Member *</Label>
              <Select
                value={formData.profile_id}
                onValueChange={(value) => setFormData({ ...formData, profile_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Project *</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => setFormData({ ...formData, project_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hours">Hours to Allocate *</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="40"
                step="0.5"
                value={formData.hours_allocated}
                onChange={(e) => setFormData({ ...formData, hours_allocated: e.target.value })}
                placeholder="e.g., 20"
                required
              />
              <p className="text-xs text-muted-foreground">
                Maximum 40 hours per week per person
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.profile_id || !formData.project_id || !formData.hours_allocated}
            >
              {isSubmitting ? 'Creating...' : 'Allocate Hours'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
