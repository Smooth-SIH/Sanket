import React from 'react';
import { Radio, Cpu, ShieldAlert } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'Satellite & Atmospheric Ingestion',
      subtitle: '5-Minute Ingestion Cadence',
      description: 'Automated retrieval of geostationary sounder telemetry, deriving Total Column Precipitable Water (IWV), Cloud Top Temperature (CTT), and Convective Energy (CAPE).',
      icon: Radio,
      iconBg: 'bg-blue-50 text-blue-700'
    },
    {
      step: '02',
      title: 'Machine Learning Nowcasting',
      subtitle: 'Sub-second Nowcasting Engine',
      description: 'Multi-parameter atmospheric soundings run through serialized XGBoost models, while SHAP engines compute transparent physical attributions.',
      icon: Cpu,
      iconBg: 'bg-amber-50 text-amber-700'
    },
    {
      step: '03',
      title: 'Early Warning Broadcast & Asset Defense',
      subtitle: 'Targeted District Alerting',
      description: 'Generates standardized IMD hazard polygons, calculates exact proximity to critical power/water infrastructure, and dispatches early warnings.',
      icon: ShieldAlert,
      iconBg: 'bg-red-50 text-red-700'
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Operational Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-3">
            How the Nowcasting Pipeline Operates
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            End-to-end automated processing from raw satellite radiation to district disaster dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-extrabold text-slate-300 font-mono">
                      {item.step}
                    </span>
                    <div className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                    {item.subtitle}
                  </p>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Processing Latency: &lt; 2s</span>
                  <span className="text-emerald-700 font-semibold">Automated</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
