import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Shuffle, Moon, Play, ArrowUpRight, Flame, Sun, Snowflake } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store';
import { calculateWarmth, calculateProjectFriction, getFrictionValue } from '../utils/calculations';

const Review: React.FC = () => {
  const navigate = useNavigate();
  const { projects, tasks, sessionLogs, touchProject, restProject } = useStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRestOptions, setShowRestOptions] = useState(false);

  // Get active projects, sorted by least recently touched first
  const reviewProjects = useMemo(() => {
    return projects
      .filter(p => !p.restingAt)
      .sort((a, b) => new Date(a.lastTouchedAt).getTime() - new Date(b.lastTouchedAt).getTime());
  }, [projects]);

  if (reviewProjects.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-serif text-slate-800 mb-4">All caught up</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          There are no active projects to review right now.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-terracotta text-white font-medium rounded-xl hover:bg-terracotta/90 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const project = reviewProjects[currentIndex];
  const warmth = calculateWarmth(project.lastTouchedAt);
  const friction = calculateProjectFriction(tasks, project.id);
  const frictionVal = getFrictionValue(friction);
  const tags = project.tags.split(',').map(t => t.trim()).filter(Boolean);

  // Get most recent session log
  const recentLog = sessionLogs
    .filter(l => l.projectId === project.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const handleNext = () => {
    setShowRestOptions(false);
    setCurrentIndex(prev => (prev + 1) % reviewProjects.length);
  };

  const handlePrev = () => {
    setShowRestOptions(false);
    setCurrentIndex(prev => (prev - 1 + reviewProjects.length) % reviewProjects.length);
  };

  const handleRandom = () => {
    setShowRestOptions(false);
    let next;
    do {
      next = Math.floor(Math.random() * reviewProjects.length);
    } while (next === currentIndex && reviewProjects.length > 1);
    setCurrentIndex(next);
  };

  const handleKeepActive = () => {
    touchProject(project.id);
    handleNext();
  };

  const handleRest = (days: number | null) => {
    restProject(project.id, days);

    // If it was the last project, it will handle empty state on next render
    if (reviewProjects.length > 1) {
      // Stay on the same index, which will now point to the next project
      // because the current one will be filtered out on next render.
      // But we need to handle if we were at the end of the list.
      if (currentIndex === reviewProjects.length - 1) {
        setCurrentIndex(0);
      }
    }
    setShowRestOptions(false);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center relative py-12">
      <div className="absolute top-0 right-0">
        <button
          onClick={handleRandom}
          className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Shuffle size={18} />
          <span className="text-sm font-medium">Randomize</span>
        </button>
      </div>

      <div className="w-full max-w-2xl">
        <div className="text-center text-sm font-medium text-slate-400 mb-8">
          {currentIndex + 1} of {reviewProjects.length}
        </div>

        {/* The Card */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-200/60 shadow-xl shadow-slate-200/40 transform transition-all relative">

          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-slate-800 leading-tight mb-6">
              {project.name}
            </h2>

            {project.sellSheet && (
              <p className="text-xl italic text-slate-600 mb-8 max-w-lg leading-relaxed">
                {project.sellSheet}
              </p>
            )}

            <div className="flex items-center gap-6 text-sm">
              <div
                className="flex items-center gap-2 text-slate-500"
                title={`Last touched: ${format(new Date(project.lastTouchedAt), 'MMM d, yyyy')}`}
              >
                {warmth === 'Hot' && <Flame size={18} className="text-terracotta" />}
                {warmth === 'Warm' && <Sun size={18} className="text-amber" />}
                {warmth === 'Cold' && <Snowflake size={18} className="text-slate-400" />}
                <span className="font-medium">{warmth}</span>
              </div>

              {friction !== 'None' && (
                <div
                  className="flex items-center gap-2"
                  title={`Friction: ${friction}`}
                >
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${i <= frictionVal ? 'bg-slate-400' : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-sage/10 text-sage text-sm font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {recentLog && (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-12">
              <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Last Entry · {format(new Date(recentLog.date), 'MMM d, yyyy')}
              </div>
              <p className="text-slate-600 text-sm italic line-clamp-3 leading-relaxed">
                "{recentLog.entry}"
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {showRestOptions ? (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="text-center font-medium text-slate-700 mb-4">Rest for how long?</div>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => handleRest(7)} className="py-2 px-4 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors">1 Week</button>
                <button onClick={() => handleRest(30)} className="py-2 px-4 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors">1 Month</button>
                <button onClick={() => handleRest(null)} className="py-2 px-4 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors">Indefinitely</button>
              </div>
              <button
                onClick={() => setShowRestOptions(false)}
                className="w-full mt-4 py-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setShowRestOptions(true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                <Moon size={18} />
                Rest
              </button>
              <button
                onClick={handleKeepActive}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-sage/20 text-sage-900 font-medium rounded-xl hover:bg-sage/30 transition-colors"
              >
                <Play size={18} />
                Keep Active
              </button>
              <button
                onClick={() => navigate(`/project/${project.id}`)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-terracotta text-white font-medium rounded-xl hover:bg-terracotta/90 transition-colors"
              >
                Open Project
                <ArrowUpRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {reviewProjects.length > 1 && !showRestOptions && (
          <div className="absolute top-1/2 -translate-y-1/2 left-4 md:-left-12">
            <button
              onClick={handlePrev}
              className="p-3 bg-white/50 backdrop-blur border border-slate-200 text-slate-500 rounded-full hover:bg-white hover:text-slate-800 transition-all shadow-sm"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
        )}
        {reviewProjects.length > 1 && !showRestOptions && (
          <div className="absolute top-1/2 -translate-y-1/2 right-4 md:-right-12">
            <button
              onClick={handleNext}
              className="p-3 bg-white/50 backdrop-blur border border-slate-200 text-slate-500 rounded-full hover:bg-white hover:text-slate-800 transition-all shadow-sm"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Review;
