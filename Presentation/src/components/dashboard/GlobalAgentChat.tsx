import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles,
  Bot,
  Calendar,
  Users,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentMessage } from '@/types/enterprise';
import { mockAgentMessages } from '@/data/mockData';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export function GlobalAgentChat() {
  const [messages, setMessages] = useState<AgentMessage[]>(mockAgentMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: AgentMessage = {
      id: `msg-${Date.now()}`,
      agentType: 'global',
      content: inputValue,
      timestamp: new Date(),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AgentMessage = {
        id: `msg-${Date.now() + 1}`,
        agentType: 'global',
        content: getGlobalResponse(inputValue),
        timestamp: new Date(),
        isUser: false,
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const quickActions = [
    { label: 'Schedule optimization', icon: Calendar },
    { label: 'Resource conflicts', icon: Users },
    { label: 'Risk assessment', icon: AlertTriangle },
  ];

  return (
    <Card className="bg-card border-border h-full flex flex-col gradient-border">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center pulse-glow">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg text-gradient-global">Global IA</CardTitle>
            <p className="text-xs text-muted-foreground">Enterprise Brain • Cross-Project Orchestration</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30">
            <span className="status-dot bg-success" />
            <span className="text-xs text-success font-medium">Active</span>
          </div>
        </div>
      </CardHeader>

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
                  "flex",
                  message.isUser ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[85%] p-4 rounded-xl",
                  message.isUser 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-secondary border border-border rounded-tl-none"
                )}>
                  <div className={cn(
                    "text-sm prose prose-sm max-w-none",
                    message.isUser ? "text-primary-foreground prose-invert" : "text-foreground"
                  )}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
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
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">Global IA is analyzing...</span>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-border/50">
        <div className="flex flex-wrap gap-2">
          {quickActions.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => setInputValue(label)}
            >
              <Icon className="w-3 h-3" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <CardContent className="border-t border-border pt-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask the Global IA..."
            className="flex-1 bg-secondary/50 border-border"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} disabled={!inputValue.trim() || isTyping} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getGlobalResponse(input: string): string {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('schedule') || lowerInput.includes('calendar')) {
    return `I've analyzed the master calendar and stakeholder availability:\n\n**Optimal Windows This Week:**\n- Wednesday 10-11 AM: 4 stakeholders available\n- Thursday 2-4 PM: All 5 stakeholders available (lowest conflict probability)\n- Friday 9-10 AM: 3 stakeholders available\n\nNote: Marcus Chen has exceeded cognitive load threshold. I recommend limiting his meeting exposure to 2 hours/day until workload normalizes.`;
  }
  
  if (lowerInput.includes('conflict') || lowerInput.includes('resource')) {
    return `**Resource Conflict Analysis:**\n\n🔴 **Critical:** Sarah Okonkwo is over-allocated between AI Analytics (40%) and Mobile Redesign (45%)\n\n🟡 **Warning:** Enterprise Migration may conflict with Security Compliance deadline in week 3\n\n🟢 **Resolved:** Q1 budget allocation conflict - approved by finance\n\nRecommendation: Redistribute 15% of Sarah's Mobile Redesign tasks to Priya Sharma who has capacity.`;
  }
  
  if (lowerInput.includes('risk') || lowerInput.includes('assessment')) {
    return `**Enterprise Risk Assessment:**\n\n1. **AI Analytics Platform** (High Risk)\n   - 4-day delay probability: 73%\n   - Impact: Blocks Enterprise Migration Phase 3\n   - Mitigation: Add 1 developer or reduce scope\n\n2. **Security Compliance** (Critical)\n   - 14 days until SOC2 audit\n   - 3 critical items pending\n   - Mitigation: Escalate to C-suite, consider external consultants\n\n3. **Cross-Project Dependencies** (Medium)\n   - 2 shared resources at capacity\n   - Mitigation: Schedule alignment meeting within 48h`;
  }
  
  return `I understand you're asking about "${input}". As the Global IA, I have visibility across all 4 active projects and 5 stakeholders.\n\nBased on current enterprise state:\n- **2 projects** need attention (AI Analytics, Security Compliance)\n- **1 stakeholder** has elevated cognitive load\n- **3 scheduling conflicts** identified for next week\n\nWould you like me to elaborate on any specific area? I can provide detailed analysis on scheduling, resources, risks, or cross-project dependencies.`;
}
