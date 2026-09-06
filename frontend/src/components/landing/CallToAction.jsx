import React from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentView } from '../../store/slices/authSlice';
import { ArrowRight, ShieldAlert, Radio } from 'lucide-react';

export const CallToAction = () => {
  const dispatch = useDispatch();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 text-center relative z-10">
        
        <div className="p-12 rounded-3xl glass-panel border border-cyan-500/40 shadow-glow-cyan">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-cyan-400" />
          </div>

          <h2 className="font-orbitron text-3xl sm:text-4xl font-black text-white tracking-tight">
            READY TO ACCESS SANKET COMMAND CENTER?
          </h2>

          <p className="mt-4 text-slate-300 text-base max-w-2xl mx-auto font-light">
            Monitor real-time INSAT-3D sounder telemetry, view live risk maps, and track critical infrastructure vulnerability in real-time.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => dispatch(setCurrentView('dashboard'))}
              className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold font-orbitron text-sm tracking-wider hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-glow-cyan"
            >
              <span>LAUNCH LIVE DASHBOARD</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => dispatch(setCurrentView('map'))}
              className="inline-flex items-center space-x-2 px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-medium border border-slate-700 transition-colors"
            >
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>OPEN GEOSPATIAL MAP</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
