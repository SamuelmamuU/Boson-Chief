import { motion } from 'framer-motion';
import { 
  FolderKanban, 
  Users, 
  Calendar, 
  Brain, 
  Settings,
  Sparkles,
  Activity,
  LogOut,
  ClipboardList,
  LayoutDashboard,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('admin' | 'manager' | 'employee')[];
};

const navItems: NavItem[] = [
  { id: 'pulse', label: 'Global Pulse', icon: Activity, roles: ['admin', 'manager'] },
  { id: 'dashboard', label: 'KPI Dashboard', icon: TrendingUp, roles: ['admin'] },
  { id: 'projects', label: 'Projects', icon: FolderKanban, roles: ['admin', 'manager', 'employee'] },
  { id: 'capacity', label: 'Capacity Planning', icon: Calendar, roles: ['admin', 'manager'] },
  { id: 'tasks', label: 'My Tasks', icon: ClipboardList, roles: ['admin', 'manager', 'employee'] },
  { id: 'stakeholders', label: 'Stakeholders', icon: Users, roles: ['admin', 'manager'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'manager', 'employee'] },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { profile, roles, signOut, isAdmin, isManager } = useAuth();

  // Filter nav items based on user roles
  const visibleNavItems = navItems.filter(item => {
    if (isAdmin) return true;
    if (isManager && item.roles.includes('manager')) return true;
    if (item.roles.includes('employee')) return true;
    return false;
  });

  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleBadge = () => {
    if (isAdmin) return 'Admin';
    if (isManager) return 'Manager';
    return 'Employee';
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">NexusAI</h1>
            <p className="text-xs text-muted-foreground">Enterprise Admin</p>
          </div>
        </div>
      </div>

      {/* Agent Status */}
      <div className="p-4 mx-4 mt-4 rounded-lg bg-secondary/50 border border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Global IA</span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="status-dot bg-success" />
            <span className="text-xs text-muted-foreground">Active</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Monitoring 4 projects, 5 stakeholders
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-medium text-primary-foreground">
            {profile?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">{getRoleBadge()}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </motion.aside>
  );
}
