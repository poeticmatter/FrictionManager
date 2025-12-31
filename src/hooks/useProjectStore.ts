import { useState, useEffect } from "react";
import type {
  Project,
  Task,
  FrictionLevel,
  ProjectStatus,
  BackupData,
} from "../types";

const isSameDay = (d1: number, d2: number) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const increaseFriction = (current: FrictionLevel): FrictionLevel => {
  if (current === "none") return "low";
  if (current === "low") return "moderate";
  return "high";
};

export const useProjectStore = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    // Initial Load
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("friction_pm_projects");
      if (saved) {
        try {
          const parsed: Project[] = JSON.parse(saved);
          // Migration: Add lastActivityAt if missing
          return parsed.map((p) => ({
            ...p,
            lastActivityAt: p.lastActivityAt ?? Date.now(),
          }));
        } catch {
          console.error("Failed to parse projects");
        }
      }
    }
    return [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("friction_pm_tasks");
      if (saved) {
        try {
          const parsed: Task[] = JSON.parse(saved);
          // Migration: Convert boolean/string isToday to timestamp
          const now = Date.now();
          return parsed.map((t) => ({
            ...t,
            // If true or string (from previous attempt), set to now
            isToday:
              t.isToday === true || typeof t.isToday === "string"
                ? now
                : t.isToday,
          }));
        } catch {
          console.error("Failed to parse tasks");
        }
      }
    }
    return [];
  });

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectStatus, setNewProjectStatus] = useState<ProjectStatus>(
    "hot"
  );

  const checkStaleData = (currentProjects: Project[], currentTasks: Task[]) => {
    const now = Date.now();
    let hasChanges = false;
    let newProjects = [...currentProjects];
    let newTasks = [...currentTasks];

    // 1. Check Projects (Hot -> Cold after 7 days)
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    newProjects = newProjects.map((p) => {
      if (
        p.status === "hot" &&
        p.lastActivityAt &&
        now - p.lastActivityAt > SEVEN_DAYS
      ) {
        hasChanges = true;
        return { ...p, status: "cold" };
      }
      return p;
    });

    // 2. Check Tasks (isToday check)
    newTasks = newTasks.map((t) => {
      if (
        t.isToday &&
        typeof t.isToday === "number" &&
        !isSameDay(t.isToday, now) &&
        !t.completed
      ) {
        hasChanges = true;
        return {
          ...t,
          isToday: false, // Move out of today
          friction: increaseFriction(t.friction), // Increase friction
        };
      }
      return t;
    });

    return { hasChanges, newProjects, newTasks };
  };

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem("friction_pm_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("friction_pm_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Periodic Checks
  useEffect(() => {
    // Run once on mount and every minute
    const runCheck = () => {
      const { hasChanges, newProjects, newTasks } = checkStaleData(projects, tasks);
      if (hasChanges) {
        setProjects(newProjects);
        setTasks(newTasks);
      }
    };

    runCheck(); // Initial check
    const interval = setInterval(runCheck, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [projects, tasks]); // Note: This dependency might cause loops if not careful,
                         // but checkStaleData returns hasChanges=false if nothing to update.
                         // However, if state updates, it re-runs.
                         // To avoid infinite loops, checkStaleData logic must be idempotent relative to time (mostly).
                         // Actually, if we update state, this effect runs again.
                         // If checkStaleData returns hasChanges=true again, loop.
                         // checkStaleData uses Date.now().
                         // If we update `isToday` to false, next run `isToday` is false, condition fails -> hasChanges=false. Stable.
                         // If we update Project to Cold, next run status is Cold -> hasChanges=false. Stable.
                         // So it is safe.

  // Actions
  const addProject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newProjectName.trim()) return;
    const project: Project = {
      id: crypto.randomUUID(),
      name: newProjectName,
      status: newProjectStatus,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
    };
    setProjects([project, ...projects]);
    setNewProjectName("");
  };

  const deleteProject = (id: string) => {
    if (confirm("Delete project and all tasks?")) {
      setProjects(projects.filter((p) => p.id !== id));
      setTasks(tasks.filter((t) => t.projectId !== id));
    }
  };

  const updateProjectStatus = (id: string, status: ProjectStatus) => {
    setProjects(
      projects.map((p) =>
        p.id === id ? { ...p, status, lastActivityAt: Date.now() } : p
      )
    );
  };

  const touchProject = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, lastActivityAt: Date.now() } : p
      )
    );
  };

  const addTask = (
    projectId: string,
    text: string,
    friction: FrictionLevel
  ) => {
    const task: Task = {
      id: crypto.randomUUID(),
      projectId,
      text,
      friction,
      isToday: false,
      completed: false,
      createdAt: Date.now(),
      blockedBy: undefined,
    };
    setTasks([...tasks, task]);
    touchProject(projectId);
  };

  const toggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTasks(
        tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );
      touchProject(task.projectId);
    }
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && confirm("Delete task?")) {
      setTasks(tasks.filter((t) => t.id !== taskId));
      touchProject(task.projectId);
    }
  };

  const toggleToday = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? { ...t, isToday: t.isToday ? false : Date.now() }
            : t
        )
      );
      touchProject(task.projectId);
    }
  };

  const cycleFriction = (taskId: string, current: FrictionLevel) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const levels: FrictionLevel[] = ["none", "low", "moderate", "high"];
      const nextIndex = (levels.indexOf(current) + 1) % levels.length;
      const nextLevel = levels[nextIndex];
      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, friction: nextLevel } : t))
      );
      touchProject(task.projectId);
    }
  };

  const updateTask = (
    taskId: string,
    text: string,
    friction: FrictionLevel,
    blockedBy?: string | null
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTasks(
        tasks.map((t) => {
          if (t.id === taskId) {
            const newBlockedBy =
              blockedBy === null
                ? undefined
                : blockedBy ?? t.blockedBy;

            return {
              ...t,
              text,
              friction,
              blockedBy: newBlockedBy,
              // If the task becomes blocked (has a blockedBy ID), force isToday to false
              isToday: newBlockedBy ? false : t.isToday,
            };
          }
          return t;
        })
      );
      touchProject(task.projectId);
    }
  };

  // Export / Import Logic
  const handleExport = () => {
    const data: BackupData = {
      projects,
      tasks,
      exportedAt: Date.now(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `friction-pm-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (data: BackupData) => {
    if (
      !confirm(
        `Importing will replace current data with ${data.projects.length} projects and ${data.tasks.length} tasks. Continue?`
      )
    )
      return;

    try {
      setProjects(data.projects);
      setTasks(data.tasks);
      alert("Import successful!");
    } catch (err) {
      console.error("Import failed", err);
      alert("Import failed.");
    }
  };

  return {
    projects,
    tasks,
    newProjectName,
    newProjectStatus,
    setNewProjectName,
    setNewProjectStatus,
    addProject,
    deleteProject,
    updateProjectStatus,
    addTask,
    toggleTask,
    deleteTask,
    toggleToday,
    cycleFriction,
    updateTask,
    handleExport,
    handleImport,
  };
};
