import React from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { setCurrentView } from '../../store/slices/authSlice';
import { Radio, ArrowRight, Layers } from 'lucide-react';

export const HeroSection = () => {
  const dispatch = useDispatch();

  return (
    <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Top Tagline Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-8 shadow-glow-cyan"
        >
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>INSAT-3D / 3DR Live MOSDAC Data Integration</span>
        </motion.div>

        {/* Hero Title & Description */}
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-orbitron text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight"
          >
            HYPER-LOCAL SEVERE <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-orange-400 bg-clip-text text-transparent glow-text-cyan">
              WEATHER NOWCASTING
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-slate-300 text-lg sm:text-xl font-light leading-relaxed max-w-3xl"
          >
            <strong className="text-cyan-300 font-semibold">SANKET</strong> leverages real-time 
            INSAT-3D sounder telemetry, XGBoost machine learning, and SHAP explainability to predict 
            cloudbursts, flash floods, and severe convective storms with lead times up to 45 minutes.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-4 items-center"
          >
            <button
              onClick={() => dispatch(setCurrentView('dashboard'))}
              className="group relative inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold font-orbitron text-sm tracking-wider hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-glow-cyan"
            >
              <span>ENTER LIVE OPS CENTER</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => dispatch(setCurrentView('map'))}
              className="inline-flex items-center space-x-2.5 px-7 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-medium text-sm border border-slate-700 hover:border-cyan-500/50 transition-all duration-300"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>EXPLORE GEOSPATIAL MAP</span>
            </button>
          </motion.div>
        </div>

        {/* Live Metrics Floating Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl glass-panel border border-cyan-500/20"
        >
          <div className="border-r border-slate-800/80 pr-4">
            <p className="text-xs text-slate-400 font-mono">IWV (VAPOR DENSITY)</p>
            <p className="font-orbitron text-2xl font-bold text-cyan-400 mt-1">64.2 mm</p>
            <span className="text-[10px] text-emerald-400 font-mono">↑ 14% Convective Surge</span>
          </div>

          <div className="border-r border-slate-800/80 pr-4">
            <p className="text-xs text-slate-400 font-mono">CLOUD TOP TEMP (CTT)</p>
            <p className="font-orbitron text-2xl font-bold text-sky-300 mt-1">204.1 K</p>
            <span className="text-[10px] text-red-400 font-mono">Deep Convective Overshoot</span>
          </div>

          <div className="border-r border-slate-800/80 pr-4">
            <p className="text-xs text-slate-400 font-mono">CAPE ATMOSPHERIC ENERGY</p>
            <p className="font-orbitron text-2xl font-bold text-orange-400 mt-1">3,840 J/kg</p>
            <span className="text-[10px] text-orange-400 font-mono">Extreme Instability</span>
          </div>

          <div>
            <p className="text-xs text-slate-400 font-mono">EARLY WARNING LEAD TIME</p>
            <p className="font-orbitron text-2xl font-bold text-emerald-400 mt-1">35 MINS</p>
            <span className="text-[10px] text-slate-400 font-mono">Before Touchdown</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
