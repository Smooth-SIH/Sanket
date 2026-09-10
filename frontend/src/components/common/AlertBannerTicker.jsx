import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCurrentView } from '../../store/slices/authSlice';

export const AlertBannerTicker = ({ activeAlert }) => {
  const dispatch = useDispatch();

  if (!activeAlert || activeAlert.severity !== 'CRITICAL') return null;

  return (
    <div className="bg-red-700 text-white text-xs py-2 px-4 flex items-center justify-between border-b border-red-800 z-40 relative shadow-sm">
      <div className="flex items-center space-x-3 overflow-hidden">
        <span className="flex items-center space-x-1.5 bg-red-900 text-white font-bold font-mono px-2.5 py-0.5 rounded text-[10px] tracking-wider uppercase border border-red-600 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
          <span>IMD EMERGENCY BULLETIN</span>
        </span>
        <div className="truncate font-medium flex items-center space-x-2 text-xs">
          <span className="font-semibold text-white">{activeAlert.title}</span>
          <span className="text-red-100 hidden sm:inline">• Target Sector: {activeAlert.affectedRegion}</span>
          <span className="text-amber-200 font-mono hidden md:inline">• Estimated Touchdown: ~{activeAlert.leadTimeMins} mins</span>
        </div>
      </div>

      <button
        onClick={() => dispatch(setCurrentView('alerts'))}
        className="flex items-center space-x-1 font-semibold text-red-900 bg-white hover:bg-red-50 px-3 py-1 rounded text-xs transition-colors shrink-0 ml-3 shadow-sm"
      >
        <span>View Advisory</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
