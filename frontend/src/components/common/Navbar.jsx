import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentView } from '../../store/slices/authSlice';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Map, 
  Bell, 
  Boxes, 
  BarChart3, 
  Radio, 
  ArrowRight,
  Home,
  PhoneCall,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Navbar = () => {
  const dispatch = useDispatch();
  const currentView = useSelector((state) => state.auth.currentView);
  const activeAlertCount = useSelector((state) => state.alerts.activeAlertCount);
  const isLiveConnected = useSelector((state) => state.satellite.isLiveConnected);
  const latestScan = useSelector((state) => state.satellite.latestScan);

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Live Operations', icon: LayoutDashboard },
    { id: 'map', label: 'Geospatial Radar', icon: Map },
    { id: 'alerts', label: 'Active Alerts', icon: Bell, badge: activeAlertCount },
    { id: 'assets', label: 'Critical Assets', icon: Boxes },
    { id: 'analytics', label: 'AI Models & SHAP', icon: BarChart3 }
  ];

  const isLanding = currentView === 'landing';
  const isFallback = latestScan?.is_fallback || latestScan?.data_source === 'SIMULATED_MOCK_FALLBACK';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* 1. National Tricolor Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* 2. Official Government Top Strip */}
      <div className="bg-[#0A1C2A] text-slate-300 text-[11px] px-4 lg:px-8 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-white tracking-wider uppercase">भारत सरकार</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Government of India</span>
          </div>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline text-slate-400">Ministry of Earth Sciences (MoES) & ISRO MOSDAC</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-1 text-slate-300 font-mono text-[11px]">
            <span>{currentTime}</span>
          </div>

          {/* Telemetry Status Indicator */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-0.5 rounded border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${isFallback ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="text-[10px] font-medium text-slate-200">
              {isFallback ? 'TELEMETRY: SIMULATED' : 'INSAT-3DR: LIVE FEED'}
            </span>
          </div>

          <a 
            href="tel:1070" 
            className="hidden lg:flex items-center space-x-1 text-amber-300 hover:text-amber-200 font-semibold"
          >
            <PhoneCall className="w-3 h-3" />
            <span>NDMA: 1070</span>
          </a>
        </div>
      </div>

      {/* 3. Main Navigation & Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand Title */}
        <div 
          onClick={() => dispatch(setCurrentView('landing'))}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-900 text-white font-bold shadow-sm">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                SANKET
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800 border border-blue-200">
                MoES / IMD
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none">
              National Severe Weather Nowcasting Portal
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Options */}
        {isLanding ? (
          /* Landing Page: Prominent CTA to Enter Operations Console */
          <div className="flex items-center space-x-3">
            <button
              onClick={() => dispatch(setCurrentView('dashboard'))}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-all duration-150"
            >
              <span>Launch Operations Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Inside App: Full Tab Bar and Return to Home */
          <div className="flex items-center space-x-2">
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => dispatch(setCurrentView(item.id))}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-white text-blue-900 font-semibold shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} />
                    <span>{item.label}</span>

                    {item.badge > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={() => dispatch(setCurrentView('landing'))}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
              title="Return to National Portal Overview"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Portal Home</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile App Tabs when inside /app */}
      {!isLanding && (
        <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50 py-1 px-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => dispatch(setCurrentView(item.id))}
                className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
                  isActive ? 'text-blue-700 font-bold' : 'text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
