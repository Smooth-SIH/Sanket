import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentView, logout } from '../../store/slices/authSlice';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Map, 
  Bell, 
  Boxes, 
  BarChart3, 
  ArrowRight,
  LogOut,
  UserCheck,
  Lock
} from 'lucide-react';

export const Navbar = () => {
  const dispatch = useDispatch();
  const currentView = useSelector((state) => state.auth.currentView);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const activeAlertCount = useSelector((state) => state.alerts.activeAlertCount);

  const navItems = [
    { id: 'dashboard', label: 'Live Operations', icon: LayoutDashboard },
    { id: 'map', label: 'Geospatial Radar', icon: Map },
    { id: 'alerts', label: 'Active Alerts', icon: Bell, badge: activeAlertCount },
    { id: 'assets', label: 'Critical Assets', icon: Boxes },
    { id: 'analytics', label: 'AI Models & SHAP', icon: BarChart3 }
  ];

  const isLanding = currentView === 'landing';
  const isAuth = currentView === 'auth';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Main Navigation & Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Title */}
        <div 
          onClick={() => dispatch(setCurrentView('landing'))}
          className="flex items-center space-x-3 cursor-pointer group"
          title="Return to National Portal Overview"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-900 text-white font-bold shadow-sm">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              SANKET
            </span>
            <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
              National Severe Weather Nowcasting Portal
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Options */}
        {isLanding ? (
          /* Landing Page Header Actions */
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => dispatch(setCurrentView('dashboard'))}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <UserCheck className="w-4 h-4 text-emerald-300" />
                  <span>Enter Console ({user?.name?.split(' ')[0] || 'Officer'})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => dispatch(logout())}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-xs font-medium transition-colors"
                  title="Sign out of active session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => dispatch(setCurrentView('dashboard'))}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-all duration-150"
              >
                <Lock className="w-3.5 h-3.5 text-blue-200" />
                <span>Launch Operations Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : isAuth ? (
          /* Auth View Header */
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Command Authentication
            </span>
          </div>
        ) : (
          /* Inside Console: Tab Bar & Officer Profile */
          <div className="flex items-center space-x-3">
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

            {/* Officer Profile & Sign Out */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-none">
                  {user?.name || 'Authorized Officer'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium leading-none mt-1">
                  {user?.organization ? user.organization.split('(')[0].trim() : (user?.role || 'Duty Officer')}
                </span>
              </div>

              <button
                onClick={() => dispatch(logout())}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-xs font-medium transition-colors"
                title="Sign out of current officer session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile App Tabs when inside /app */}
      {!isLanding && !isAuth && (
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
