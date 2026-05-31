export interface Project {
  id: string;
  name: string;
  sellSheet: string;
  tags: string; // comma separated
  lastTouchedAt: string; // ISO string
  restingAt: string | null; // ISO string
  restingUntil: string | null; // ISO string
  createdAt: string; // ISO string
}

export interface Task {
  id: string;
  projectId: string;
  text: string;
  createdAt: string; // ISO string
  completedAt: string | null; // ISO string
}

export interface SessionLog {
  id: string;
  projectId: string;
  date: string; // ISO string
  entry: string;
}

export type Warmth = 'Hot' | 'Warm' | 'Cold';
export type Friction = 'Low' | 'Medium' | 'High' | 'None';
