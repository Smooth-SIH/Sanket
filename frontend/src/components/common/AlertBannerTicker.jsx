import React from 'react';
import { AlertTriangle, ChevronRight, Zap } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCurrentView } from '../../store/slices/authSlice';

export const AlertBannerTicker = ({ activeAlert }) => {
  const dispatch = useDispatch();

  if (!activeAlert || activeAlert.severity !== 'CRITICAL') return null;

  return (
    <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b border-red-500/40 text-red-200 text-xs py-2 px-4 flex items-center justify-between shadow-glow-red z-40 relative animate-pulse">
      <div className="flex items-center space-x-3 overflow-hidden">
        <span className="flex items-center space-x-1.5 bg-red-600 text-white font-bold font-mono px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>CRITICAL NOWCAST ALERT</span>
        </span>
        <div className="truncate font-medium flex items-center space-x-2">
          <span className="font-orbitron font-bold text-white">{activeAlert.title}</span>
          <span className="text-red-300">| Region: {activeAlert.affectedRegion}</span>
          <span className="text-amber-300 font-mono">| Lead Time: ~{activeAlert.leadTimeMins} mins</span>
        </div>
      </div>

      <button
        onClick={() => dispatch(setCurrentView('alerts'))}
        className="flex items-center space-x-1 font-bold text-white hover:text-cyan-300 bg-red-800/80 px-2.5 py-1 rounded-md text-[11px] transition-colors whitespace-nowrap ml-3"
      >
        <span>Command Center</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
