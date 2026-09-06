import React from 'react';
import { motion } from 'framer-motion';

export const StatsCounter = () => {
  const stats = [
    { label: 'Satellite Ingestion Cadence', value: '5 MINS', detail: 'MOSDAC INSAT-3D Sounder' },
    { label: 'XGBoost Prediction Accuracy', value: '94.8%', detail: 'Validated on 2,000+ Scans' },
    { label: 'End-to-End Alert Latency', value: '< 1.2s', detail: 'Express + Socket.io Stream' },
    { label: 'Early Warning Lead Time', value: '45 MINS', detail: 'Before Cloudburst Touchdown' }
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((st, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 rounded-2xl glass-panel text-center border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
            >
              <h3 className="font-orbitron font-black text-4xl sm:text-5xl bg-gradient-to-r from-cyan-400 to-sky-200 bg-clip-text text-transparent mb-2">
                {st.value}
              </h3>
              <p className="font-orbitron text-sm font-bold text-slate-200 uppercase tracking-wide">
                {st.label}
              </p>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {st.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
