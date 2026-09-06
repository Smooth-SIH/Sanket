import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Cpu, ShieldAlert } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'MOSDAC Satellite Telemetry Ingestion',
      subtitle: '5-Minute Ingestion Cycle',
      description: 'Continuous fetching of ISRO INSAT-3D/3DR sounder products, extracting Integrated Water Vapor (IWV), Cloud Top Temperature (CTT), and Convective Energy (CAPE).',
      icon: Radio,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/40'
    },
    {
      step: '02',
      title: 'XGBoost ML & SHAP Explanation',
      subtitle: 'Sub-second Nowcasting Engine',
      description: 'Atmospheric feature matrix processed through pre-trained XGBoost classifiers. SHAP TreeExplainer breaks down exact physical contributors to storm generation.',
      icon: Cpu,
      color: 'from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/40'
    },
    {
      step: '03',
      title: 'Geo-Spatial Alert & Asset Shielding',
      subtitle: 'Hyper-Local Emergency Dispatch',
      description: 'Generates GeoJSON hazard polygons, evaluates proximity to hydro dams and power grids, and dispatches real-time WebSocket alerts to NDRF command centers.',
      icon: ShieldAlert,
      color: 'from-red-500/20 to-rose-500/20 text-red-400 border-red-500/40'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            3-STEP AUTOMATED NOWCASTING PIPELINE
          </span>
          <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white tracking-tight mt-4">
            HOW SANKET OPERATES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative p-8 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-orbitron text-4xl font-black text-slate-700">
                      {item.step}
                    </span>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} border flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <p className="text-xs font-mono text-cyan-400 uppercase tracking-wide mb-1">
                    {item.subtitle}
                  </p>
                  <h3 className="font-orbitron font-bold text-xl text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Latency &lt; 1.2s</span>
                  <span className="text-emerald-400">Automated Pipeline</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
