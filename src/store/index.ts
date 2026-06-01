import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, Task, SessionLog } from '../types';
import { supabase, isConfigured } from '../lib/supabase';

// DB to Client Mapping helpers
function mapProjectFromDb(dbProj: any): Project {
  return {
    id: dbProj.id,
    name: dbProj.name,
    sellSheet: dbProj.sell_sheet || '',
    tags: dbProj.tags || '',
    lastTouchedAt: dbProj.last_touched_at,
    restingAt: dbProj.resting_at,
    restingUntil: dbProj.resting_until,
    createdAt: dbProj.created_at,
  };
}

function mapTaskFromDb(dbTask: any): Task {
  return {
    id: dbTask.id,
    projectId: dbTask.project_id,
    text: dbTask.text,
    createdAt: dbTask.created_at,
    completedAt: dbTask.completed_at,
  };
}

function mapSessionLogFromDb(dbLog: any): SessionLog {
  return {
    id: dbLog.id,
    projectId: dbLog.project_id,
    date: dbLog.date,
    entry: dbLog.entry,
  };
}

interface AppState {
  userName: string;
  projects: Project[];
  tasks: Task[];
  sessionLogs: SessionLog[];

  // Database Connection Info
  syncEnabled: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  syncError: string | null;
  isSaving: boolean;



  // Settings
  setUserName: (name: string) => void;
  syncData: () => Promise<void>;

  // Projects
  addProject: (name: string, sellSheet: string, tags?: string) => Promise<void>;
  updateProject: (id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  touchProject: (id: string) => Promise<void>;
  restProject: (id: string, durationDays: number | null) => Promise<void>;
  wakeProject: (id: string) => Promise<void>;

  // Tasks
  addTask: (projectId: string, text: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // Logs
  addSessionLog: (projectId: string, entry: string) => Promise<void>;

  // Initialization
  checkAutoWake: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      userName: 'Creator',
      projects: [],
      tasks: [],
      sessionLogs: [],

      // Supabase database status
      syncEnabled: isConfigured,
      syncStatus: 'idle',
      syncError: null,
      isSaving: false,



      setUserName: (name) => set({ userName: name }),

      syncData: async () => {
        if (!isConfigured) return;

        set({ syncStatus: 'syncing', syncError: null });
        try {
          // Read all data on app load
          const { data: projectsData, error: projErr } = await supabase
            .from('projects')
            .select('*')
            .order('last_touched_at', { ascending: false });
          if (projErr) throw projErr;

          const { data: tasksData, error: taskErr } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: true });
          if (taskErr) throw taskErr;

          const { data: logData, error: logErr } = await supabase
            .from('session_log')
            .select('*')
            .order('date', { ascending: false });
          if (logErr) throw logErr;

          let projects: Project[] = (projectsData || []).map(mapProjectFromDb);
          const tasks: Task[] = (tasksData || []).map(mapTaskFromDb);
          const sessionLogs: SessionLog[] = (logData || []).map(mapSessionLogFromDb);

          // Auto-wake on load check
          const nowStr = new Date().toISOString();
          const toWake = projects.filter(p => p.restingUntil && p.restingUntil < nowStr);
          if (toWake.length > 0) {
            for (const p of toWake) {
              await supabase
                .from('projects')
                .update({ resting_at: null, resting_until: null, last_touched_at: nowStr })
                .eq('id', p.id);
            }
            // Re-fetch projects to make sure we have updated state
            const { data: reFetchedProjects, error: refetchErr } = await supabase
              .from('projects')
              .select('*')
              .order('last_touched_at', { ascending: false });
            if (!refetchErr && reFetchedProjects) {
              projects = reFetchedProjects.map(mapProjectFromDb);
            }
          }

          set({
            projects,
            tasks,
            sessionLogs,
            syncStatus: 'synced',
            syncError: null,
          });
        } catch (err: any) {
          console.error('Failed to sync with Supabase:', err);
          set({ syncStatus: 'error', syncError: err?.message || 'Failed to sync with Supabase' });
          throw err;
        }
      },

      addProject: async (name, sellSheet, tags = '') => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const newProject: Project = {
          id,
          name,
          sellSheet,
          tags,
          createdAt: now,
          lastTouchedAt: now,
          restingAt: null,
          restingUntil: null,
        };
        
        // Optimistic UI update
        set((state) => ({ projects: [...state.projects, newProject] }));

        if (isConfigured) {
          try {
            const { error } = await supabase.from('projects').insert({
              id,
              name,
              sell_sheet: sellSheet,
              tags,
              created_at: now,
              last_touched_at: now
            });
            if (error) throw error;
            set({ syncStatus: 'synced', syncError: null });
          } catch (err: any) {
            console.error('Failed to add project to Supabase:', err);
            set({ syncStatus: 'error', syncError: err?.message || 'Failed to add project' });
          }
        }
      },

      updateProject: async (id, data) => {
        const lastTouched = new Date().toISOString();
        const updatedFields = { ...data, lastTouchedAt: lastTouched };

        // Optimistic UI update
        set((state) => ({
          projects: state.projects.map(p => p.id === id ? { ...p, ...updatedFields } : p)
        }));

        if (isConfigured) {
          try {
            const dbFields: any = { last_touched_at: lastTouched };
            if (data.name !== undefined) dbFields.name = data.name;
            if (data.sellSheet !== undefined) dbFields.sell_sheet = data.sellSheet;
            if (data.tags !== undefined) dbFields.tags = data.tags;
            if (data.restingAt !== undefined) dbFields.resting_at = data.restingAt;
            if (data.restingUntil !== undefined) dbFields.resting_until = data.restingUntil;

            const { error } = await supabase.from('projects').update(dbFields).eq('id', id);
            if (error) throw error;
            set({ syncStatus: 'synced', syncError: null });
          } catch (err: any) {
            console.error('Failed to update project in Supabase:', err);
            set({ syncStatus: 'error', syncError: err?.message || 'Failed to update project' });
          }
        }
      },

      deleteProject: async (id) => {
        // Optimistic UI update
        set((state) => ({
          projects: state.projects.filter(p => p.id !== id),
          tasks: state.tasks.filter(t => t.projectId !== id),
          sessionLogs: state.sessionLogs.filter(l => l.projectId !== id),
        }));

        if (isConfigured) {
          try {
            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (error) throw error;
            set({ syncStatus: 'synced', syncError: null });
          } catch (err: any) {
            console.error('Failed to delete project from Supabase:', err);
            set({ syncStatus: 'error', syncError: err?.message || 'Failed to delete project' });
          }
        }
      },

      touchProject: async (id) => {
        const now = new Date().toISOString();
        // Optimistic UI update
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === id
              ? { ...p, lastTouchedAt: now, restingAt: null, restingUntil: null }
              : p
          )
        }));

        if (isConfigured) {
          try {
            const { error } = await supabase.from('projects').update({
              last_touched_at: now,
              resting_at: null,
              resting_until: null
            }).eq('id', id);
            if (error) throw error;
            set({ syncStatus: 'synced', syncError: null });
          } catch (err: any) {
            console.error('Failed to touch project in Supabase:', err);
            set({ syncStatus: 'error', syncError: err?.message || 'Failed to touch project' });
          }
        }
      },

      restProject: async (id, durationDays) => {
        const now = new Date();
        const nowStr = now.toISOString();
        const restingUntil = durationDays
          ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString()
          : null;

        // Optimistic UI update
        set((state) => ({
          projects: state.projects.map(p =>
            p.id === id
              ? { ...p, restingAt: nowStr, restingUntil }
              : p
          )
        }));

        if (isConfigured) {
          try {
            const { error } = await supabase.from('projects').update({
              resting_at: nowStr,
              resting_until: restingUntil
            }).eq('id', id);
            if (error) throw error;
            set({ syncStatus: 'synced', syncError: null });
          } catch (err: any) {
            console.error('Failed to rest project in Supabase:', err);
            set({ syncStatus: 'error', syncError: err?.message || 'Failed to rest project' });
          }
        }
      },

      wakeProject: (id) => get().touchProject(id),

      addTask: async (projectId, text) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const newTask: Task = {
          id,
          projectId,
          text,
          createdAt: now,
          completedAt: null,
        };

        // Optimistic UI update
        set((state) => ({
          tasks: [...state.tasks, newTask],
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, lastTouchedAt: now, restingAt: null, restingUntil: null }
              : p
          )
        }));

        if (isConfigured) {
          try {
            const { error: taskErr } = await supabase.from('tasks').insert({
              id,
              project_id: projectId,
              text,
              created_at: now
            });
            if (taskErr) throw taskErr;

            const { error: projErr } = await supabase.from('projects').update({
              last_touched_at: now,
              resting_at: null,
              resting_until: null
            }).eq('id', projectId);
            if (projErr) throw projErr;
            set({ syncStatus: 'synced', syncError: null });
          } catch (err: any) {
            console.error('Failed to add task in Supabase:', err);
            set({ syncStatus: 'error', syncError: err?.message || 'Failed to add task' });
          }
        }
      },

      toggleTaskCompletion: async (taskId) => {
        const now = new Date().toISOString();
        const tasks = get().tasks;
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const nextCompletedAt = task.completedAt ? null : now;
        const projectId = task.projectId;

        // Optimistic UI update
        set((state) => ({
          tasks: state.tasks.map(t =>
            t.id === taskId ? { ...t, completedAt: nextCompletedAt } : t
          ),
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, lastTouchedAt: now, restingAt: null, restingUntil: null }
              : p
          )
        }));

        if (isConfigured) {
          try {
            const { error: taskErr } = await supabase.from('tasks').update({
              completed_at: nextCompletedAt
            }).eq('id', taskId);
            if (taskErr) throw taskErr;

            const { error: projErr } = await supabase.from('projects').update({
              last_touched_at: now,
              resting_at: null,
              resting_until: null
            }).eq('id', projectId);
            if (projErr) throw projErr;
            set({ syncStatus: 'synced', syncError: null });
          } catch (err: any) {
            console.error('Failed to toggle task completion in Supabase:', err);
            set({ syncStatus: 'error', syncError: err?.message || 'Failed to update task' });
          }
        }
      },

      deleteTask: async (taskId) => {
        const now = new Date().toISOString();
        const tasks = get().tasks;
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const projectId = task.projectId;

        // Optimistic UI update
        set((state) => ({
          tasks: state.tasks.filter(t => t.id !== taskId),
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, lastTouchedAt: now, restingAt: null, restingUntil: null }
              : p
          )
        }));

        if (isConfigured) {
          try {
            const { error: taskErr } = await supabase.from('tasks').delete().eq('id', taskId);
            if (taskErr) throw taskErr;

            const { error: projErr } = await supabase.from('projects').update({
              last_touched_at: now,
              resting_at: null,
              resting_until: null
            }).eq('id', projectId);
            if (projErr) throw projErr;
            set({ syncStatus: 'synced', syncError: null });
          } catch (err: any) {
            console.error('Failed to delete task from Supabase:', err);
            set({ syncStatus: 'error', syncError: err?.message || 'Failed to delete task' });
          }
        }
      },

      addSessionLog: async (projectId, entry) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const newLog: SessionLog = {
          id,
          projectId,
          date: now,
          entry,
        };

        // Optimistic UI update
        set((state) => ({
          sessionLogs: [...state.sessionLogs, newLog],
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, lastTouchedAt: now, restingAt: null, restingUntil: null }
              : p
          )
        }));

        if (isConfigured) {
          try {
            const { error: logErr } = await supabase.from('session_log').insert({
              id,
              project_id: projectId,
              entry,
              date: now
            });
            if (logErr) throw logErr;

            const { error: projErr } = await supabase.from('projects').update({
              last_touched_at: now,
              resting_at: null,
              resting_until: null
            }).eq('id', projectId);
            if (projErr) throw projErr;
            set({ syncStatus: 'synced', syncError: null });
          } catch (err: any) {
            console.error('Failed to add session log to Supabase:', err);
            set({ syncStatus: 'error', syncError: err?.message || 'Failed to add session log' });
          }
        }
      },

      checkAutoWake: async () => {
        const now = new Date();
        const nowStr = now.toISOString();
        const { projects } = get();
        const toWake = projects.filter(p => p.restingUntil && new Date(p.restingUntil) < now);

        if (toWake.length > 0) {
          // Optimistic UI update
          set((state) => ({
            projects: state.projects.map(p => {
              if (p.restingUntil && new Date(p.restingUntil) < now) {
                return { ...p, restingAt: null, restingUntil: null, lastTouchedAt: nowStr };
              }
              return p;
            })
          }));

          if (isConfigured) {
            try {
              for (const p of toWake) {
                await supabase.from('projects').update({
                  resting_at: null,
                  resting_until: null,
                  last_touched_at: nowStr
                }).eq('id', p.id);
              }
              set({ syncStatus: 'synced', syncError: null });
            } catch (err: any) {
              console.error('Failed to auto-wake projects in Supabase:', err);
              set({ syncStatus: 'error', syncError: err?.message || 'Failed to auto-wake projects' });
            }
          }
        }
      }
    }),
    {
      name: 'friction-manager-storage',
      partialize: (state) => ({
        userName: state.userName,
        projects: state.projects,
        tasks: state.tasks,
        sessionLogs: state.sessionLogs,
      }),
    }
  )
);
