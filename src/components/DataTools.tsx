import React, { useRef, useState } from 'react';
import { Database, Download, Upload, HardDrive } from 'lucide-react';
import type { BackupData } from '../types';

interface DataToolsProps {
  onExport: () => void;
  onImport: (data: BackupData) => void;
}

export const DataTools: React.FC<DataToolsProps> = ({ onExport, onImport }) => {
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
      } catch {
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
