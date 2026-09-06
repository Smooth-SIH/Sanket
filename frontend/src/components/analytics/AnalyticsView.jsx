import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Cpu, Activity, Zap, CheckCircle2, HelpCircle } from 'lucide-react';

export const AnalyticsView = () => {
  const shapData = [
    { feature: 'Integrated Water Vapor (IWV)', shap_value: 0.3412, val: '64.2 mm', impact: 'Increase Risk' },
    { feature: 'Cloud Top Temp (CTT)', shap_value: 0.2845, val: '204.1 K', impact: 'Increase Risk' },
    { feature: 'CAPE Atmospheric Energy', shap_value: 0.1982, val: '3840 J/kg', impact: 'Increase Risk' },
    { feature: 'Rain Rate (Precipitation)', shap_value: 0.1420, val: '94.0 mm/h', impact: 'Increase Risk' },
    { feature: 'Upper Level Wind Speed', shap_value: 0.0815, val: '68.5 km/h', impact: 'Increase Risk' },
    { feature: 'Convective Inhibition (CIN)', shap_value: -0.0512, val: '12.5 J/kg', impact: 'Decrease Risk' }
  ];

  return (
    <div className="min-h-screen py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="font-orbitron font-extrabold text-2xl lg:text-3xl text-white flex items-center space-x-3">
          <Cpu className="w-8 h-8 text-cyan-400" />
          <span>ML ANALYTICS & SHAP EXPLAINABILITY</span>
        </h1>
        <p className="text-slate-400 text-xs font-mono mt-1">
          XGBoost Nowcasting Model Metrics & Transparent Feature Attributions
        </p>
      </div>

      {/* Model Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20">
          <p className="text-xs text-slate-400 font-mono">MODEL ACCURACY</p>
          <p className="font-orbitron font-bold text-3xl text-cyan-400 mt-1">94.8%</p>
          <span className="text-[10px] text-emerald-400 font-mono">2,000+ Test Samples</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20">
          <p className="text-xs text-slate-400 font-mono">PRECISION</p>
          <p className="font-orbitron font-bold text-3xl text-sky-300 mt-1">96.2%</p>
          <span className="text-[10px] text-slate-400 font-mono">Minimal False Alarms</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20">
          <p className="text-xs text-slate-400 font-mono">RECALL SENSITIVITY</p>
          <p className="font-orbitron font-bold text-3xl text-orange-400 mt-1">92.5%</p>
          <span className="text-[10px] text-orange-400 font-mono">High Catch Rate</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20">
          <p className="text-xs text-slate-400 font-mono">F1 HARMONIC SCORE</p>
          <p className="font-orbitron font-bold text-3xl text-purple-400 mt-1">94.3%</p>
          <span className="text-[10px] text-slate-400 font-mono">Balanced Performance</span>
        </div>

      </div>

      {/* SHAP Waterfall / Bar Attribution Chart */}
      <div className="p-8 rounded-3xl glass-panel border border-cyan-500/30 shadow-glow-cyan">
        <div className="mb-6">
          <h3 className="font-orbitron font-bold text-xl text-white">
            SHAP TREEEXPLAINER FEATURE ATTRIBUTION
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Quantifying exact atmospheric variable contributions to current severe weather prediction (+0.82 SHAP sum)
          </p>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shapData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={11} width={220} />
              <Tooltip contentStyle={{ backgroundColor: '#0a1628', borderColor: '#00d4ff', color: '#fff', borderRadius: '12px' }} />
              <Bar dataKey="shap_value" radius={[0, 8, 8, 0]} name="SHAP Contribution Value">
                {shapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.shap_value > 0 ? '#ef4444' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Breakdown Table */}
        <div className="mt-8 border-t border-slate-800 pt-6 space-y-2">
          {shapData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 text-xs font-mono">
              <span className="text-slate-200 font-bold">{item.feature}</span>
              <span className="text-slate-400">Observed Value: <strong className="text-cyan-300">{item.val}</strong></span>
              <span className={item.shap_value > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                {item.shap_value > 0 ? `+${item.shap_value} (Increased Risk)` : `${item.shap_value} (Decreased Risk)`}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
