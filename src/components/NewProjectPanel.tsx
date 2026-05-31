import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const addProject = useStore(state => state.addProject);
  const [name, setName] = useState('');
  const [sellSheet, setSellSheet] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProject(name.trim(), sellSheet.trim(), tags.trim());
    setName('');
    setSellSheet('');
    setTags('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-cream border-l border-slate-200 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 bg-white/50">
          <h2 className="text-xl font-serif text-slate-800">Add a project</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Project Name
            </label>
            <input
              id="name"
              type="text"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors text-lg font-serif"
              placeholder="e.g., Autumn Journal"
            />
          </div>

          <div>
            <label htmlFor="sellSheet" className="block text-sm font-medium text-slate-700 mb-2">
              Sell Sheet
            </label>
            <textarea
              id="sellSheet"
              rows={3}
              value={sellSheet}
              onChange={(e) => setSellSheet(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors italic resize-none"
              placeholder="1-2 lines describing the essence of the project..."
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-2">
              Tags <span className="text-slate-400 font-normal">(optional, comma separated)</span>
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors text-sm"
              placeholder="e.g., design, writing, personal"
            />
          </div>
        </form>

        <div className="p-6 border-t border-slate-200/60 bg-white">
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-3 px-4 bg-terracotta text-white font-medium rounded-xl hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Project
          </button>
        </div>
      </div>
    </>
  );
};
