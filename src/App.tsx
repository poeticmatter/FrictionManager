import { 
  Flame, 
  Snowflake, 
  Lightbulb, 
  Zap, 
  Layout,
} from 'lucide-react';

import { useProjectStore } from './hooks/useProjectStore';
import type { ProjectStatus } from './types';
import { ProjectColumn } from './components/ProjectColumn';
import { DataTools } from './components/DataTools';
import { TaskItem } from './components/TaskItem';

export default function App() {
  const {
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
  } = useProjectStore();

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
          
          <ProjectColumn
            title="Hot"
            icon={Flame}
            iconColor="text-orange-500"
            count={hotProjects.length}
            projects={hotProjects}
            tasks={tasks}
            borderColor="border-orange-100"
            emptyMessage="No active projects"
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onToggleToday={toggleToday}
            onChangeProjectStatus={updateProjectStatus}
            onDeleteProject={deleteProject}
            onCycleFriction={cycleFriction}
            onUpdateTask={updateTask}
          />

          <ProjectColumn
            title="Cold"
            icon={Snowflake}
            iconColor="text-slate-400"
            count={coldProjects.length}
            projects={coldProjects}
            tasks={tasks}
            borderColor="border-slate-100"
            emptyMessage="No cold projects"
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onToggleToday={toggleToday}
            onChangeProjectStatus={updateProjectStatus}
            onDeleteProject={deleteProject}
            onCycleFriction={cycleFriction}
            onUpdateTask={updateTask}
          />

          <ProjectColumn
            title="Ideas"
            icon={Lightbulb}
            iconColor="text-blue-500"
            count={ideaProjects.length}
            projects={ideaProjects}
            tasks={tasks}
            borderColor="border-blue-100"
            emptyMessage="No ideas yet"
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onToggleToday={toggleToday}
            onChangeProjectStatus={updateProjectStatus}
            onDeleteProject={deleteProject}
            onCycleFriction={cycleFriction}
            onUpdateTask={updateTask}
          />

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
                      <div key={task.id} className="bg-white border border-amber-100 rounded-lg shadow-sm overflow-hidden">
                        <TaskItem
                          task={task}
                          onToggle={toggleTask}
                          onDelete={deleteTask}
                          onToggleToday={toggleToday}
                          onUpdate={updateTask}
                          projectName={project?.name}
                        />
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
