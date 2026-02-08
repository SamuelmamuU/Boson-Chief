// Enterprise Multi-Agent AI System Types

export type StakeholderRole = 'admin' | 'manager' | 'developer' | 'analyst' | 'viewer';

export type ProjectHealth = 'healthy' | 'at-risk' | 'critical' | 'blocked';

export type EventType = 
  | 'meeting'
  | 'milestone'
  | 'decision'
  | 'conflict'
  | 'insight'
  | 'update'
  | 'alert';

export type AgentType = 'global' | 'local';

export interface Stakeholder {
  id: string;
  name: string;
  email: string;
  role: StakeholderRole;
  avatar?: string;
  cognitiveLoad: number; // 0-100 percentage
  projectIds: string[];
  availability: 'available' | 'busy' | 'focus' | 'offline';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  health: ProjectHealth;
  progress: number; // 0-100
  stakeholders: string[]; // stakeholder IDs
  createdAt: Date;
  updatedAt: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  eventCount: number;
  lastActivity: Date;
  localAgentStatus: 'active' | 'idle' | 'processing';
}

export interface Event {
  id: string;
  projectId: string;
  type: EventType;
  title: string;
  description: string;
  timestamp: Date;
  stakeholders: string[];
  aiGenerated: boolean;
  metadata?: Record<string, unknown>;
}

export interface AgentMessage {
  id: string;
  agentType: AgentType;
  content: string;
  timestamp: Date;
  projectId?: string;
  isUser: boolean;
}

export interface GlobalInsight {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  affectedProjects: string[];
  affectedStakeholders: string[];
  timestamp: Date;
  actionable: boolean;
  suggestedAction?: string;
}

export interface SchedulingRequest {
  id: string;
  projectId: string;
  requestType: 'meeting' | 'review' | 'deadline';
  stakeholders: string[];
  preferredDuration: number; // minutes
  urgency: 'low' | 'medium' | 'high';
  requestedBy: string;
  status: 'pending' | 'scheduled' | 'conflict' | 'resolved';
  scheduledTime?: Date;
  conflictReason?: string;
}
