import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Save, Check } from 'lucide-react';

export const SettingsView = () => {
  const [iwvThreshold, setIwvThreshold] = useState(50.0);
  const [enableSockets, setEnableSockets] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.sanket.gov.in/alerts');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen py-8 px-4 lg:px-8 max-w-4xl mx-auto space-y-8">
      
      <div>
        <h1 className="font-orbitron font-extrabold text-2xl lg:text-3xl text-white flex items-center space-x-3">
          <Settings className="w-8 h-8 text-cyan-400" />
          <span>SYSTEM SETTINGS & PREFERENCES</span>
        </h1>
        <p className="text-slate-400 text-xs font-mono mt-1">
          Configure Command Center Alert Thresholds & Integration Webhooks
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* User Profile Info */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <h3 className="font-orbitron font-bold text-base text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-cyan-400" />
            <span>COMMAND OFFICER PROFILE</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Name</label>
              <input
                type="text"
                disabled
                value="Command Center Officer"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Organization</label>
              <input
                type="text"
                disabled
                value="NDRF / MOSDAC Severe Weather Wing"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <h3 className="font-orbitron font-bold text-base text-white flex items-center space-x-2">
            <Bell className="w-5 h-5 text-orange-400" />
            <span>ALERT THRESHOLDS & DISPATCH</span>
          </h3>

          <div>
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-slate-300">IWV Auto-Alert Trigger Threshold</span>
              <span className="text-cyan-400 font-bold">{iwvThreshold} mm</span>
            </div>
            <input
              type="range"
              min="30"
              max="70"
              step="1"
              value={iwvThreshold}
              onChange={(e) => setIwvThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              System automatically dispatches CRITICAL alerts when IWV exceeds this threshold.
            </p>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">Emergency Webhook Dispatch URL</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-mono text-white font-bold">Enable Real-Time WebSocket Telemetry</p>
              <p className="text-[11px] text-slate-400 font-mono">Receive 5-minute satellite broadcast packets</p>
            </div>
            <input
              type="checkbox"
              checked={enableSockets}
              onChange={(e) => setEnableSockets(e.target.checked)}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {savedSuccess && (
            <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1.5 animate-pulse">
              <Check className="w-4 h-4" />
              <span>Preferences Saved Successfully</span>
            </span>
          )}

          <button
            type="submit"
            className="ml-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-orbitron font-bold text-xs hover:from-cyan-400 hover:to-blue-500 transition-all shadow-glow-cyan flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>SAVE PREFERENCES</span>
          </button>
        </div>

      </form>

    </div>
  );
};
