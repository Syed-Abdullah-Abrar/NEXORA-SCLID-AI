export type AgentDomain = 'early_warning' | 'situational_awareness' | 'resource_allocation';

export interface AgentSkill {
  id: string;
  domain: AgentDomain;
  description: string;
  inputSchema: object;
  outputSchema: object;
}

export interface MemoryArtifact {
  id: string;
  timestamp: string;
  source: string;
  data: unknown;
  tags: string[];
  vector?: number[];
}

export interface TaskGraph {
  tasks: Task[];
}

export interface Task {
  id: string;
  agentId: string;
  dependencies: string[];
  input: unknown;
}

export interface GeoData {
  lat: number;
  lon: number;
  population?: number;
  criticalInfrastructure?: string[];
  shelterLocations?: string[];
}

export interface DisasterEvent {
  id: string;
  topic: 'hazard.detected' | 'situational.fusion.completed' | 'resource.plan.generated';
  payload: MemoryArtifact;
  metadata: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    isLocal: boolean;
  };
}