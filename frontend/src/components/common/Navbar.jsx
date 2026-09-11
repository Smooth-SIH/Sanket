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
      {/* Main Navigation & Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
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
              <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className={`w-1.5 h-1.5 rounded-full ${isFallback ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                <span>{isFallback ? 'SIMULATED FEED' : 'INSAT-3DR LIVE'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
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
