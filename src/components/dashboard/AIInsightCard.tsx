import { Sparkles, ArrowRight, Brain, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Insight {
  id: string;
  type: 'suggestion' | 'warning' | 'success';
  title: string;
  description: string;
  action?: string;
}

interface AIInsightCardProps {
  insights: Insight[];
  onAction?: (insight: Insight) => void;
}

const typeStyles = {
  suggestion: {
    bg: 'bg-ai-global/10',
    icon: Sparkles,
    iconColor: 'text-ai-global',
  },
  warning: {
    bg: 'bg-warning/10',
    icon: Zap,
    iconColor: 'text-warning',
  },
  success: {
    bg: 'bg-success/10',
    icon: Brain,
    iconColor: 'text-success',
  },
};

export function AIInsightCard({ insights, onAction }: AIInsightCardProps) {
  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <div className="gradient-ai p-4">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold">AI Insights</h3>
        </div>
        <p className="text-sm text-white/70 mt-1">
          Powered by Global & Local AI Agents
        </p>
      </div>
      <CardContent className="p-0">
        <div className="divide-y">
          {insights.map((insight) => {
            const style = typeStyles[insight.type];
            const Icon = style.icon;
            return (
              <div key={insight.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${style.bg}`}>
                    <Icon className={`h-4 w-4 ${style.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto mt-2 text-primary"
                        onClick={() => onAction?.(insight)}
                      >
                        {insight.action}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
