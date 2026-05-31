import React, { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Eye, Moon, Settings } from 'lucide-react';
import { useStore } from '../store';

const Layout: React.FC = () => {
  const checkAutoWake = useStore(state => state.checkAutoWake);

  useEffect(() => {
    checkAutoWake();
    // Re-check periodically if app stays open
    const interval = setInterval(checkAutoWake, 60 * 1000 * 60); // every hour
    return () => clearInterval(interval);
  }, [checkAutoWake]);

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

        <div className="mt-auto">
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-4 py-8 md:px-12 md:py-12 pb-24 md:pb-12">
        <div className="max-w-5xl mx-auto">
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
