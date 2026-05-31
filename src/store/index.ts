import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Project, Task, SessionLog } from '../types';

interface AppState {
  userName: string;
  projects: Project[];
  tasks: Task[];
  sessionLogs: SessionLog[];

  // Settings
  setUserName: (name: string) => void;

  // Projects
  addProject: (name: string, sellSheet: string, tags?: string) => void;
  updateProject: (id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  deleteProject: (id: string) => void;
  touchProject: (id: string) => void;
  restProject: (id: string, durationDays: number | null) => void;
  wakeProject: (id: string) => void;

  // Tasks
  addTask: (projectId: string, text: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  deleteTask: (taskId: string) => void;

  // Logs
  addSessionLog: (projectId: string, entry: string) => void;

  // Initialization
  checkAutoWake: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      userName: 'Creator',
      projects: [],
      tasks: [],
      sessionLogs: [],

      setUserName: (name) => set({ userName: name }),

      addProject: (name, sellSheet, tags = '') => set((state) => {
        const now = new Date().toISOString();
        const newProject: Project = {
          id: uuidv4(),
          name,
          sellSheet,
          tags,
          createdAt: now,
          lastTouchedAt: now,
          restingAt: null,
          restingUntil: null,
        };
        return { projects: [...state.projects, newProject] };
      }),

      updateProject: (id, data) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...data } : p)
      })),

      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        tasks: state.tasks.filter(t => t.projectId !== id),
        sessionLogs: state.sessionLogs.filter(l => l.projectId !== id),
      })),

      touchProject: (id) => set((state) => {
        const now = new Date().toISOString();
        return {
          projects: state.projects.map(p =>
            p.id === id
              ? { ...p, lastTouchedAt: now, restingAt: null, restingUntil: null }
              : p
          )
        };
      }),

      restProject: (id, durationDays) => set((state) => {
        const now = new Date();
        const restingUntil = durationDays
          ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString()
          : null;

        return {
          projects: state.projects.map(p =>
            p.id === id
              ? { ...p, restingAt: now.toISOString(), restingUntil }
              : p
          )
        };
      }),

      wakeProject: (id) => get().touchProject(id),

      addTask: (projectId, text) => set((state) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          id: uuidv4(),
          projectId,
          text,
          createdAt: now,
          completedAt: null,
        };
        get().touchProject(projectId);
        return { tasks: [...state.tasks, newTask] };
      }),

      toggleTaskCompletion: (taskId) => set((state) => {
        let projectId = '';
        const now = new Date().toISOString();
        const newTasks = state.tasks.map(t => {
          if (t.id === taskId) {
            projectId = t.projectId;
            return { ...t, completedAt: t.completedAt ? null : now };
          }
          return t;
        });

        if (projectId) get().touchProject(projectId);
        return { tasks: newTasks };
      }),

      deleteTask: (taskId) => set((state) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) get().touchProject(task.projectId);
        return { tasks: state.tasks.filter(t => t.id !== taskId) };
      }),

      addSessionLog: (projectId, entry) => set((state) => {
        const now = new Date().toISOString();
        const newLog: SessionLog = {
          id: uuidv4(),
          projectId,
          date: now,
          entry,
        };
        get().touchProject(projectId);
        return { sessionLogs: [...state.sessionLogs, newLog] };
      }),

      checkAutoWake: () => set((state) => {
        const now = new Date();
        let changed = false;

        const newProjects = state.projects.map(p => {
          if (p.restingUntil && new Date(p.restingUntil) < now) {
            changed = true;
            return { ...p, restingAt: null, restingUntil: null, lastTouchedAt: now.toISOString() };
          }
          return p;
        });

        if (changed) {
          return { projects: newProjects };
        }
        return state;
      })
    }),
    {
      name: 'friction-manager-storage',
    }
  )
);
