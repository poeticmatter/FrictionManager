export type FrictionLevel = 'none' | 'low' | 'moderate' | 'high';
export type ProjectStatus = 'hot' | 'cold' | 'idea';

export interface Task {
  id: string;
  projectId: string;
  text: string;
  friction: FrictionLevel;
  isToday: string | boolean;
  completed: boolean;
  createdAt: number;
  blockedBy?: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: number;
  lastActivityAt?: number;
}

export interface BackupData {
  projects: Project[];
  tasks: Task[];
  exportedAt: number;
}
