import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Settings: React.FC = () => {
  const {
    userName,
    setUserName,
  } = useStore();

  const [inputName, setInputName] = useState(userName);
  const [dbStatus, setDbStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [dbError, setDbError] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    setInputName(userName);
  }, [userName]);

  const runPing = async () => {
    setPinging(true);
    setDbStatus('testing');
    try {
      const { error } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      if (error) throw error;
      setDbStatus('connected');
      setDbError(null);
    } catch (err: any) {
      console.error('Database connection test failed:', err);
      setDbStatus('error');
      setDbError(err?.message || 'Failed to connect to Supabase. Check API keys and network.');
    } finally {
      setPinging(false);
    }
  };

  useEffect(() => {
    runPing();
  }, []);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      setUserName(inputName.trim());
      setActionSuccess('Name updated successfully');
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  return (
    <div className="max-w-2xl space-y-8 pb-12">
      <div>
        <h2 className="text-4xl font-serif text-slate-800 tracking-tight">Settings</h2>
        <p className="text-slate-500 mt-2 text-sm">Configure your personal creative dashboard</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm">
        <h3 className="text-xl font-serif text-slate-800 mb-6 pb-2 border-b border-slate-50">Profile Settings</h3>
        <form onSubmit={handleSaveName} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-slate-700 mb-2">
              Your Name
            </label>
            <div className="flex gap-3">
              <input
                id="userName"
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-cream/30 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors text-slate-800"
                placeholder="e.g., Creator"
                required
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors shrink-0"
              >
                Save Name
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Database & Sync Section */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
          <h3 className="text-xl font-serif text-slate-800">Database & Connection</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              readOnly
              value={import.meta.env.VITE_SUPABASE_URL || ''}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-500 text-sm font-mono cursor-not-allowed"
            />
          </div>

          <div className="flex items-start gap-4 p-5 bg-slate-50 border border-slate-200/60 rounded-2xl">
            <div className="flex-1 space-y-1">
              <div className="font-medium text-slate-800">Database Status</div>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className={`w-2 h-2 rounded-full ${
                    dbStatus === 'testing' ? 'bg-amber-400 animate-pulse' :
                    dbStatus === 'error' ? 'bg-red-400' : 'bg-green-400'
                  }`} />
                  <span className={
                    dbStatus === 'testing' ? 'text-amber-600' :
                    dbStatus === 'error' ? 'text-red-500' : 'text-sage font-bold'
                  }>
                    {dbStatus === 'testing' ? 'Testing connection...' :
                     dbStatus === 'error' ? 'Connection Error' : 'Connected'}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={runPing}
              disabled={pinging}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 text-xs"
            >
              <RefreshCw size={14} className={pinging ? 'animate-spin' : ''} />
              Test Connection
            </button>
          </div>

          {dbStatus === 'error' && dbError && (
            <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <div>{dbError}</div>
            </div>
          )}
        </div>
      </div>

      {/* Toast alerts */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg border border-slate-700 transition-all flex items-center gap-2 z-50">
          <CheckCircle size={16} className="text-sage" />
          <span>{actionSuccess}</span>
        </div>
      )}
    </div>
  );
};

export default Settings;
