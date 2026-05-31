import React from 'react';
import { useStore } from '../store';

const Settings: React.FC = () => {
  const { userName, setUserName } = useStore();

  return (
    <div className="max-w-md">
      <h2 className="text-3xl font-serif text-slate-800 mb-8">Settings</h2>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-slate-700 mb-2">
            Your Name
          </label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-2 bg-cream border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-colors"
            placeholder="e.g., Alex"
          />
          <p className="mt-2 text-sm text-slate-500">
            This appears in the dashboard header.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h3 className="font-medium text-slate-800 mb-2">Data Storage</h3>
          <p className="text-sm text-slate-600 mb-4">
            Currently using <strong>Local Storage</strong>. Your data is saved in this browser and will not sync across devices. Google Sheets integration is disabled for this version.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
