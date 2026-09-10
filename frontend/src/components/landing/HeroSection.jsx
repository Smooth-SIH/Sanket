import React from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentView } from '../../store/slices/authSlice';
import { Radio, ArrowRight, Layers, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';

export const HeroSection = () => {
  const dispatch = useDispatch();

  return (
    <section className="bg-white border-b border-slate-200 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Official Tagline Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold mb-6">
          <Radio className="w-3.5 h-3.5 text-blue-700 animate-pulse" />
          <span>INSAT-3D / 3DR Sounder Telemetry & IMD Radar Telemetry Stream</span>
        </div>

        {/* Hero Title & Government Mission Statement */}
        <div className="max-w-4xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            National Severe Weather <br />
            <span className="text-blue-700">
              Nowcasting & Early Warning
            </span>
          </h1>

          <p className="mt-5 text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
            <strong>SANKET</strong> is India's hyper-local atmospheric nowcasting platform developed under the Ministry of Earth Sciences and ISRO MOSDAC. Utilizing geostationary sounder telemetry and physics-guided XGBoost machine learning, SANKET provides early warnings for cloudbursts, flash floods, and severe convective storms with up to 45 minutes of lead time.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap gap-3 items-center">
            <button
              onClick={() => dispatch(setCurrentView('dashboard'))}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow-sm transition-colors"
            >
              <span>Launch Operations Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => dispatch(setCurrentView('map'))}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-sm transition-colors"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Geospatial Radar & Map</span>
            </button>
          </div>
        </div>

        {/* National Operational Metrics Grid */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="border-r border-slate-200 pr-4">
            <p className="text-xs text-slate-500 font-medium">COLUMN MOISTURE (IWV)</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1">58.4 mm</p>
            <span className="text-[11px] text-blue-700 font-medium">Sounder Ingestion</span>
          </div>

          <div className="border-r border-slate-200 pr-4">
            <p className="text-xs text-slate-500 font-medium">CLOUD TOP TEMP (CTT)</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1">210.5 K</p>
            <span className="text-[11px] text-slate-600 font-medium">Thermal IR Band 19</span>
          </div>

          <div className="border-r border-slate-200 pr-4">
            <p className="text-xs text-slate-500 font-medium">CONVECTIVE ENERGY (CAPE)</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1">2,450 J/kg</p>
            <span className="text-[11px] text-amber-700 font-medium">Atmospheric Instability</span>
          </div>

          <div>
            <p className="text-xs text-slate-500 font-medium">DISASTER LEAD TIME</p>
            <p className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">Up to 45 Mins</p>
            <span className="text-[11px] text-slate-600 font-medium">Prior to Touchdown</span>
          </div>
        </div>

      </div>
    </section>
  );
};
