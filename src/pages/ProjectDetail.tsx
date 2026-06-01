import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, Trash2, Edit2, X, Flame, Sun, Snowflake } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store';
import { calculateWarmth, calculateTaskFriction, getFrictionValue } from '../utils/calculations';
import type { Task, Warmth } from '../types';

const WarmthIcon = ({ warmth }: { warmth: Warmth }) => {
  switch (warmth) {
    case 'Hot': return <Flame size={20} className="text-terracotta" />;
    case 'Warm': return <Sun size={20} className="text-amber" />;
    case 'Cold': return <Snowflake size={20} className="text-slate-400" />;
  }
};

const TaskItem: React.FC<{ task: Task; onToggle: () => void; onDelete: () => void }> = ({ task, onToggle, onDelete }) => {
  const friction = calculateTaskFriction(task);
  const val = getFrictionValue(friction);

  return (
    <div className="group flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <button
        onClick={onToggle}
        className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
          task.completedAt
            ? 'bg-slate-800 border-slate-800 text-white'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        {task.completedAt && <Check size={14} strokeWidth={3} />}
      </button>

      <div className={`flex-1 ${task.completedAt ? 'opacity-50 line-through text-slate-500' : 'text-slate-800'}`}>
        {task.text}
      </div>

      {!task.completedAt && friction !== 'None' && (
        <div
          className="flex gap-1 shrink-0 mt-1.5"
          title={`Sitting here since ${format(new Date(task.createdAt), 'MMM d, yyyy')}`}
        >
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i <= val ? 'bg-slate-400' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      )}

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all shrink-0 mt-0.5 p-1"
        aria-label="Delete task"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const projects = useStore(state => state.projects);
  const tasks = useStore(state => state.tasks);
  const sessionLogs = useStore(state => state.sessionLogs);

  const project = React.useMemo(() => projects.find(p => p.id === id), [projects, id]);
  const projectTasks = React.useMemo(() => tasks.filter(t => t.projectId === id), [tasks, id]);
  const logs = React.useMemo(() => 
    sessionLogs
      .filter(l => l.projectId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [sessionLogs, id]
  );

  const {
    updateProject, deleteProject, addTask, toggleTaskCompletion,
    deleteTask, addSessionLog, touchProject
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSellSheet, setEditSellSheet] = useState('');
  const [editTags, setEditTags] = useState('');

  const [newTaskText, setNewTaskText] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [newLogText, setNewLogText] = useState('');

  if (!project) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-serif text-slate-800 mb-4">Project not found</h2>
        <button onClick={() => navigate('/')} className="text-terracotta hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleEditInit = () => {
    setEditName(project.name);
    setEditSellSheet(project.sellSheet);
    setEditTags(project.tags);
    setIsEditing(true);
  };

  const handleEditSave = () => {
    if (!editName.trim()) return;
    updateProject(project.id, {
      name: editName.trim(),
      sellSheet: editSellSheet.trim(),
      tags: editTags.trim(),
    });
    touchProject(project.id);
    setIsEditing(false);
  };

  const handleDeleteProject = () => {
    if (window.confirm('Are you sure you want to delete this project? This will permanently delete all its tasks and session logs.')) {
      deleteProject(project.id);
      navigate('/');
    }
  };

  const warmth = calculateWarmth(project.lastTouchedAt);
  const tags = project.tags.split(',').map(t => t.trim()).filter(Boolean);

  const incompleteTasks = projectTasks.filter(t => !t.completedAt).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const completedTasks = projectTasks.filter(t => t.completedAt).sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  return (
    <div className="pb-12">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        <span className="text-sm font-medium">Dashboard</span>
      </button>

      {/* Header Section */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm mb-8 relative group">
        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <X size={18} />
              </button>
              <button onClick={handleEditSave} className="p-2 text-terracotta hover:bg-terracotta/10 rounded-full">
                <Check size={18} />
              </button>
            </>
          ) : (
            <button onClick={handleEditInit} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full" title="Edit project">
              <Edit2 size={18} />
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4 max-w-2xl pr-20">
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full text-4xl font-serif text-slate-800 bg-slate-50 border-b border-slate-300 focus:border-terracotta outline-none pb-1"
              placeholder="Project Name"
            />
            <textarea
              value={editSellSheet}
              onChange={e => setEditSellSheet(e.target.value)}
              className="w-full text-lg italic text-slate-600 bg-slate-50 border-b border-slate-300 focus:border-terracotta outline-none pb-1 resize-none"
              placeholder="Sell sheet..."
              rows={2}
            />
            <input
              value={editTags}
              onChange={e => setEditTags(e.target.value)}
              className="w-full text-sm text-slate-600 bg-slate-50 border-b border-slate-300 focus:border-terracotta outline-none pb-1"
              placeholder="Tags (comma separated)"
            />
          </div>
        ) : (
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl font-serif text-slate-800 leading-tight">
                {project.name}
              </h1>
              <div
                className="mt-2 shrink-0 p-1.5 rounded-full bg-slate-50 border border-slate-100"
                title={`Last touched: ${format(new Date(project.lastTouchedAt), 'MMM d, yyyy')} (${warmth})`}
              >
                <WarmthIcon warmth={warmth} />
              </div>
            </div>

            {project.sellSheet && (
              <p className="text-lg italic text-slate-600 mb-6">
                {project.sellSheet}
              </p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-sage/10 text-sage text-sm font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks Section */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-serif text-slate-800 mb-6">Tasks</h2>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <form
              onSubmit={e => {
                e.preventDefault();
                if (newTaskText.trim()) {
                  addTask(project.id, newTaskText.trim());
                  setNewTaskText('');
                }
              }}
              className="flex items-center gap-3 mb-6"
            >
              <button
                type="submit"
                disabled={!newTaskText.trim()}
                className="w-6 h-6 rounded flex items-center justify-center bg-terracotta text-white disabled:opacity-50 transition-opacity"
              >
                <Plus size={16} />
              </button>
              <input
                type="text"
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 bg-transparent border-b border-slate-200 focus:border-terracotta outline-none py-1 text-slate-800 placeholder-slate-400"
              />
            </form>

            <div className="space-y-1 mb-6">
              {incompleteTasks.length === 0 ? (
                <p className="text-slate-400 text-sm italic py-4">No active tasks.</p>
              ) : (
                incompleteTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTaskCompletion(task.id)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))
              )}
            </div>

            {completedTasks.length > 0 && (
              <div>
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-sm text-slate-500 font-medium hover:text-slate-800 transition-colors"
                >
                  {showCompleted ? 'Hide completed' : `Show completed (${completedTasks.length})`}
                </button>

                {showCompleted && (
                  <div className="mt-4 space-y-1 opacity-70">
                    {completedTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={() => toggleTaskCompletion(task.id)}
                        onDelete={() => deleteTask(task.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Session Log Section */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-serif text-slate-800 mb-6">Session Log</h2>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6">
              {logs.length === 0 ? (
                <p className="text-slate-400 text-sm italic">No entries yet.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="group">
                    <div className="text-xs font-medium text-slate-400 mb-1">
                      {format(new Date(log.date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {log.entry}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <textarea
                value={newLogText}
                onChange={e => setNewLogText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newLogText.trim()) {
                      addSessionLog(project.id, newLogText.trim());
                      setNewLogText('');
                    }
                  }
                }}
                placeholder="Paste AI summary or log a thought (Press Enter to save)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
                rows={3}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-slate-400">Shift+Enter for new line</span>
                <button
                  onClick={() => {
                    if (newLogText.trim()) {
                      addSessionLog(project.id, newLogText.trim());
                      setNewLogText('');
                    }
                  }}
                  disabled={!newLogText.trim()}
                  className="px-4 py-1.5 bg-slate-800 text-white text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
                >
                  Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-red-100 flex justify-end">
        <button
          onClick={handleDeleteProject}
          className="text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
        >
          <Trash2 size={16} />
          Delete Project
        </button>
      </div>
    </div>
  );
};

export default ProjectDetail;
