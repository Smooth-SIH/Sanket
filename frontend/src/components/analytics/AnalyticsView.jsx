import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Cpu, Activity, Zap, CheckCircle2, HelpCircle, BarChart3 } from 'lucide-react';

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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-800" />
          <h1 className="font-bold text-xl text-slate-900">
            Machine Learning Diagnostics & SHAP Explainability
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          XGBoost Nowcasting Model Evaluation • Transparent Atmospheric Feature Attribution for Decision Support
        </p>
      </div>

      {/* Model Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Model Accuracy</p>
          <p className="font-bold text-2xl text-slate-900 mt-1 font-mono">94.8%</p>
          <span className="text-[11px] text-emerald-700 font-medium">Verified on 2,000+ Test Samples</span>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Precision Metric</p>
          <p className="font-bold text-2xl text-blue-800 mt-1 font-mono">96.2%</p>
          <span className="text-[11px] text-slate-500 font-medium">Minimal False Alarm Rate</span>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Recall Sensitivity</p>
          <p className="font-bold text-2xl text-amber-700 mt-1 font-mono">92.5%</p>
          <span className="text-[11px] text-amber-700 font-medium">High Hazard Detection Rate</span>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">F1-Score (Harmonic)</p>
          <p className="font-bold text-2xl text-slate-900 mt-1 font-mono">94.3%</p>
          <span className="text-[11px] text-slate-500 font-medium">Balanced Performance</span>
        </div>

      </div>

      {/* SHAP Waterfall / Bar Attribution Chart */}
      <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-base text-slate-900">
            SHAP TreeExplainer Atmospheric Feature Attribution
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quantifying exact atmospheric variable contributions to current severe weather classification (+0.82 composite SHAP margin)
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis type="category" dataKey="feature" stroke="#334155" fontSize={11} width={210} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  color: '#0f172a',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="shap_value" radius={[0, 4, 4, 0]} name="SHAP Impact Value">
                {shapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.shap_value > 0 ? '#dc2626' : '#16a34a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Breakdown Table */}
        <div className="mt-6 border-t border-slate-200 pt-4 space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Detailed Parameter Impact Breakdown</h4>
          {shapData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono">
              <span className="text-slate-900 font-semibold font-sans">{item.feature}</span>
              <span className="text-slate-600">Observed: <strong className="text-slate-900">{item.val}</strong></span>
              <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                item.shap_value > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {item.shap_value > 0 ? `+${item.shap_value} (Heightens Severity)` : `${item.shap_value} (Suppresses Severity)`}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
