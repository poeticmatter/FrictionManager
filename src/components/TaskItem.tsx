import React, { useState } from "react";
import {
  CheckCircle,
  Zap,
  CheckCircle2,
  Trash2,
  Pencil,
  Check,
  Wifi,
  WifiHigh,
  WifiLow,
  WifiZero,
} from "lucide-react";
import type { Task, FrictionLevel } from "../types";

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleToday?: (taskId: string) => void;
  onCycleFriction?: (taskId: string, current: FrictionLevel) => void;
  onUpdate?: (taskId: string, text: string, friction: FrictionLevel) => void;
  showCompleted?: boolean;
  projectName?: string;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onToggleToday,
  onUpdate,
  showCompleted = false,
  projectName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(task.text);
  const [editedFriction, setEditedFriction] = useState<FrictionLevel>(
    task.friction
  );

  const handleSave = () => {
    if (editedText.trim() && onUpdate) {
      onUpdate(task.id, editedText, editedFriction);
      setIsEditing(false);
    }
  };

  const getFrictionBarStyle = (level: FrictionLevel) => {
    switch (level) {
      case "none":
        return { width: "25%", className: "bg-cyan-500" };
      case "low":
        return { width: "50%", className: "bg-violet-500" };
      case "moderate":
        return { width: "75%", className: "bg-fuchsia-600" };
      case "high":
        return { width: "100%", className: "bg-rose-600" };
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

  const barStyle = getFrictionBarStyle(
    isEditing ? editedFriction : task.friction
  );

  return (
    <div className="group/task relative flex flex-col p-2 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-100 hover:border-slate-200 overflow-hidden">
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
          {onToggleToday && (
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
          )}

          {onUpdate && (
            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setEditedText(task.text);
                  setEditedFriction(task.friction);
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
        <div className="flex gap-1 pl-6 mb-2">
          {(["none", "low", "moderate", "high"] as FrictionLevel[]).map(
            (level) => {
              const Icon = {
                none: WifiZero,
                low: WifiLow,
                moderate: WifiHigh,
                high: Wifi,
              }[level];

              const activeColor = {
                none: "text-cyan-500",
                low: "text-violet-500",
                moderate: "text-fuchsia-600",
                high: "text-rose-600",
              }[level];

              const hoverColor = {
                none: "hover:text-cyan-500",
                low: "hover:text-violet-500",
                moderate: "hover:text-fuchsia-600",
                high: "hover:text-rose-600",
              }[level];

              return (
                <button
                  key={level}
                  onClick={() => setEditedFriction(level)}
                  className={`
                  p-0.5 rounded transition-all border
                  ${
                    editedFriction === level
                      ? `bg-white shadow-sm ${activeColor} border-slate-200`
                      : `text-slate-500 ${hoverColor} border-slate-200 bg-transparent`
                  }
                `}
                  title={level}
                >
                  <Icon size={14} className="rotate-90" />
                </button>
              );
            }
          )}
        </div>
      )}

      {/* Friction Bar */}
      <div
        className="absolute bottom-0 left-0 h-1 rounded-full transition-all duration-300"
        style={{
          width: barStyle.width,
          backgroundColor: "transparent", // using className for color but width inline
        }}
      >
        <div className={`h-full w-full ${barStyle.className}`} />
      </div>
    </div>
  );
};
