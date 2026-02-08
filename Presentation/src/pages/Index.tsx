import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { GlobalPulse } from '@/components/dashboard/GlobalPulse';
import { ProjectGrid } from '@/components/dashboard/ProjectGrid';
import { LocalAgentChat } from '@/components/dashboard/LocalAgentChat';
import { StakeholdersView } from '@/components/dashboard/StakeholdersView';
import { GlobalAgentChat } from '@/components/dashboard/GlobalAgentChat';
import { TimelineView } from '@/components/dashboard/TimelineView';
import { CapacityPlanningView } from '@/components/dashboard/CapacityPlanningView';
import { TasksView } from '@/components/dashboard/TasksView';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { Project } from '@/types/enterprise';
import { Card, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading, isAdmin, isManager } = useAuth();
  const [activeView, setActiveView] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Set default view based on role
  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        setActiveView('dashboard');
      } else if (isManager) {
        setActiveView('pulse');
      } else {
        setActiveView('projects');
      }
    }
  }, [loading, user, isAdmin, isManager]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const renderMainContent = () => {
    switch (activeView) {
      case 'pulse':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 overflow-auto">
              <GlobalPulse />
            </div>
            <div className="h-[calc(100vh-8rem)]">
              <GlobalAgentChat />
            </div>
          </div>
        );
      case 'dashboard':
        return <AdminDashboard />;
      case 'projects':
        return <ProjectGrid onSelectProject={setSelectedProject} />;
      case 'capacity':
        return <CapacityPlanningView />;
      case 'tasks':
        return <TasksView />;
      case 'stakeholders':
        return <StakeholdersView />;
      case 'calendar':
        return <TimelineView />;
      case 'settings':
        return (
          <div className="flex items-center justify-center h-full">
            <Card className="bg-card border-border max-w-md">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Settings</h3>
                <p className="text-muted-foreground">
                  Configure Global IA parameters, access control, and notification preferences.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return isAdmin ? <AdminDashboard /> : <ProjectGrid onSelectProject={setSelectedProject} />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-1 overflow-auto p-6">
        {renderMainContent()}
      </main>

      {/* Local Agent Chat Modal */}
      <AnimatePresence>
        {selectedProject && (
          <LocalAgentChat 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
