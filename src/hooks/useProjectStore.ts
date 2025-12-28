import { useState, useEffect } from "react";
import type {
  Project,
  Task,
  FrictionLevel,
  ProjectStatus,
  BackupData,
} from "../types";

export const useProjectStore = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    // Initial Load
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("friction_pm_projects");
      if (saved) {
        try {
          return JSON.parse(saved);
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
          return JSON.parse(saved);
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

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem("friction_pm_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("friction_pm_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Actions
  const addProject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newProjectName.trim()) return;
    const project: Project = {
      id: crypto.randomUUID(),
      name: newProjectName,
      status: newProjectStatus,
      createdAt: Date.now(),
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
    setProjects(projects.map((p) => (p.id === id ? { ...p, status } : p)));
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
    };
    setTasks([...tasks, task]);
  };

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteTask = (taskId: string) => {
    if (confirm("Delete task?")) {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
  };

  const toggleToday = (taskId: string) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, isToday: !t.isToday } : t))
    );
  };

  const cycleFriction = (taskId: string, current: FrictionLevel) => {
    const levels: FrictionLevel[] = ["none", "low", "moderate", "high"];
    const nextIndex = (levels.indexOf(current) + 1) % levels.length;
    const nextLevel = levels[nextIndex];
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, friction: nextLevel } : t))
    );
  };

  const updateTask = (
    taskId: string,
    text: string,
    friction: FrictionLevel
  ) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, text, friction } : t))
    );
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
