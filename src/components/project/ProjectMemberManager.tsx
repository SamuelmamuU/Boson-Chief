import { useState, useEffect } from 'react';
import { UserPlus, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface ProjectMemberManagerProps {
  projectId: string;
  managerId: string;
  currentMembers: User[];
  onMembersChanged: (members: User[]) => void;
}

export default function ProjectMemberManager({
  projectId,
  managerId,
  currentMembers,
  onMembersChanged,
}: ProjectMemberManagerProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await api.getUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const availableUsers = allUsers.filter(
    (user) => !currentMembers.some((m) => m.id === user.id)
  );

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    setIsLoading(true);
    try {
      await api.addProjectMember(projectId, selectedUserId);
      const newMember = allUsers.find((u) => u.id === selectedUserId);
      if (newMember) {
        onMembersChanged([...currentMembers, newMember]);
      }
      setSelectedUserId('');
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (userId === managerId) return; // Can't remove manager
    setIsLoading(true);
    try {
      await api.removeProjectMember(projectId, userId);
      onMembersChanged(currentMembers.filter((m) => m.id !== userId));
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Team Members ({currentMembers.length})</span>
      </div>

      {/* Current Members List */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {currentMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatar_url || ''} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(member.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{member.full_name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {member.id === managerId ? (
                <Badge variant="outline" className="text-xs">Manager</Badge>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Member */}
      {availableUsers.length > 0 && (
        <div className="flex items-center gap-2">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a person to add..." />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <span>{user.full_name}</span>
                    <span className="text-muted-foreground text-xs">({user.email})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="icon"
            onClick={handleAddMember}
            disabled={!selectedUserId || isLoading}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
