import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  X, 
  Sparkles, 
  Clock, 
  FileText,
  Users,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Project, AgentMessage } from '@/types/enterprise';
import { mockStakeholders, mockEvents } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface LocalAgentChatProps {
  project: Project;
  onClose: () => void;
}

export function LocalAgentChat({ project, onClose }: LocalAgentChatProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'init-1',
      agentType: 'local',
      content: `Hello! I'm the Local IA for **${project.name}**. I have full context of this project's history, decisions, and current state. How can I help you today?`,
      timestamp: new Date(),
      projectId: project.id,
      isUser: false,
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const projectStakeholders = mockStakeholders.filter(s => 
    project.stakeholders.includes(s.id)
  );

  const projectEvents = mockEvents.filter(e => e.projectId === project.id);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: AgentMessage = {
      id: `msg-${Date.now()}`,
      agentType: 'local',
      content: inputValue,
      timestamp: new Date(),
      projectId: project.id,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AgentMessage = {
        id: `msg-${Date.now() + 1}`,
        agentType: 'local',
        content: getSimulatedResponse(inputValue, project),
        timestamp: new Date(),
        projectId: project.id,
        isUser: false,
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-success border-success/30 bg-success/10';
      case 'at-risk': return 'text-warning border-warning/30 bg-warning/10';
      case 'critical': return 'text-destructive border-destructive/30 bg-destructive/10';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="w-full max-w-5xl h-[85vh] bg-card border border-border rounded-xl shadow-elevated overflow-hidden flex"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Panel - Project Context */}
        <div className="w-80 border-r border-border bg-secondary/20 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className={getHealthColor(project.health)}>
                {project.health}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {project.priority} priority
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
          </div>

          {/* Progress */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          {/* Stakeholders */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Stakeholders</span>
            </div>
            <div className="space-y-2">
              {projectStakeholders.map(stakeholder => (
                <div key={stakeholder.id} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-medium text-primary-foreground">
                    {stakeholder.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{stakeholder.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{stakeholder.role}</p>
                  </div>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    stakeholder.availability === 'available' && "bg-success",
                    stakeholder.availability === 'busy' && "bg-warning",
                    stakeholder.availability === 'focus' && "bg-primary",
                    stakeholder.availability === 'offline' && "bg-muted-foreground"
                  )} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Events */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Recent Events</span>
              </div>
            </div>
            <ScrollArea className="flex-1 px-4 pb-4">
              <div className="space-y-2">
                {projectEvents.slice(0, 5).map(event => (
                  <div 
                    key={event.id} 
                    className="p-2 rounded-lg bg-background/50 border border-border/50 text-xs"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {event.aiGenerated && <Sparkles className="w-3 h-3 text-primary" />}
                      <span className="font-medium text-foreground truncate">{event.title}</span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{event.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-success flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Local IA</h4>
                <p className="text-xs text-muted-foreground">Project Brain • Single Source of Truth</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex",
                      message.isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[80%] p-4 rounded-xl",
                      message.isUser 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-secondary border border-border rounded-tl-none"
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={cn(
                        "text-xs mt-2 opacity-70",
                        message.isUser ? "text-primary-foreground" : "text-muted-foreground"
                      )}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm">Local IA is thinking...</span>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t border-border/50">
            <div className="flex flex-wrap gap-2">
              {['Summarize progress', 'Identify blockers', 'Next steps', 'Team availability'].map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setInputValue(action)}
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask the Local IA about this project..."
                className="flex-1 bg-secondary/50 border-border"
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button onClick={handleSend} disabled={!inputValue.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function getSimulatedResponse(input: string, project: Project): string {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('progress') || lowerInput.includes('summarize')) {
    return `Based on my analysis of ${project.name}:\n\n• Current progress: **${project.progress}%**\n• Health status: **${project.health}**\n• Total events logged: ${project.eventCount}\n\nThe project is ${project.progress > 50 ? 'on track for the current milestone' : 'behind schedule on some deliverables'}. I recommend reviewing the recent event log for detailed context.`;
  }
  
  if (lowerInput.includes('blocker') || lowerInput.includes('risk')) {
    return `I've identified the following potential blockers:\n\n1. **Resource allocation** - Some stakeholders have high cognitive load\n2. **Dependencies** - Waiting on external API integration\n3. **Timeline** - Current velocity suggests potential delay risk\n\nWould you like me to escalate any of these to the Global IA for cross-project analysis?`;
  }
  
  if (lowerInput.includes('next') || lowerInput.includes('step')) {
    return `Recommended next steps for ${project.name}:\n\n1. **Review pending tasks** in the current sprint\n2. **Schedule sync meeting** with key stakeholders\n3. **Update documentation** based on recent decisions\n4. **Prepare status report** for stakeholder review\n\nI can help draft any of these documents if needed.`;
  }
  
  if (lowerInput.includes('team') || lowerInput.includes('availability')) {
    return `Team availability analysis:\n\n• 2 members currently available\n• 1 member in focus mode\n• Optimal meeting window: **Thursday 2-4 PM**\n\nNote: Global IA has flagged potential burnout risk for one team member. Consider redistributing workload.`;
  }
  
  return `I understand you're asking about "${input}". Based on my knowledge of this project:\n\nThis project has been active since ${project.createdAt.toLocaleDateString()} with ${project.eventCount} logged events. The current priority is **${project.priority}** and we're at ${project.progress}% completion.\n\nCan you be more specific about what aspect you'd like to explore?`;
}
