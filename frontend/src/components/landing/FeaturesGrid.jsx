import React from 'react';
import { motion } from 'framer-motion';
import { 
  Radio, 
  Cpu, 
  Activity, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Clock, 
  BellRing 
} from 'lucide-react';

export const FeaturesGrid = () => {
  const features = [
    {
      icon: Radio,
      title: 'INSAT-3D/3DR Live Stream',
      description: 'Ingests ISRO MOSDAC sounder and imager channels every 5 minutes extracting IWV, CTT, and CAPE indices.',
      color: 'text-cyan-400',
      border: 'hover:border-cyan-500/50'
    },
    {
      icon: Cpu,
      title: 'XGBoost Nowcasting Engine',
      description: 'Predicts micro-scale atmospheric convective cloudbursts, severe hail, and flash floods with 94.8% accuracy.',
      color: 'text-sky-400',
      border: 'hover:border-sky-500/50'
    },
    {
      icon: Activity,
      title: 'SHAP Explainable AI',
      description: 'Provides transparent feature attribution waterfall charts explaining why the model raised a critical warning.',
      color: 'text-orange-400',
      border: 'hover:border-orange-500/50'
    },
    {
      icon: MapPin,
      title: 'Geospatial Hazard Zones',
      description: 'Generates GeoJSON risk polygons in MongoDB using 2DSphere spatial indices for precise region boundaries.',
      color: 'text-emerald-400',
      border: 'hover:border-emerald-500/50'
    },
    {
      icon: ShieldCheck,
      title: 'Infrastructure Protection',
      description: 'Tracks power grids, hydro dams, bridges, and hospitals with automated hazard distance risk scoring.',
      color: 'text-purple-400',
      border: 'hover:border-purple-500/50'
    },
    {
      icon: Zap,
      title: 'Real-Time WebSocket Engine',
      description: 'Broadcasts instant telemetry and emergency alerts directly to command center consoles with sub-second latency.',
      color: 'text-yellow-400',
      border: 'hover:border-yellow-500/50'
    },
    {
      icon: Clock,
      title: '24-Hour Timeline Replay',
      description: 'Scrub backwards in time to analyze atmospheric vapor accumulation and storm trajectory before touchdown.',
      color: 'text-cyan-300',
      border: 'hover:border-cyan-400/50'
    },
    {
      icon: BellRing,
      title: 'Officer Acknowledgment',
      description: 'Multi-officer alert acknowledgment tracking with audit logging for emergency command cells.',
      color: 'text-red-400',
      border: 'hover:border-red-500/50'
    }
  ];

  return (
    <section className="py-20 bg-slate-950/60 relative">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white tracking-tight">
            SYSTEM CAPABILITIES & ARCHITECTURE
          </h2>
          <p className="mt-4 text-slate-400 text-base font-light">
            Designed for disaster management authorities, weather forecasting stations, and smart cities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={`p-6 rounded-2xl glass-panel transition-all duration-300 ${item.border} group hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-5 ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-orbitron font-bold text-lg text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
