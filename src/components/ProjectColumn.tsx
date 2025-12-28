import React from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Project, Task, FrictionLevel, ProjectStatus } from '../types';
import { ProjectCard } from './ProjectCard';

interface ProjectColumnProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  count: number;
  projects: Project[];
  tasks: Task[];
  borderColor: string;
  emptyMessage: string;
  onAddTask: (projectId: string, text: string, friction: FrictionLevel) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleToday: (taskId: string) => void;
  onChangeProjectStatus: (projectId: string, status: ProjectStatus) => void;
  onDeleteProject: (projectId: string) => void;
  onCycleFriction: (taskId: string, current: FrictionLevel) => void;
  onUpdateTask: (taskId: string, text: string, friction: FrictionLevel) => void;
}

export const ProjectColumn: React.FC<ProjectColumnProps> = ({
  title,
  icon: Icon,
  iconColor,
  count,
  projects,
  tasks,
  borderColor,
  emptyMessage,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onToggleToday,
  onChangeProjectStatus,
  onDeleteProject,
  onCycleFriction,
  onUpdateTask
}) => {
  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 pb-2 border-b-2 ${borderColor}`}>
        <Icon className={iconColor} size={18} />
        <h2 className="font-bold text-slate-700">{title}</h2>
        <span className="text-xs text-slate-400 bg-white border border-slate-200 px-1.5 rounded-full">{count}</span>
      </div>
      <div className="space-y-4">
        {projects.map(project => (
           <ProjectCard
            key={project.id}
            project={project}
            tasks={tasks.filter(t => t.projectId === project.id)}
            onAddTask={onAddTask}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            onToggleToday={onToggleToday}
            onChangeProjectStatus={onChangeProjectStatus}
            onDeleteProject={onDeleteProject}
            onCycleFriction={onCycleFriction}
            onUpdateTask={onUpdateTask}
          />
        ))}
        {projects.length === 0 && <div className="text-xs text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">{emptyMessage}</div>}
      </div>
    </div>
  );
};
