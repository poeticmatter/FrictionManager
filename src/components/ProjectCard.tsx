import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Target,
} from "lucide-react";
import type { Project, Task, FrictionLevel, ProjectStatus } from "../types";
import { FRICTION_CONFIG, STATUS_CONFIG } from "../config";
import { TaskItem } from "./TaskItem";

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  onAddTask: (projectId: string, text: string, friction: FrictionLevel) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleToday: (taskId: string) => void;
  onChangeProjectStatus: (projectId: string, status: ProjectStatus) => void;
  onDeleteProject: (projectId: string) => void;
  onCycleFriction: (taskId: string, current: FrictionLevel) => void;
  onUpdateTask?: (
    taskId: string,
    text: string,
    friction: FrictionLevel
  ) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onToggleToday,
  onChangeProjectStatus,
  onDeleteProject,
  onCycleFriction,
  onUpdateTask,
}) => {
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskFriction, setNewTaskFriction] = useState<FrictionLevel>("low");
  const [viewState, setViewState] = useState<"collapsed" | "lowest" | "expanded">("collapsed");
  const [showCompleted, setShowCompleted] = useState(false);

  const openTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Find task with lowest friction score
  let minScore = Infinity;
  let minFrictionLevel: FrictionLevel = "none";

  if (openTasks.length > 0) {
    openTasks.forEach((task) => {
      const score = FRICTION_CONFIG[task.friction].score;
      if (score < minScore) {
        minScore = score;
        minFrictionLevel = task.friction;
      }
    });
  }

  const getFrictionBarStyle = (level: FrictionLevel) => {
    switch (level) {
      case "none":
        return { width: "25%", className: "bg-gray-300" };
      case "low":
        return { width: "50%", className: "bg-emerald-400" };
      case "moderate":
        return { width: "75%", className: "bg-amber-400" };
      case "high":
        return { width: "100%", className: "bg-rose-500" };
    }
  };

  const barStyle = getFrictionBarStyle(minFrictionLevel);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(project.id, newTaskText, newTaskFriction);
    setNewTaskText("");
  };

  const handleToggleView = () => {
    if (viewState === "collapsed") {
      if (openTasks.length === 0) {
        setViewState("expanded");
      } else {
        setViewState("lowest");
      }
    } else if (viewState === "lowest") {
      setViewState("expanded");
    } else {
      setViewState("collapsed");
    }
  };

  const getLowestFrictionTask = () => {
    if (openTasks.length === 0) return null;

    // The lowest friction level (minFrictionLevel) is already calculated
    // We need to filter openTasks for this level and sort by creation time
    const lowestTasks = openTasks.filter(t => t.friction === minFrictionLevel);
    // Sort by createdAt ascending (oldest first)
    return lowestTasks.sort((a, b) => a.createdAt - b.createdAt)[0];
  };

  const renderViewButton = () => {
    switch (viewState) {
      case "collapsed": return <ChevronDown size={16} />;
      case "lowest": return <Target size={16} />;
      case "expanded": return <ChevronUp size={16} />;
    }
  };

  return (
    <div
      className={`
      relative group flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300
      ${
        project.status === "hot"
          ? "border-orange-200 shadow-md"
          : "border-slate-200"
      }
    `}
    >
      <div className="p-3 flex items-center justify-between border-b border-slate-50 bg-white">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={handleToggleView}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            {renderViewButton()}
          </button>

          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-slate-800 text-base truncate pr-2">
              {project.name}
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative group/status inline-block">
                <button
                  className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                    STATUS_CONFIG[project.status].bg
                  } ${STATUS_CONFIG[project.status].color}`}
                >
                  {STATUS_CONFIG[project.status].label}
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 hidden group-hover/status:flex flex-col p-1 w-24">
                  {(Object.keys(STATUS_CONFIG) as ProjectStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => onChangeProjectStatus(project.id, s)}
                      className="text-left px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded"
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDeleteProject(project.id)}
          className="text-slate-500 hover:text-red-400"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="h-1 w-full bg-slate-100">
        <div
          className={`h-full transition-all duration-500 ${barStyle.className}`}
          style={{ width: barStyle.width }}
        />
      </div>

      {viewState !== "collapsed" && (
        <div className="p-3 flex-1 flex flex-col gap-3">
          {viewState === "expanded" && (
            <form onSubmit={handleAddTask} className="flex gap-1.5 items-center">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Task..."
                className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <div className="flex bg-slate-50 p-0.5 rounded-md border border-slate-100">
                {(["none", "low", "moderate", "high"] as FrictionLevel[]).map(
                  (level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setNewTaskFriction(level)}
                      className={`
                      w-5 h-5 flex items-center justify-center rounded text-[8px] font-bold transition-all
                      ${
                        newTaskFriction === level
                          ? "bg-white shadow-sm text-indigo-600 border border-slate-100"
                          : "text-slate-300 hover:text-slate-500"
                      }
                    `}
                      title={level}
                    >
                      {level[0].toUpperCase()}
                    </button>
                  )
                )}
              </div>
              <button
                type="submit"
                className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Plus size={14} />
              </button>
            </form>
          )}

          <div className="space-y-1.5">
            {viewState === "expanded" ? (
              openTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onToggleToday={onToggleToday}
                  onCycleFriction={onCycleFriction}
                  onUpdate={onUpdateTask}
                />
              ))
            ) : (
              // Lowest view
              (() => {
                const targetTask = getLowestFrictionTask();
                return targetTask ? (
                  <TaskItem
                    key={targetTask.id}
                    task={targetTask}
                    onToggle={onToggleTask}
                    onDelete={onDeleteTask}
                    onToggleToday={onToggleToday}
                    onCycleFriction={onCycleFriction}
                    onUpdate={onUpdateTask}
                  />
                ) : null;
              })()
            )}
          </div>

          {viewState === "expanded" && (
            <div className="pt-2 border-t border-slate-50">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="w-full flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-400 hover:text-slate-600 py-1 rounded hover:bg-slate-50 transition-colors"
              >
                {showCompleted ? <EyeOff size={12} /> : <Eye size={12} />}
                {showCompleted ? "Hide" : "Show"} Completed (
                {completedTasks.length})
              </button>

              {showCompleted && completedTasks.length > 0 && (
                <div className="mt-2 space-y-1">
                  {completedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={onToggleTask}
                      onDelete={onDeleteTask}
                      showCompleted
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
