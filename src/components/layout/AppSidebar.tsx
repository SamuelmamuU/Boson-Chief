import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Users,
  MessageSquare,
  LogOut,
  Rocket,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/use-theme';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Capacity', href: '/capacity', icon: Users },
  { name: 'AI Assistant', href: '/chat', icon: MessageSquare },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-ai">
          <Rocket className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Boson Chief</h1>
          <p className="text-xs text-sidebar-foreground/60">Enterprise Hub</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
              {item.name === 'AI Assistant' && (
                <Sparkles className="ml-auto h-4 w-4 text-accent" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
          <Avatar className="h-10 w-10 border-2 border-sidebar-primary">
            <AvatarImage src={user?.avatar_url || ''} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
              {user?.full_name ? getInitials(user.full_name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.roles?.includes('manager') ? 'Manager' : 'Employee'}
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-8 w-8 text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Toggle theme</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-8 w-8 text-sidebar-foreground/60 hover:text-white hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Logout</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
