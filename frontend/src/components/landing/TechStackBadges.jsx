import React from 'react';

export const TechStackBadges = () => {
  const stack = [
    { name: 'React 18', category: 'Frontend', bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
    { name: 'Redux Toolkit', category: 'State', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
    { name: 'React Query', category: 'Cache', bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
    { name: 'Framer Motion', category: 'Animation', bg: 'bg-pink-500/10 text-pink-300 border-pink-500/30' },
    { name: 'Leaflet.js', category: 'GIS Maps', bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
    { name: 'Recharts', category: 'Analytics', bg: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
    { name: 'Tailwind CSS', category: 'Styling', bg: 'bg-teal-500/10 text-teal-300 border-teal-500/30' },
    { name: 'Node.js Express', category: 'Backend', bg: 'bg-green-500/10 text-green-300 border-green-500/30' },
    { name: 'MongoDB 2DSphere', category: 'Geospatial', bg: 'bg-emerald-600/10 text-emerald-400 border-emerald-600/30' },
    { name: 'Redis', category: 'In-Memory', bg: 'bg-red-500/10 text-red-300 border-red-500/30' },
    { name: 'Socket.io', category: 'Real-time', bg: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' },
    { name: 'Python FastAPI', category: 'ML API', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
    { name: 'XGBoost', category: 'ML Engine', bg: 'bg-orange-500/10 text-orange-300 border-orange-500/30' },
    { name: 'SHAP AI', category: 'Explainability', bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
    { name: 'INSAT-3D MOSDAC', category: 'Live Data', bg: 'bg-cyan-600/10 text-cyan-200 border-cyan-600/30' },
    { name: 'Docker Compose', category: 'DevOps', bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30' }
  ];

  return (
    <section className="py-16 bg-slate-950 relative border-y border-slate-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        <div className="text-center mb-10">
          <span className="text-slate-400 font-mono text-xs uppercase tracking-widest">
            PRODUCTION-GRADE TECHNOLOGY STACK
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {stack.map((item, i) => (
            <div
              key={i}
              className={`px-4 py-2 rounded-xl border text-xs font-mono flex items-center space-x-2 ${item.bg}`}
            >
              <span className="font-bold">{item.name}</span>
              <span className="opacity-60 text-[10px]">({item.category})</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
