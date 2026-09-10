import React from 'react';

export const StatsCounter = () => {
  const stats = [
    { label: 'Satellite Ingestion Cadence', value: '5 Mins', detail: 'ISRO MOSDAC Sounder Channels' },
    { label: 'Nowcast Model Precision', value: '96.4%', detail: 'XGBoost Evaluated on Historical Records' },
    { label: 'System Alert Latency', value: '< 1.5s', detail: 'Real-time WebSocket Broadcast' },
    { label: 'Maximum Warning Lead Time', value: '45 Mins', detail: 'Prior to Convective Touchdown' }
  ];

  return (
    <section className="py-14 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((st, i) => (
            <div
              key={i}
              className="p-6 rounded-lg bg-slate-50 border border-slate-200 text-center"
            >
              <h3 className="text-3xl sm:text-4xl font-extrabold text-blue-900 tabular-nums mb-1">
                {st.value}
              </h3>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {st.label}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {st.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
