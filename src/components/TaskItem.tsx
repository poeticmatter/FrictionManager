import React, { useState } from "react";
import {
  CheckCircle,
  Zap,
  CheckCircle2,
  Trash2,
  Pencil,
  Check,
  CornerLeftUp,
  Lock,
} from "lucide-react";
import type { Task, FrictionLevel } from "../types";
import { FrictionBar } from "./FrictionBar";
import { FrictionSelector } from "./FrictionSelector";

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleToday?: (taskId: string) => void;
  onCycleFriction?: (taskId: string, current: FrictionLevel) => void;
  onUpdate?: (
    taskId: string,
    text: string,
    friction: FrictionLevel,
    blockedBy?: string | null
  ) => void;
  showCompleted?: boolean;
  projectName?: string;
  possibleBlockers?: Task[];
  depth?: number;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onToggleToday,
  onUpdate,
  showCompleted = false,
  projectName,
  possibleBlockers = [],
  depth = 0,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(task.text);
  const [editedFriction, setEditedFriction] = useState<FrictionLevel>(
    task.friction
  );
  const [editedBlockedBy, setEditedBlockedBy] = useState<string | undefined>(
    task.blockedBy
  );

  const isBlocked = depth > 0;

  const handleSave = () => {
    if (editedText.trim() && onUpdate) {
      onUpdate(task.id, editedText, editedFriction, editedBlockedBy || null);
      setIsEditing(false);
    }
  };

  if (task.completed && showCompleted) {
    return (
      <div className="flex items-center gap-2 p-1.5 rounded bg-slate-50 border border-transparent">
        <button
          onClick={() => onToggle(task.id)}
          className="text-emerald-500 hover:text-emerald-600"
        >
          <CheckCircle2 size={14} />
        </button>
        <span className="text-[10px] line-through text-slate-500 flex-1">
          {task.text}
        </span>
        <button
          onClick={() => onDelete(task.id)}
          className="text-slate-300 hover:text-red-400"
        >
          <Trash2 size={12} />
        </button>
      </div>
    );
  }

  if (task.completed && !showCompleted) return null;

  return (
    <div
      className="group/task relative flex flex-col p-2 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-100 hover:border-slate-200"
      style={{ marginLeft: `${depth * 1.5}rem` }}
    >
      {/* Blocked Indicator Arrow */}
      {depth > 0 && (
        <div className="absolute left-[-18px] top-3 text-slate-300">
          <CornerLeftUp size={16} />
        </div>
      )}

      {/* Main Content Row */}
      <div className="flex items-start gap-2 mb-2">
        <button
          onClick={() => onToggle(task.id)}
          className="p-0.5 text-emerald-500 rounded transition-colors"
        >
          <CheckCircle size={14} />
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full text-xs px-1.5 py-1 bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          ) : (
            <>
              <span className="text-xs text-slate-700 leading-snug break-words block">
                {task.text}
              </span>
              {projectName && (
                <span className="mt-1 inline-block text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                  {projectName}
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex flex-row items-end gap-1 flex-shrink-0">
          {onToggleToday &&
            (isBlocked ? (
              <div className="p-0.5 text-slate-300" title="Blocked">
                <Lock size={14} />
              </div>
            ) : (
              <button
                onClick={() => onToggleToday(task.id)}
                className={`
                  p-0.5 rounded transition-colors
                  ${
                    task.isToday
                      ? "text-amber-500"
                      : "text-slate-500 hover:text-amber-500"
                  }
                `}
                title="Do Today"
              >
                <Zap size={14} fill={task.isToday ? "currentColor" : "none"} />
              </button>
            ))}

          {onUpdate && (
            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setEditedText(task.text);
                  setEditedFriction(task.friction);
                  setEditedBlockedBy(task.blockedBy);
                  setIsEditing(true);
                }
              }}
              className={`p-0.5 rounded transition-colors ${
                isEditing
                  ? "text-emerald-500"
                  : "text-slate-500 hover:text-indigo-500"
              }`}
            >
              {isEditing ? <Check size={14} /> : <Pencil size={14} />}
            </button>
          )}

          <button
            onClick={() => onDelete(task.id)}
            className="p-0.5 rounded transition-colors text-slate-500 hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Edit Mode Friction Selection */}
      {isEditing && (
        <div className="flex flex-col gap-2 pl-6 mb-2">
          <FrictionSelector
            value={editedFriction}
            onChange={setEditedFriction}
          />

          {possibleBlockers.length > 0 && (
            <select
              value={editedBlockedBy || ""}
              onChange={(e) => setEditedBlockedBy(e.target.value || undefined)}
              className="text-xs p-1 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-full"
            >
              <option value="">No Blocker</option>
              {possibleBlockers.map((blocker) => (
                <option key={blocker.id} value={blocker.id}>
                  Blocked by: {blocker.text}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Friction Bar */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center h-1 rounded-full transition-all duration-300 pointer-events-none">
        <FrictionBar
          level={isEditing ? editedFriction : task.friction}
          className="rounded-full"
        />
      </div>
    </div>
  );
};
