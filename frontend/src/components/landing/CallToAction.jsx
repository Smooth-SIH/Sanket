import React from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentView } from '../../store/slices/authSlice';
import { ArrowRight, ShieldCheck, Map } from 'lucide-react';

export const CallToAction = () => {
  const dispatch = useDispatch();

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="p-8 sm:p-12 rounded-lg bg-slate-50 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Access the National Nowcasting Operations Console
          </h2>

          <p className="mt-3 text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Monitor live geostationary satellite telemetry, analyze multi-hazard convective risk scores, and track infrastructure vulnerability in real-time.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => dispatch(setCurrentView('dashboard'))}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow-sm transition-colors"
            >
              <span>Launch Operations Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => dispatch(setCurrentView('map'))}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-md bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-300 shadow-sm transition-colors"
            >
              <Map className="w-4 h-4 text-slate-500" />
              <span>Open Geospatial Radar</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
