import React from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentView } from '../../store/slices/authSlice';
import { PhoneCall } from 'lucide-react';

export const Footer = () => {
  const dispatch = useDispatch();

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
          
          <div className="max-w-xl space-y-3">
            <div className="flex items-center space-x-2.5">
              <img 
                src="/sanket-logo.png" 
                alt="SANKET Logo" 
                className="w-8 h-8 object-contain rounded" 
              />
              <span className="font-bold text-base text-white tracking-tight">SANKET</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              National Severe Weather Nowcasting System developed under the Ministry of Earth Sciences (MoES), Government of India, in technical partnership with ISRO MOSDAC and the India Meteorological Department (IMD).
            </p>
            <div className="flex items-center space-x-3 text-slate-300 pt-1">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>National Disaster Management Authority (NDMA) Helpline: <strong>1070 / 1078</strong></span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Operations Portals</h4>
            <ul className="space-y-2">
              <li><button onClick={() => dispatch(setCurrentView('dashboard'))} className="hover:text-white transition-colors">Meteorological Dashboard</button></li>
              <li><button onClick={() => dispatch(setCurrentView('map'))} className="hover:text-white transition-colors">Geospatial Radar Map</button></li>
              <li><button onClick={() => dispatch(setCurrentView('alerts'))} className="hover:text-white transition-colors">Active Emergency Bulletins</button></li>
              <li><button onClick={() => dispatch(setCurrentView('assets'))} className="hover:text-white transition-colors">Infrastructure Asset Tracker</button></li>
              <li><button onClick={() => dispatch(setCurrentView('analytics'))} className="hover:text-white transition-colors">XGBoost & SHAP Analytics</button></li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-slate-500 text-[11px]">
          <p>&copy; 2026 Smooth. All Rights Reserved.</p>
        </div>

      </div>
    </footer>
  );
};
