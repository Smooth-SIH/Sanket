import React from 'react';
import { Shield, Landmark, CheckCircle2 } from 'lucide-react';

export const TrustSection = () => {
  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold mb-3">
              <Shield className="w-3.5 h-3.5 text-blue-700" />
              <span>National Disaster Preparedness & Mitigation</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
              Engineered for Severe Convective Disaster Resilience
            </h2>

            <p className="mt-4 text-slate-600 text-sm leading-relaxed">
              SANKET overcomes radar shadow limitations in high-altitude Himalayan valleys and Western Ghats terrains where traditional ground-based Doppler weather radars face beam blockage. Geostationary sounders detect deep convective initiation before localized cloudbursts trigger catastrophic flash floods.
            </p>

            <div className="mt-6 space-y-3">
              {[
                'Direct ISRO MOSDAC INSAT-3D/3DR Satellite Sounder Ingestion Pipeline',
                'National Disaster Management Authority (NDMA) Alert Classification Protocol',
                'Explainable AI (SHAP) Attribution for Meteorological Officers',
                'Geospatial Distance Scoring for Hydro Dams, Bridges, and Power Grids'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-800">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">ISRO MOSDAC Sounder Ingestion Framework</h4>
                <p className="text-xs text-slate-500 font-mono">19-Channel Infrared & Water Vapor Payload</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded border border-slate-200">
              &quot;By monitoring Integrated Water Vapor (IWV) accumulation above 52mm combined with Cloud Top Temperatures dropping below 215K, SANKET provides early notice of violent convective updrafts 30 to 45 minutes before localized precipitation triggers flash flooding.&quot;
            </p>

            <div className="p-3 rounded bg-blue-50 border border-blue-200 text-xs flex items-center justify-between text-blue-900">
              <span className="font-medium">Atmospheric Nowcast Pipeline Status</span>
              <span className="text-emerald-700 font-bold font-mono">OPERATIONAL (ACTIVE)</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
