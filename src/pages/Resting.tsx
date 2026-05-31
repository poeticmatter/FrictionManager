import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Tag } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useStore } from '../store';
import { calculateProjectFriction, getFrictionValue } from '../utils/calculations';

const Resting: React.FC = () => {
  const navigate = useNavigate();
  const { projects, tasks, wakeProject } = useStore();

  const restingProjects = projects
    .filter(p => p.restingAt)
    .sort((a, b) => new Date(b.restingAt!).getTime() - new Date(a.restingAt!).getTime());

  if (restingProjects.length === 0) {
    return (
      <div className="text-center py-24">
        <h2 className="text-3xl font-serif text-slate-800 mb-4">No resting projects</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Projects you've chosen to step away from will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-12">
        <h2 className="text-4xl font-serif text-slate-800 tracking-tight">
          Resting
        </h2>
        <p className="text-slate-500 mt-2 text-sm">
          {restingProjects.length} {restingProjects.length === 1 ? 'project' : 'projects'} gathering energy
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {restingProjects.map(project => {
            const friction = calculateProjectFriction(tasks, project.id);
            const frictionVal = getFrictionValue(friction);
            const tags = project.tags.split(',').map(t => t.trim()).filter(Boolean);

            let restingText = '';
            if (project.restingUntil) {
              const daysLeft = differenceInDays(new Date(project.restingUntil), new Date());
              restingText = daysLeft > 0 ? `${daysLeft} days left` : 'Waking soon';
            } else {
              restingText = 'Indefinitely';
            }

            return (
              <div
                key={project.id}
                className="group flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-serif text-xl font-medium text-slate-800 truncate mb-1">
                    {project.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                      <span className="text-xs uppercase tracking-wider font-medium text-slate-600">
                        {restingText}
                      </span>
                    </div>

                    <span className="text-slate-300">·</span>

                    <span title={`Resting since ${format(new Date(project.restingAt!), 'MMM d, yyyy')}`}>
                      Since {format(new Date(project.restingAt!), 'MMM d')}
                    </span>

                    {friction !== 'None' && (
                      <>
                        <span className="text-slate-300">·</span>
                        <div className="flex gap-1" title={`Friction: ${friction}`}>
                          {[1, 2, 3].map(i => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${i <= frictionVal ? 'bg-slate-400' : 'bg-slate-200'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {tags.length > 0 && (
                      <>
                        <span className="text-slate-300 hidden md:inline">·</span>
                        <div className="flex items-center gap-1.5 text-sage">
                          <Tag size={12} className="stroke-[2.5]" />
                          <span className="truncate max-w-[150px]">{tags[0]}{tags.length > 1 ? ', ...' : ''}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      wakeProject(project.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200 text-amber-700 font-medium rounded-xl hover:bg-amber-50 transition-colors shadow-sm"
                  >
                    <Sun size={16} />
                    Wake up
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Resting;
