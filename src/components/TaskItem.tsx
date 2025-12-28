import React from 'react';
import { Circle, Zap, X, CheckCircle2, Trash2 } from 'lucide-react';
import type { Task, FrictionLevel } from '../types';
import { FrictionBadge } from './FrictionBadge';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onToggleToday?: (taskId: string) => void;
  onCycleFriction?: (taskId: string, current: FrictionLevel) => void;
  showCompleted?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onToggleToday,
  onCycleFriction,
  showCompleted = false
}) => {
  if (task.completed && showCompleted) {
    return (
      <div className="flex items-center gap-2 p-1.5 rounded bg-slate-50 border border-transparent">
        <button
          onClick={() => onToggle(task.id)}
          className="text-emerald-500 hover:text-emerald-600"
        >
          <CheckCircle2 size={14} />
        </button>
        <span className="text-[10px] line-through text-slate-500 flex-1">{task.text}</span>
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
    <div className="group/task flex items-start gap-2 p-2 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-100 hover:border-slate-200">
      <button
        onClick={() => onToggle(task.id)}
        className="mt-0.5 text-slate-300 hover:text-emerald-500 transition-colors flex-shrink-0"
      >
        <Circle size={16} />
      </button>

      <span className="flex-1 text-xs text-slate-700 leading-snug break-words">{task.text}</span>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-1">
          {onCycleFriction && <FrictionBadge level={task.friction} onClick={() => onCycleFriction(task.id, task.friction)} />}

          {onToggleToday && (
            <button
              onClick={() => onToggleToday(task.id)}
              className={`
                p-0.5 rounded transition-colors
                ${task.isToday ? 'text-amber-500' : 'text-slate-200 hover:text-amber-500'}
              `}
              title="Do Today"
            >
              <Zap size={14} fill={task.isToday ? "currentColor" : "none"} />
            </button>
          )}
        </div>

         <button
          onClick={() => onDelete(task.id)}
          className="text-slate-200 hover:text-red-400 opacity-0 group-hover/task:opacity-100 transition-opacity"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};
