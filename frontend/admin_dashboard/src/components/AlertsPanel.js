// SWACHH-AI — Admin Dashboard
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

'use client';
import React, { useState } from 'react';
import { AlertCircle, BatteryMedium, Cpu, CheckCircle } from 'lucide-react';

const MOCK_ALERTS = [
  { id: 1, bin_id: 2, zone: 'Zone Alpha', type: 'BIN_OVERFLOW', message: 'Node capacity exceeded 100%. Protocol dispatched.', time: '10m ago' },
  { id: 2, bin_id: 7, zone: 'Zone Beta', type: 'BATTERY_LOW', message: 'Power cell voltage at 2.9V. Marginal.', time: '1h ago' }
];

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  const acknowledge = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const getAlertColor = (type) => {
    if (type === 'BIN_OVERFLOW') return 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
    if (type === 'BIN_CRITICAL') return 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]';
    if (type === 'BATTERY_LOW') return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]';
    return 'bg-white/5 text-gray-300 border border-white/10';
  };

  const getAlertIcon = (type) => {
    if (type === 'BATTERY_LOW') return <BatteryMedium size={18} />;
    if (type === 'SENSOR_OFFLINE') return <Cpu size={18} />;
    return <AlertCircle size={18} />;
  };

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10 animate-in fade-in zoom-in">
         <CheckCircle size={40} className="text-emerald-400 mb-3 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
         <p className="text-emerald-400/80 font-medium text-center text-sm">All telemetry nodes optimal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-1 my-2">
      {alerts.map(alert => (
        <div key={alert.id} className={`flex flex-col p-4 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${getAlertColor(alert.type)}`}>
           <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 rounded-md bg-black/20 border border-white/10">
                   {getAlertIcon(alert.type)}
                 </div>
                 <p className="font-bold text-sm tracking-wide">Node #{alert.bin_id} &bull; <span className="opacity-75">{alert.zone}</span></p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 bg-black/30 px-2 py-0.5 rounded border border-white/5">{alert.time}</span>
           </div>
           <p className="text-sm mb-4 opacity-90">{alert.message}</p>
           <button 
             onClick={() => acknowledge(alert.id)}
             className="self-end px-4 py-1.5 bg-black/20 text-xs font-bold rounded-lg border border-white/10 hover:bg-white/10 transition uppercase tracking-wider"
             style={{ color: 'inherit' }}
           >
             Acknowledge
           </button>
        </div>
      ))}
    </div>
  );
}
