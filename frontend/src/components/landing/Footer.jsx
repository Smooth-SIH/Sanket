import React from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentView } from '../../store/slices/authSlice';
import { ShieldAlert, Radio } from 'lucide-react';

export const Footer = () => {
  const dispatch = useDispatch();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12 relative z-10 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="font-orbitron font-extrabold text-lg text-white">SANKET</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              AI-driven hyper-local severe weather nowcasting system. 
              Integrated with ISRO MOSDAC INSAT-3D/3DR satellite telemetry.
            </p>
          </div>

          <div>
            <h4 className="font-orbitron font-bold text-white mb-3">COMMAND VIEWS</h4>
            <ul className="space-y-2">
              <li><button onClick={() => dispatch(setCurrentView('dashboard'))} className="hover:text-cyan-400 transition-colors">Live Operations Dashboard</button></li>
              <li><button onClick={() => dispatch(setCurrentView('map'))} className="hover:text-cyan-400 transition-colors">Geospatial Risk Map</button></li>
              <li><button onClick={() => dispatch(setCurrentView('alerts'))} className="hover:text-cyan-400 transition-colors">Alert Center & Logs</button></li>
              <li><button onClick={() => dispatch(setCurrentView('assets'))} className="hover:text-cyan-400 transition-colors">Asset Management</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-orbitron font-bold text-white mb-3">SYSTEM TELEMETRY</h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>MOSDAC INSAT-3DR: ONLINE</span>
              </div>
              <p className="text-slate-400">Scan Cadence: 5 Minutes</p>
              <p className="text-slate-400">ML Engine: XGBoost + SHAP</p>
              <p className="text-slate-400">Database: MongoDB 2DSphere</p>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-wrap justify-between items-center text-slate-500 font-mono text-[11px]">
          <p>© 2026 SANKET Weather Warning System</p>
          <p>Built with MERN Stack + Python FastAPI</p>
        </div>

      </div>
    </footer>
  );
};
