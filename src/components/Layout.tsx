import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Eye, Moon, Settings, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';

const Layout: React.FC = () => {
  const checkAutoWake = useStore(state => state.checkAutoWake);
  const syncEnabled = useStore(state => state.syncEnabled);
  const syncStatus = useStore(state => state.syncStatus);
  const syncError = useStore(state => state.syncError);
  const syncData = useStore(state => state.syncData);

  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const updateSupabaseConfig = useStore(state => state.updateSupabaseConfig);

  useEffect(() => {
    if (syncEnabled) {
      checkAutoWake();
      // Re-check periodically if app stays open
      const interval = setInterval(checkAutoWake, 60 * 1000 * 60); // every hour
      return () => clearInterval(interval);
    }
  }, [checkAutoWake, syncEnabled]);

  // Handle initial data sync on mount if enabled
  useEffect(() => {
    if (syncEnabled) {
      syncData().catch(err => console.error('Initial database sync failed:', err));
    }
  }, [syncData, syncEnabled]);

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) {
      setSetupError('Please enter both Project URL and Publishable Key.');
      return;
    }
    if (!urlInput.trim().startsWith('http')) {
      setSetupError('The Project URL must start with http:// or https://');
      return;
    }
    setConnecting(true);
    setSetupError(null);
    try {
      // Temporarily set it
      await updateSupabaseConfig(urlInput.trim(), keyInput.trim());
      // Test the connection
      const { error: testErr } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      if (testErr) {
        throw new Error(testErr.message || 'Failed to connect. Check URL/Key permissions.');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Connection setup failed:', err);
      setSetupError(errorMsg || 'Failed to connect to Supabase. Check API keys and network.');
      // Revert credentials
      await updateSupabaseConfig('', '');
    } finally {
      setConnecting(false);
    }
  };

  if (!syncEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200/60 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-terracotta/10 text-terracotta rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings size={32} className="stroke-[1.5]" />
            </div>
            <h1 className="font-serif text-3xl text-slate-800 tracking-tight">Supabase Setup</h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              Connect Friction Manager to your own Supabase database to start sync and persistence.
            </p>
          </div>

          <form onSubmit={handleSetupSubmit} className="space-y-4">
            <div>
              <label htmlFor="setupUrl" className="block text-sm font-medium text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <input
                id="setupUrl"
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-4 py-2.5 bg-cream/30 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors text-slate-800 font-mono text-xs"
                required
              />
            </div>

            <div>
              <label htmlFor="setupKey" className="block text-sm font-medium text-slate-700 mb-1">
                Supabase Publishable Key (Anon Key)
              </label>
              <input
                id="setupKey"
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="your-anon-key"
                className="w-full px-4 py-2.5 bg-cream/30 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors text-slate-800 font-mono text-xs"
                required
              />
            </div>

            {setupError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 space-y-1">
                <div className="font-semibold">Connection Failed</div>
                <div>{setupError}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={connecting}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {connecting ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Connecting...
                </>
              ) : (
                'Save & Connect'
              )}
            </button>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-400">
              You can find your URL and anon key in your Supabase Dashboard under <strong>Settings &rarr; API</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/review', icon: Eye, label: 'Review' },
    { to: '/resting', icon: Moon, label: 'Resting' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-terracotta/10 px-6 py-8">
        <div className="mb-12">
          <h1 className="font-serif text-2xl text-terracotta mb-1">Friction Manager</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-terracotta/5 text-terracotta font-medium'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon size={20} className="stroke-[1.5]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-terracotta/5 text-terracotta font-medium'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Settings size={20} className="stroke-[1.5]" />
            Settings
          </NavLink>

          <div className="pt-4 border-t border-terracotta/10 px-4 flex items-center justify-between text-xs">
            <span className="text-slate-400">Database</span>
            <div className="flex items-center gap-1.5 font-medium" title={syncError || undefined}>
              <span className={`w-2 h-2 rounded-full ${
                !syncEnabled
                  ? 'bg-slate-300'
                  : syncStatus === 'syncing'
                    ? 'bg-amber-400 animate-pulse'
                    : syncStatus === 'error'
                      ? 'bg-red-400'
                      : 'bg-green-400'
              }`} />
              <span className={
                !syncEnabled
                  ? 'text-slate-500'
                  : syncStatus === 'error'
                    ? 'text-red-500'
                    : 'text-slate-700'
              }>
                {!syncEnabled
                  ? 'Local Only'
                  : syncStatus === 'syncing'
                    ? 'Syncing...'
                    : syncStatus === 'error'
                      ? 'Sync Error'
                      : 'Synced'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-4 py-8 md:px-12 md:py-12 pb-24 md:pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Subtle Mobile Sync Status Header */}
          <div className="md:hidden flex justify-between items-center mb-6 px-1">
            <h1 className="font-serif text-xl text-terracotta">Friction Manager</h1>
            <div className="flex items-center gap-1.5 text-xs font-medium" title={syncError || undefined}>
              <span className={`w-2 h-2 rounded-full ${
                !syncEnabled
                  ? 'bg-slate-300'
                  : syncStatus === 'syncing'
                    ? 'bg-amber-400 animate-pulse'
                    : syncStatus === 'error'
                      ? 'bg-red-400'
                      : 'bg-green-400'
              }`} />
              <span className={
                !syncEnabled
                  ? 'text-slate-400'
                  : syncStatus === 'error'
                    ? 'text-red-500'
                    : 'text-slate-500'
              }>
                {!syncEnabled
                  ? 'Local'
                  : syncStatus === 'syncing'
                    ? 'Syncing'
                    : syncStatus === 'error'
                      ? 'Error'
                      : 'Synced'}
              </span>
            </div>
          </div>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-cream/90 backdrop-blur-md border-t border-slate-200 flex justify-around p-3 pb-safe z-50">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg ${
                isActive ? 'text-terracotta' : 'text-slate-500'
              }`
            }
          >
            <item.icon size={24} className="stroke-[1.5]" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-lg ${
              isActive ? 'text-terracotta' : 'text-slate-500'
            }`
          }
        >
          <Settings size={24} className="stroke-[1.5]" />
          <span className="text-xs font-medium">Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Layout;
