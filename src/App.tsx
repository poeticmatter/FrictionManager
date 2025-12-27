import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Flame, 
  Snowflake, 
  Lightbulb, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Zap, 
  Gauge, 
  Layout,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  EyeOff,
  Download,
  Upload,
  Database,
  HardDrive
} from 'lucide-react';

// --- Types ---

type FrictionLevel = 'none' | 'low' | 'moderate' | 'high';
type ProjectStatus = 'hot' | 'cold' | 'idea';

interface Task {
  id: string;
  projectId: string;
  text: string;
  friction: FrictionLevel;
  isToday: boolean;
  completed: boolean;
  createdAt: number;
}

interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: number;
}

interface BackupData {
  projects: Project[];
  tasks: Task[];
  exportedAt: number;
}

// --- Friction Config ---

const FRICTION_CONFIG = {
  none: { label: 'None', score: 0, color: 'text-gray-400', bg: 'bg-gray-100', border: 'border-gray-200' },
  low: { label: 'Low', score: 1, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  moderate: { label: 'Mod', score: 3, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  high: { label: 'High', score: 5, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
};

const STATUS_CONFIG = {
  hot: { label: 'Hot', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  cold: { label: 'Cold', icon: Snowflake, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
  idea: { label: 'Idea', icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
};

// --- Components ---

const FrictionBadge = ({ level, onClick }: { level: FrictionLevel, onClick?: () => void }) => {
  const config = FRICTION_CONFIG[level];
  return (
    <span 
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`
        px-2 py-0.5 rounded text-[10px] font-bold border ${config.border} ${config.bg} ${config.color} 
        ${onClick ? 'cursor-pointer hover:opacity-80 select-none hover:shadow-sm' : ''}
        uppercase tracking-wide transition-all
      `}
      title={onClick ? "Click to cycle friction" : ""}
    >
      {config.label}
    </span>
  );
};

const DataTools = ({ 
  onExport, 
  onImport 
}: { 
  onExport: () => void, 
  onImport: (data: BackupData) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.projects) && Array.isArray(json.tasks)) {
          onImport(json);
          setIsOpen(false);
        } else {
          alert("Invalid backup file format");
        }
      } catch (err) {
        alert("Failed to parse JSON");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
        title="Data Backup & Restore"
      >
        <Database size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
          <div className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider flex items-center gap-1">
             <HardDrive size={10} /> Local Storage Data
          </div>
          <button 
            onClick={onExport}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg text-left transition-colors"
          >
            <Download size={16} className="text-emerald-500" />
            <span>Export Backup (JSON)</span>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg text-left transition-colors"
          >
            <Upload size={16} className="text-blue-500" />
            <span>Import Backup</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept=".json"
            onChange={handleFileChange}
          />
          <div className="mt-2 px-2 pb-1 border-t border-slate-50 pt-2">
             <p className="text-[10px] text-slate-400 leading-relaxed">
               Data is stored in your browser. Export before clearing cache or moving devices.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectCard = ({ 
  project, 
  tasks, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask, 
  onToggleToday, 
  onChangeProjectStatus, 
  onDeleteProject,
  onCycleFriction
}: { 
  project: Project, 
  tasks: Task[], 
  onAddTask: (projectId: string, text: string, friction: FrictionLevel) => void,
  onToggleTask: (taskId: string) => void,
  onDeleteTask: (taskId: string) => void,
  onToggleToday: (taskId: string) => void,
  onChangeProjectStatus: (projectId: string, status: ProjectStatus) => void,
  onDeleteProject: (projectId: string) => void,
  onCycleFriction: (taskId: string, current: FrictionLevel) => void
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskFriction, setNewTaskFriction] = useState<FrictionLevel>('low');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  const openTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  const frictionScore = openTasks.reduce((acc, task) => acc + FRICTION_CONFIG[task.friction].score, 0);
  
  const maxFriction = 20; 
  const frictionPercentage = Math.min((frictionScore / maxFriction) * 100, 100);
  let frictionBarColor = 'bg-emerald-400';
  if (frictionScore > 5) frictionBarColor = 'bg-amber-400';
  if (frictionScore > 12) frictionBarColor = 'bg-rose-400';

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(project.id, newTaskText, newTaskFriction);
    setNewTaskText('');
  };

  return (
    <div className={`
      relative group flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300
      ${project.status === 'hot' ? 'border-orange-200 shadow-md' : 'border-slate-200'}
    `}>
      <div className="p-3 flex items-center justify-between border-b border-slate-50 bg-white">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-slate-800 text-base truncate pr-2">{project.name}</h3>
            <div className="flex items-center gap-2">
               <div className="relative group/status inline-block">
                <button className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${STATUS_CONFIG[project.status].bg} ${STATUS_CONFIG[project.status].color}`}>
                  {STATUS_CONFIG[project.status].label}
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 hidden group-hover/status:flex flex-col p-1 w-24">
                  {(Object.keys(STATUS_CONFIG) as ProjectStatus[]).map(s => (
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
              
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium" title="Friction Score">
                <Gauge size={10} /> {frictionScore}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onDeleteProject(project.id)}
          className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="h-1 w-full bg-slate-100">
        <div 
          className={`h-full transition-all duration-500 ${frictionBarColor}`} 
          style={{ width: `${frictionPercentage}%` }}
        />
      </div>

      {isExpanded && (
        <div className="p-3 flex-1 flex flex-col gap-3">
          <form onSubmit={handleAddTask} className="flex gap-1.5 items-center">
            <input 
              type="text" 
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Task..."
              className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            <div className="flex bg-slate-50 p-0.5 rounded-md border border-slate-100">
              {(['none', 'low', 'moderate', 'high'] as FrictionLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setNewTaskFriction(level)}
                  className={`
                    w-5 h-5 flex items-center justify-center rounded text-[8px] font-bold transition-all
                    ${newTaskFriction === level ? 'bg-white shadow-sm text-indigo-600 border border-slate-100' : 'text-slate-300 hover:text-slate-500'}
                  `}
                  title={level}
                >
                  {level[0].toUpperCase()}
                </button>
              ))}
            </div>
            <button 
              type="submit"
              className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Plus size={14} />
            </button>
          </form>

          <div className="space-y-1.5">
            {openTasks.map(task => (
              <div key={task.id} className="group/task flex items-start gap-2 p-2 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-100 hover:border-slate-200">
                <button 
                  onClick={() => onToggleTask(task.id)}
                  className="mt-0.5 text-slate-300 hover:text-emerald-500 transition-colors flex-shrink-0"
                >
                  <Circle size={16} />
                </button>
                
                <span className="flex-1 text-xs text-slate-700 leading-snug break-words">{task.text}</span>
                
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <FrictionBadge level={task.friction} onClick={() => onCycleFriction(task.id, task.friction)} />
                    
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
                  </div>
                  
                   <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="text-slate-200 hover:text-red-400 opacity-0 group-hover/task:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-50">
            <button 
              onClick={() => setShowCompleted(!showCompleted)}
              className="w-full flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-400 hover:text-slate-600 py-1 rounded hover:bg-slate-50 transition-colors"
            >
              {showCompleted ? <EyeOff size={12} /> : <Eye size={12} />}
              {showCompleted ? 'Hide' : 'Show'} Completed ({completedTasks.length})
            </button>

            {showCompleted && completedTasks.length > 0 && (
              <div className="mt-2 space-y-1 opacity-60">
                {completedTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-1.5 rounded bg-slate-50 border border-transparent">
                     <button 
                      onClick={() => onToggleTask(task.id)}
                      className="text-emerald-500 hover:text-emerald-600"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                    <span className="text-[10px] line-through text-slate-500 flex-1">{task.text}</span>
                    <button 
                      onClick={() => onDeleteTask(task.id)}
                      className="text-slate-300 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    // Initial Load
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('friction_pm_projects');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) { console.error('Failed to parse projects'); }
      }
    }
    return [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('friction_pm_tasks');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) { console.error('Failed to parse tasks'); }
      }
    }
    return [];
  });

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState<ProjectStatus>('hot');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('friction_pm_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('friction_pm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Actions
  const addProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const project: Project = {
      id: crypto.randomUUID(),
      name: newProjectName,
      status: newProjectStatus,
      createdAt: Date.now()
    };
    setProjects([project, ...projects]);
    setNewProjectName('');
  };

  const deleteProject = (id: string) => {
    if (confirm('Delete project and all tasks?')) {
      setProjects(projects.filter(p => p.id !== id));
      setTasks(tasks.filter(t => t.projectId !== id));
    }
  };

  const updateProjectStatus = (id: string, status: ProjectStatus) => {
    setProjects(projects.map(p => p.id === id ? { ...p, status } : p));
  };

  const addTask = (projectId: string, text: string, friction: FrictionLevel) => {
    const task: Task = {
      id: crypto.randomUUID(),
      projectId,
      text,
      friction,
      isToday: false,
      completed: false,
      createdAt: Date.now()
    };
    setTasks([...tasks, task]);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const toggleToday = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, isToday: !t.isToday } : t));
  };

  const cycleFriction = (taskId: string, current: FrictionLevel) => {
    const levels: FrictionLevel[] = ['none', 'low', 'moderate', 'high'];
    const nextIndex = (levels.indexOf(current) + 1) % levels.length;
    const nextLevel = levels[nextIndex];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, friction: nextLevel } : t));
  };

  // --- Export / Import Logic ---

  const handleExport = () => {
    const data: BackupData = {
      projects,
      tasks,
      exportedAt: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `friction-pm-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (data: BackupData) => {
    if (!confirm(`Importing will replace current data with ${data.projects.length} projects and ${data.tasks.length} tasks. Continue?`)) return;

    try {
      setProjects(data.projects);
      setTasks(data.tasks);
      alert("Import successful!");
    } catch (err) {
      console.error("Import failed", err);
      alert("Import failed.");
    }
  };

  // Sort logic
  const hotProjects = projects.filter(p => p.status === 'hot').sort((a,b) => b.createdAt - a.createdAt);
  const coldProjects = projects.filter(p => p.status === 'cold').sort((a,b) => b.createdAt - a.createdAt);
  const ideaProjects = projects.filter(p => p.status === 'idea').sort((a,b) => b.createdAt - a.createdAt);
  const tasksForToday = tasks.filter(t => t.isToday && !t.completed);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Layout className="text-indigo-600" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  Friction Manager
                </h1>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                   <span>{projects.length} Projects</span>
                   <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                   <span className="text-amber-600 font-medium">
                     {tasks.filter(t => !t.completed).reduce((acc, t) => acc + FRICTION_CONFIG[t.friction].score, 0)} Friction Pts
                   </span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-2 max-w-lg">
              <form onSubmit={addProject} className="flex-1 flex gap-2">
                <input 
                  type="text" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="New Project..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
                <select 
                  value={newProjectStatus}
                  onChange={(e) => setNewProjectStatus(e.target.value as ProjectStatus)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-sm font-medium text-slate-600"
                >
                  <option value="hot">Hot</option>
                  <option value="cold">Cold</option>
                  <option value="idea">Idea</option>
                </select>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Create
                </button>
              </form>

              {/* Data Tools */}
              <div className="pl-2 border-l border-slate-100">
                 <DataTools onExport={handleExport} onImport={handleImport} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start h-full">
          
          {/* Columns */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-orange-100">
              <Flame className="text-orange-500" size={18} />
              <h2 className="font-bold text-slate-700">Hot</h2>
              <span className="text-xs text-slate-400 bg-white border border-slate-200 px-1.5 rounded-full">{hotProjects.length}</span>
            </div>
            <div className="space-y-4">
              {hotProjects.map(project => (
                 <ProjectCard 
                  key={project.id}
                  project={project}
                  tasks={tasks.filter(t => t.projectId === project.id)}
                  onAddTask={addTask}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onToggleToday={toggleToday}
                  onChangeProjectStatus={updateProjectStatus}
                  onDeleteProject={deleteProject}
                  onCycleFriction={cycleFriction}
                />
              ))}
              {hotProjects.length === 0 && <div className="text-xs text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">No active projects</div>}
            </div>
          </div>

           <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-100">
              <Snowflake className="text-slate-400" size={18} />
              <h2 className="font-bold text-slate-700">Cold</h2>
              <span className="text-xs text-slate-400 bg-white border border-slate-200 px-1.5 rounded-full">{coldProjects.length}</span>
            </div>
            <div className="space-y-4">
              {coldProjects.map(project => (
                 <ProjectCard 
                  key={project.id}
                  project={project}
                  tasks={tasks.filter(t => t.projectId === project.id)}
                  onAddTask={addTask}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onToggleToday={toggleToday}
                  onChangeProjectStatus={updateProjectStatus}
                  onDeleteProject={deleteProject}
                  onCycleFriction={cycleFriction}
                />
              ))}
               {coldProjects.length === 0 && <div className="text-xs text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">No cold projects</div>}
            </div>
          </div>

           <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-blue-100">
              <Lightbulb className="text-blue-500" size={18} />
              <h2 className="font-bold text-slate-700">Ideas</h2>
              <span className="text-xs text-slate-400 bg-white border border-slate-200 px-1.5 rounded-full">{ideaProjects.length}</span>
            </div>
            <div className="space-y-4">
              {ideaProjects.map(project => (
                 <ProjectCard 
                  key={project.id}
                  project={project}
                  tasks={tasks.filter(t => t.projectId === project.id)}
                  onAddTask={addTask}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onToggleToday={toggleToday}
                  onChangeProjectStatus={updateProjectStatus}
                  onDeleteProject={deleteProject}
                  onCycleFriction={cycleFriction}
                />
              ))}
               {ideaProjects.length === 0 && <div className="text-xs text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">No ideas yet</div>}
            </div>
          </div>

          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-amber-900 flex items-center gap-2">
                  <Zap size={20} className="text-amber-500" fill="currentColor" />
                  Today's Focus
                </h2>
                <span className="bg-white text-amber-700 text-xs font-bold px-2 py-1 rounded-full border border-amber-100">
                  {tasksForToday.length}
                </span>
              </div>
              
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 custom-scrollbar">
                {tasksForToday.length === 0 ? (
                  <div className="py-8 text-center text-amber-800/40 text-sm">
                    <p>No tasks yet.</p>
                    <p className="text-xs mt-1">Select tasks from your projects.</p>
                  </div>
                ) : (
                  tasksForToday.map(task => {
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <div key={task.id} className="p-3 bg-white border border-amber-100 rounded-lg shadow-sm group">
                        <div className="flex items-start gap-2">
                          <button 
                            onClick={() => toggleTask(task.id)}
                            className="mt-0.5 text-slate-300 hover:text-emerald-500 transition-colors"
                          >
                            <Circle size={16} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 leading-snug break-words">{task.text}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                                {project?.name}
                              </span>
                              <FrictionBadge level={task.friction} />
                            </div>
                          </div>
                          <button 
                            onClick={() => toggleToday(task.id)}
                            className="text-amber-400 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}