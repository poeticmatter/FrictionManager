import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  ChevronsDown,
  Flame,
  Snowflake,
  Lightbulb,
} from "lucide-react";
import type { Project, Task, FrictionLevel, ProjectStatus } from "../types";
import { FRICTION_CONFIG, STATUS_CONFIG } from "../config";
import { TaskItem } from "./TaskItem";
import { FrictionBar } from "./FrictionBar";
import { FrictionSelector } from "./FrictionSelector";

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
    friction: FrictionLevel,
    blockedBy?: string | null
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
  const [viewState, setViewState] = useState<
    "collapsed" | "lowest" | "expanded"
  >("collapsed");
  const [showCompleted, setShowCompleted] = useState(false);

  const openTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Helper to determine if a task is effectively blocked
  const isEffectivelyBlocked = (task: Task): boolean => {
    if (!task.blockedBy) return false;
    const blocker = tasks.find((t) => t.id === task.blockedBy);
    // If blocker not found, or blocker is completed, it's effectively unblocked
    if (!blocker || blocker.completed) return false;
    return true;
  };

  // Find task with lowest friction score among UNBLOCKED tasks
  let minScore = Infinity;
  let minFrictionLevel: FrictionLevel = "none";

  const availableTasks = openTasks.filter((t) => !isEffectivelyBlocked(t));

  if (availableTasks.length > 0) {
    availableTasks.forEach((task) => {
      const score = FRICTION_CONFIG[task.friction].score;
      if (score < minScore) {
        minScore = score;
        minFrictionLevel = task.friction;
      }
    });
  }

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
    if (availableTasks.length === 0) return null;

    // Filter availableTasks for the pre-calculated minFrictionLevel
    const lowestTasks = availableTasks.filter(
      (t) => t.friction === minFrictionLevel
    );
    // Sort by createdAt ascending (oldest first)
    return lowestTasks.sort((a, b) => a.createdAt - b.createdAt)[0];
  };

  const renderViewButton = () => {
    switch (viewState) {
      case "collapsed":
        return <ChevronUp size={16} />;
      case "lowest":
        return <ChevronDown size={16} />;
      case "expanded":
        return <ChevronsDown size={16} />;
    }
  };

  // Tree Rendering Logic
  const renderTaskTree = (
    rootTask: Task,
    depth: number,
    renderedIds: Set<string>
  ): React.ReactNode => {
    renderedIds.add(rootTask.id);
    const children = openTasks.filter((t) => t.blockedBy === rootTask.id);
    // Note: children are tasks explicitly blocked by this task.
    // If this task is complete, it wouldn't be in openTasks, so this function wouldn't be called for it as a root.
    // But if we are recursing, we are looking for open tasks blocked by THIS task.

    return (
      <React.Fragment key={rootTask.id}>
        <TaskItem
          task={rootTask}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
          onToggleToday={onToggleToday}
          onCycleFriction={onCycleFriction}
          onUpdate={onUpdateTask}
          possibleBlockers={openTasks.filter((t) => t.id !== rootTask.id)}
          depth={depth}
        />
        {children.map((child) => renderTaskTree(child, depth + 1, renderedIds))}
      </React.Fragment>
    );
  };

  const renderOpenTasks = () => {
    const renderedIds = new Set<string>();

    // 1. Identify Roots: Tasks that are NOT effectively blocked by an open task.
    // Basically, either blockedBy is null, OR blockedBy points to completed task.
    // Since we are iterating openTasks, if blockedBy points to a completed task, it's effectively unblocked.
    // If blockedBy points to an open task, it is blocked.
    // So "roots" are those where !isEffectivelyBlocked(t).

    // Note: If there's a cycle, they are all effectively blocked. They might not appear if we only render roots.
    // To handle this, we render roots first, then anyone else not yet rendered (orphans/cycles).

    const roots = openTasks.filter((t) => !isEffectivelyBlocked(t));

    // Sort roots by creation time (or whatever default sort was)
    // The original code rendered `openTasks` (array from props) which presumably was sorted or order preserved.
    // We should probably respect creation order for roots.
    const sortedRoots = roots.sort((a, b) => a.createdAt - b.createdAt);

    const treeNodes = sortedRoots.map((root) =>
      renderTaskTree(root, 0, renderedIds)
    );

    // Check for orphaned tasks (circular dependencies or data anomalies)
    const orphans = openTasks.filter((t) => !renderedIds.has(t.id));

    return (
      <>
        {treeNodes}
        {orphans.length > 0 && (
          <div className="border-t border-slate-100 pt-2 mt-2">
            <div className="text-[10px] text-slate-400 mb-1 px-2">
              Cycles / Orphans
            </div>
            {orphans.map((orphan) => (
              <TaskItem
                key={orphan.id}
                task={orphan}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onToggleToday={onToggleToday}
                onCycleFriction={onCycleFriction}
                onUpdate={onUpdateTask}
                possibleBlockers={openTasks.filter((t) => t.id !== orphan.id)}
                depth={0} // Render at root level
              />
            ))}
          </div>
        )}
      </>
    );
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
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  project.status !== "idea" &&
                  onChangeProjectStatus(project.id, "idea")
                }
                className={`p-0.5 rounded ${
                  project.status === "idea"
                    ? STATUS_CONFIG.idea.color
                    : "text-slate-300 hover:text-slate-500"
                }`}
              >
                <Lightbulb size={14} />
              </button>
              <button
                onClick={() =>
                  project.status !== "cold" &&
                  onChangeProjectStatus(project.id, "cold")
                }
                className={`p-0.5 rounded ${
                  project.status === "cold"
                    ? STATUS_CONFIG.cold.color
                    : "text-slate-300 hover:text-slate-500"
                }`}
              >
                <Snowflake size={14} />
              </button>
              <button
                onClick={() =>
                  project.status !== "hot" &&
                  onChangeProjectStatus(project.id, "hot")
                }
                className={`p-0.5 rounded ${
                  project.status === "hot"
                    ? STATUS_CONFIG.hot.color
                    : "text-slate-300 hover:text-slate-500"
                }`}
              >
                <Flame size={14} />
              </button>
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

      <div className="h-1 w-full bg-slate-100 flex justify-center">
        <FrictionBar
          level={minFrictionLevel}
          className="h-full transition-all duration-500"
        />
      </div>

      {viewState !== "collapsed" && (
        <div className="p-3 flex-1 flex flex-col gap-3">
          {viewState === "expanded" && (
            <form
              onSubmit={handleAddTask}
              className="flex gap-1.5 items-center"
            >
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Task..."
                className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <div className="flex bg-slate-50 p-0.5 rounded-md border border-slate-100">
                <FrictionSelector
                  value={newTaskFriction}
                  onChange={setNewTaskFriction}
                />
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
              renderOpenTasks()
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
