import React from 'react';
import { Shield, Landmark, CheckCircle2 } from 'lucide-react';

export const TrustSection = () => {
  return (
    <section className="py-20 bg-slate-950/70 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono mb-4">
              <Shield className="w-4 h-4" />
              <span>SEVERE WEATHER MITIGATION</span>
            </div>

            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white tracking-tight leading-snug">
              ENGINEERED FOR ATMOSPHERIC DISASTER RESILIENCE
            </h2>

            <p className="mt-4 text-slate-300 text-base font-light leading-relaxed">
              SANKET solves the critical challenge of unpredictable micro-scale cloudburst events 
              in mountainous terrain (Himalayas & Western Ghats) where traditional Doppler radar coverage is blocked by mountain ridges.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Direct ISRO MOSDAC INSAT-3D Sounder Telemetry Pipeline',
                'State Emergency Operation Centre Audit Compliance',
                'SHAP Transparent Explainable AI for Command Operations',
                'GeoJSON 2DSphere Spatial Querying for High-Value Infrastructure'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
            <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
              <Landmark className="w-8 h-8 text-orange-400" />
              <div>
                <h4 className="font-orbitron font-bold text-white">ISRO MOSDAC Satellite Gateway</h4>
                <p className="text-xs text-slate-400 font-mono">19-Channel Sounder & Imager Stream</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              &quot;By monitoring Integrated Water Vapor (IWV) accumulation above 55mm combined with Cloud Top Temperatures dropping below 210K, SANKET detects severe deep convective clouds 30-45 minutes before localized precipitation triggers flash flooding.&quot;
            </p>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono flex items-center justify-between text-cyan-400">
              <span>Atmospheric Physics & Convective Ingestion</span>
              <span className="text-emerald-400 font-bold">OPERATIONAL</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
