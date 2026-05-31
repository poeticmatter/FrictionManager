import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../store';
import { ProjectCard } from '../components/ProjectCard';
import { NewProjectPanel } from '../components/NewProjectPanel';
import { calculateWarmth, calculateProjectFriction, getFrictionValue } from '../utils/calculations';

type SortOption = 'Warmth' | 'Friction' | 'Recent';

const Dashboard: React.FC = () => {
  const { userName, projects, tasks } = useStore();
  const [sortActive, setSortActive] = useState<SortOption>('Recent');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Filter out resting projects
  const activeProjects = projects.filter(p => !p.restingAt);

  const sortedProjects = useMemo(() => {
    return [...activeProjects].sort((a, b) => {
      if (sortActive === 'Recent') {
        return new Date(b.lastTouchedAt).getTime() - new Date(a.lastTouchedAt).getTime();
      }

      if (sortActive === 'Warmth') {
        const warmthOrder = { 'Hot': 3, 'Warm': 2, 'Cold': 1 };
        const wA = warmthOrder[calculateWarmth(a.lastTouchedAt)];
        const wB = warmthOrder[calculateWarmth(b.lastTouchedAt)];
        if (wA !== wB) return wB - wA; // Hottest first
        // Fallback to recent
        return new Date(b.lastTouchedAt).getTime() - new Date(a.lastTouchedAt).getTime();
      }

      if (sortActive === 'Friction') {
        const fA = getFrictionValue(calculateProjectFriction(tasks, a.id));
        const fB = getFrictionValue(calculateProjectFriction(tasks, b.id));
        if (fA !== fB) return fA - fB; // Lowest first
        // Fallback to recent
        return new Date(b.lastTouchedAt).getTime() - new Date(a.lastTouchedAt).getTime();
      }

      return 0;
    });
  }, [activeProjects, sortActive, tasks]);

  const sortButtons: SortOption[] = ['Warmth', 'Friction', 'Recent'];

  return (
    <div className="relative min-h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-serif text-slate-800 tracking-tight">
            {userName}'s projects
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            {activeProjects.length} active {activeProjects.length === 1 ? 'thought' : 'thoughts'}
          </p>
        </div>

        <div className="flex bg-white rounded-full p-1 border border-slate-200/60 shadow-sm self-start">
          {sortButtons.map(opt => (
            <button
              key={opt}
              onClick={() => setSortActive(opt)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                sortActive === opt
                  ? 'bg-sage/20 text-sage-900'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {sortedProjects.length === 0 ? (
        <div className="text-center py-24 bg-white/50 rounded-3xl border border-slate-200/60 border-dashed">
          <p className="text-slate-500 mb-4">No active projects.</p>
          <button
            onClick={() => setIsPanelOpen(true)}
            className="text-terracotta font-medium hover:underline"
          >
            Start a new thought
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsPanelOpen(true)}
        className="fixed bottom-20 md:bottom-12 right-6 md:right-12 w-14 h-14 bg-terracotta text-white rounded-full shadow-lg hover:bg-terracotta/90 hover:scale-105 transition-all flex items-center justify-center z-30"
        aria-label="Add project"
      >
        <Plus size={24} />
      </button>

      <NewProjectPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
