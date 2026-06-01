import React, { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Eye, Moon, Settings } from 'lucide-react';
import { useStore } from '../store';
import { isConfigured } from '../lib/supabase';

const Layout: React.FC = () => {
  const checkAutoWake = useStore(state => state.checkAutoWake);
  const syncEnabled = useStore(state => state.syncEnabled);
  const syncStatus = useStore(state => state.syncStatus);
  const syncError = useStore(state => state.syncError);
  const syncData = useStore(state => state.syncData);

  useEffect(() => {
    if (isConfigured) {
      checkAutoWake();
      // Re-check periodically if app stays open
      const interval = setInterval(checkAutoWake, 60 * 1000 * 60); // every hour
      return () => clearInterval(interval);
    }
  }, [checkAutoWake]);

  // Handle initial data sync on mount if enabled
  useEffect(() => {
    if (isConfigured) {
      syncData().catch(err => console.error('Initial database sync failed:', err));
    }
  }, [syncData]);

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200/60 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 bg-terracotta/10 text-terracotta rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Settings size={32} className="animate-spin stroke-[1.5]" />
          </div>
          <h1 className="font-serif text-3xl text-slate-800 tracking-tight">Supabase Setup Required</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Please configure your environment variables to connect the Friction Manager app to your Supabase database.
          </p>
          <div className="text-left bg-cream/40 p-5 rounded-xl border border-slate-200/40 font-mono text-xs text-slate-700 space-y-3">
            <div className="font-bold text-slate-800 border-b border-slate-200/60 pb-1.5 mb-1.5">
              Create a <span className="text-terracotta">.env</span> file in your project root:
            </div>
            <div>
              VITE_SUPABASE_URL=<span className="text-blue-600">https://pgrbwmhdvpenrydnakox.supabase.co</span>
            </div>
            <div>
              VITE_SUPABASE_PUBLISHABLE_KEY=<span className="text-sage font-semibold">your_publishable_key_here</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Note: You can retrieve your publishable key from your Supabase dashboard under Settings → API. After editing the `.env` file, please restart your development server.
          </p>
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
      <aside className="hidden md:flex flex-col w-64 border-r border-terracotta/10 px-6 py-8">
        <div className="mb-12">
          <h1 className="font-serif text-2xl text-terracotta mb-1">Friction Manager</h1>
          <p className="text-sm text-slate-500">Stay in the flow</p>
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
