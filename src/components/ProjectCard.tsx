import React from 'react';
import { Flame, Snowflake, Sun } from 'lucide-react';
import { format } from 'date-fns';
import type { Project, Warmth, Friction } from '../types';
import { calculateWarmth, calculateProjectFriction, getFrictionValue } from '../utils/calculations';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

const WarmthIcon = ({ warmth }: { warmth: Warmth }) => {
  switch (warmth) {
    case 'Hot': return <Flame size={16} className="text-terracotta" />;
    case 'Warm': return <Sun size={16} className="text-amber" />;
    case 'Cold': return <Snowflake size={16} className="text-slate-400" />;
  }
};

const FrictionDots = ({ friction }: { friction: Friction }) => {
  if (friction === 'None') return null;

  const val = getFrictionValue(friction);
  return (
    <div className="flex gap-1" title={`Friction: ${friction}`}>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i <= val ? 'bg-slate-400' : 'bg-slate-200'}`}
        />
      ))}
    </div>
  );
};

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const navigate = useNavigate();
  const tasks = useStore(state => state.tasks);

  const warmth = calculateWarmth(project.lastTouchedAt);
  const friction = calculateProjectFriction(tasks, project.id);
  const tags = project.tags.split(',').map(t => t.trim()).filter(Boolean);

  return (
    <div
      onClick={() => navigate(`/project/${project.id}`)}
      className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-3 gap-4">
        <h3 className="font-serif text-xl font-medium text-slate-800 leading-tight">
          {project.name}
        </h3>
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <div title={`Last touched: ${format(new Date(project.lastTouchedAt), 'MMM d, yyyy')}`}>
            <WarmthIcon warmth={warmth} />
          </div>
          {friction !== 'None' && <span className="text-xs text-slate-300 font-medium ml-1">·</span>}
          <FrictionDots friction={friction} />
        </div>
      </div>

      <p className="text-slate-600 italic text-sm line-clamp-2 mb-4 flex-grow">
        {project.sellSheet || "No description provided."}
      </p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-50">
          {tags.map((tag, i) => (
            <span key={i} className="px-2.5 py-1 bg-sage/10 text-sage text-xs font-medium rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
