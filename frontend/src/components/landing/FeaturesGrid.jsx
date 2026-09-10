import React from 'react';
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
      title: 'INSAT-3D/3DR Telemetry',
      description: 'Automated 5-minute ingestion from ISRO MOSDAC sounder channels deriving IWV, CTT, and CAPE atmospheric indices.',
      iconBg: 'bg-blue-50 text-blue-700'
    },
    {
      icon: Cpu,
      title: 'Machine Learning Nowcasting',
      description: 'Trained XGBoost models classify micro-scale cloudbursts, severe thunderstorms, and flash floods with verified precision.',
      iconBg: 'bg-indigo-50 text-indigo-700'
    },
    {
      icon: Activity,
      title: 'SHAP Explainable AI',
      description: 'Provides transparent feature attribution charts showing exact meteorological drivers behind each issued alert.',
      iconBg: 'bg-emerald-50 text-emerald-700'
    },
    {
      icon: MapPin,
      title: 'Geospatial Hazard Sectors',
      description: 'Renders GeoJSON risk polygons with MongoDB 2DSphere spatial indices for precise river basin and valley mapping.',
      iconBg: 'bg-amber-50 text-amber-700'
    },
    {
      icon: ShieldCheck,
      title: 'Critical Asset Safeguards',
      description: 'Automated proximity distance risk scoring for power grids, hydro dams, bridges, and district hospitals.',
      iconBg: 'bg-purple-50 text-purple-700'
    },
    {
      icon: Zap,
      title: 'Sub-Second WebSocket Alerts',
      description: 'Broadcasts instant telemetry updates and emergency warnings directly to emergency operating centers.',
      iconBg: 'bg-red-50 text-red-700'
    },
    {
      icon: Clock,
      title: 'Atmospheric Trajectory Replay',
      description: 'Interactive timeline scrubber to analyze atmospheric vapor build-up and convective growth leading up to storm onset.',
      iconBg: 'bg-teal-50 text-teal-700'
    },
    {
      icon: BellRing,
      title: 'Statutory Acknowledgment',
      description: 'Multi-officer alert acknowledgment tracking with audit logging for emergency command cells.',
      iconBg: 'bg-slate-100 text-slate-700'
    }
  ];

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            System Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-3">
            National Meteorological Warning Infrastructure
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Engineered for disaster management authorities (NDMA/SDMA), weather stations, and district emergency cells.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
