import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentView } from '../../store/slices/authSlice';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Map, 
  Bell, 
  Boxes, 
  BarChart3, 
  Settings, 
  Radio, 
  Compass,
  UserCheck
} from 'lucide-react';

export const Navbar = () => {
  const dispatch = useDispatch();
  const currentView = useSelector((state) => state.auth.currentView);
  const activeAlertCount = useSelector((state) => state.alerts.activeAlertCount);
  const isLiveConnected = useSelector((state) => state.satellite.isLiveConnected);
  const latestScan = useSelector((state) => state.satellite.latestScan);

  const navItems = [
    { id: 'landing', label: 'Overview', icon: Compass },
    { id: 'dashboard', label: 'Live Ops', icon: LayoutDashboard },
    { id: 'map', label: 'Geo Map', icon: Map },
    { id: 'alerts', label: 'Alert Center', icon: Bell, badge: activeAlertCount },
    { id: 'assets', label: 'Asset Tracker', icon: Boxes },
    { id: 'analytics', label: 'ML Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => dispatch(setCurrentView('landing'))}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/40 group-hover:border-cyan-400 transition-all duration-300 shadow-glow-cyan">
            <ShieldAlert className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-orbitron font-extrabold text-xl tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-orange-400 bg-clip-text text-transparent">
                SANKET
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                SIH 2026
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-tight font-inter">
              AI Severe Weather Nowcasting
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => dispatch(setCurrentView(item.id))}
                className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>

                {item.badge > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live Satellite Status Pill & Officer Badge */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <Radio className={`w-3.5 h-3.5 ${isLiveConnected ? 'text-emerald-400 animate-pulse' : 'text-orange-400'}`} />
            <span className="text-slate-300 text-[11px] font-mono">
              {latestScan?.satellite || 'INSAT-3DR MOSDAC'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>

          <button 
            onClick={() => dispatch(setCurrentView('settings'))}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs transition-colors"
          >
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline font-mono font-medium">NDRF Commander</span>
          </button>
        </div>

      </div>

      {/* Mobile View Tab Bar */}
      <div className="lg:hidden mt-3 flex items-center justify-between overflow-x-auto py-1 border-t border-slate-800/80 space-x-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => dispatch(setCurrentView(item.id))}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[11px] whitespace-nowrap ${
                isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
