import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Brain,
  Globe,
  FolderKanban,
  Loader2,
  Bot,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Project, ChatMessage } from '@/types';

const mockProjects: Project[] = [
  { id: '1', name: 'Website Redesign', description: '', health: 'healthy', progress: 75, priority: 'high', manager_id: '1', created_at: '', updated_at: '' },
  { id: '2', name: 'Mobile App', description: '', health: 'at-risk', progress: 45, priority: 'critical', manager_id: '1', created_at: '', updated_at: '' },
];

const welcomeMessage = {
  role: 'assistant' as const,
  content: `Hello! I'm your AI Assistant powered by our dual-agent system.

**🌐 Global AI** - I can help with cross-project insights, scheduling optimization, and enterprise-wide analytics.

**🎯 Local AI** - Select a project to get deep context about tasks, status, and team dynamics.

How can I assist you today?`,
};

export default function ChatPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [agentType, setAgentType] = useState<'global' | 'local'>('global');
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await api.getProjects();
        if (data.length > 0) setProjects(data);
      } catch (error) {
        console.log('Using mock projects');
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.chat({
        messages: [...messages, userMessage],
        project_id: selectedProject || undefined,
        agent_type: agentType,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: response.message }]);
    } catch (error) {
      // Simulate AI response for demo
      const simulatedResponse = getSimulatedResponse(input, agentType, selectedProject);
      setMessages((prev) => [...prev, { role: 'assistant', content: simulatedResponse }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSimulatedResponse = (query: string, agent: 'global' | 'local', projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const lowerQuery = query.toLowerCase();

    if (agent === 'global') {
      if (lowerQuery.includes('schedule') || lowerQuery.includes('meeting')) {
        return `📅 **Schedule Analysis**

I've analyzed the master calendar and team availability:

- **Best time for team meeting**: Thursday 2:00 PM - 3:00 PM
- **All stakeholders available**: ✓
- **No conflicts detected** with other critical reviews

Would you like me to schedule this meeting?`;
      }
      if (lowerQuery.includes('status') || lowerQuery.includes('overview')) {
        return `📊 **Enterprise Overview**

**Active Projects**: 3
- Website Redesign: 75% complete (Healthy)
- Mobile App: 45% complete (At Risk)
- Analytics Platform: 90% complete (Healthy)

**Team Capacity**: 85% utilized
**Upcoming Deadlines**: 2 this week

⚠️ **Alert**: Bob Wilson is overallocated. Consider redistributing tasks.`;
      }
      return `🌐 **Global AI Response**

Based on my cross-project analysis, I can provide insights on:
- Resource allocation across projects
- Schedule optimization
- Enterprise-wide metrics

What specific aspect would you like me to analyze?`;
    } else {
      if (!project) {
        return `🎯 Please select a project to get context-specific insights from the Local AI.`;
      }
      if (lowerQuery.includes('status') || lowerQuery.includes('update')) {
        return `🎯 **${project.name} Status**

**Progress**: ${project.progress}%
**Health**: ${project.health}
**Priority**: ${project.priority}

**Recent Activity**:
- 3 tasks completed this week
- Design review scheduled for tomorrow
- Sprint goal on track

**Recommendations**:
1. Focus on completing remaining UI components
2. Schedule stakeholder demo for Friday`;
      }
      return `🎯 **Local AI - ${project.name}**

I have full context on this project including:
- Task history and current status
- Team member contributions
- Meeting transcripts and decisions

What would you like to know about ${project.name}?`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-ai">
              {agentType === 'global' ? (
                <Globe className="h-5 w-5 text-white" />
              ) : (
                <FolderKanban className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <h1 className="font-semibold">AI Assistant</h1>
              <p className="text-sm text-muted-foreground">
                {agentType === 'global' ? 'Global AI - Cross-project insights' : 'Local AI - Project context'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={agentType} onValueChange={(v) => setAgentType(v as 'global' | 'local')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Global AI
                  </div>
                </SelectItem>
                <SelectItem value="local">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4" />
                    Local AI
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {agentType === 'local' && (
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'justify-end'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="p-2 rounded-xl gradient-ai h-fit">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl p-4',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                    {message.content.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={i} className="font-bold mb-1">{line.replace(/\*\*/g, '')}</p>;
                      }
                      if (line.startsWith('- ')) {
                        return <p key={i} className="ml-4">• {line.slice(2)}</p>;
                      }
                      return <p key={i} className="mb-1">{line}</p>;
                    })}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="p-2 rounded-xl bg-primary h-fit">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="p-2 rounded-xl gradient-ai h-fit">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4 bg-card">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Input
              placeholder="Ask the AI assistant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="gradient-primary text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar - Quick Actions */}
      <div className="w-80 border-l bg-muted/30 p-4 hidden lg:block">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-2">
          {[
            { label: 'Project overview', icon: FolderKanban },
            { label: 'Schedule a meeting', icon: Globe },
            { label: 'Team capacity check', icon: Brain },
            { label: 'Generate status report', icon: Sparkles },
          ].map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              className="w-full justify-start text-sm"
              onClick={() => setInput(action.label)}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-4">Agent Info</h3>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-ai-global/10">
                  <Globe className="h-4 w-4 text-ai-global" />
                </div>
                <div>
                  <p className="text-sm font-medium">Global AI</p>
                  <p className="text-xs text-muted-foreground">Cross-project visibility</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-ai-local/10">
                  <FolderKanban className="h-4 w-4 text-ai-local" />
                </div>
                <div>
                  <p className="text-sm font-medium">Local AI</p>
                  <p className="text-xs text-muted-foreground">Deep project context</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
