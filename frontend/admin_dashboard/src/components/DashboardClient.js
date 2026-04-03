// SWACHH-AI — Admin Dashboard
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

'use client';

import React, { useState, useEffect } from 'react';
import BinMap from './BinMap';
import RoutePanel from './RoutePanel';
import AlertsPanel from './AlertsPanel';
import AnalyticsPanel from './AnalyticsPanel';
import { Activity, Trash2, Truck, Users, Zap } from 'lucide-react';

export default function DashboardClient() {
  const [stats, setStats] = useState({
    totalBins: 15,
    critical: 4,
    activeTrucks: 2,
    citizens: 1250
  });

  // Demo Simulator Hook
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        // Random fluctuation logic for a simulated "live" dashboard
        const critChange = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        let newCrit = prev.critical + critChange;
        if (newCrit < 1) newCrit = 1;
        if (newCrit > 7) newCrit = 7;
        
        const citizenChange = Math.random() > 0.7 ? 1 : 0;
        
        return {
          ...prev,
          critical: newCrit,
          citizens: prev.citizens + citizenChange
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in zoom-in duration-500">
      
      {/* Header section with pulsating live indicator */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-medium text-white tracking-wide">System Matrix</h2>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
             <span className="relative flex h-2.5 w-2.5">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
             </span>
             Real-time monitoring active
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Nodes Deploy', value: stats.totalBins, color: 'text-azure-400', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]', border: 'border-azure-500/30', trend: '+2 this week', icon: Trash2 },
          { label: 'Critical Overflows', value: stats.critical, color: 'text-red-400', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]', border: 'border-red-500/30', trend: 'Needs action', icon: AlertTriangle, isAlert: true },
          { label: 'Fleet Active', value: stats.activeTrucks, color: 'text-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]', border: 'border-emerald-500/30', trend: 'On schedule', icon: Truck },
          { label: 'Citizen Grid', value: stats.citizens, color: 'text-violet-400', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]', border: 'border-violet-500/30', trend: '+153 this month', icon: Users }
        ].map((item, idx) => (
          <div key={idx} className={`glass-panel p-6 ${item.glow} group hover:border-white/20 transition-all duration-300 relative overflow-hidden`}>
             <div className="absolute top-0 right-0 p-4 opacity-10 transform scale-150 group-hover:scale-110 transition-transform duration-500 text-white mix-blend-overlay">
               <item.icon size={80} />
             </div>
             
             {item.isAlert && <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500 animate-pulse" />}
             
             <div className="flex justify-between items-start mb-4 relative z-10">
               <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
                 <item.icon className={item.color} size={20} />
               </div>
               <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-black/20 px-2 py-1 rounded-md border border-white/5">{item.trend}</span>
             </div>
             
             <div className="relative z-10">
               <h3 className={`text-4xl font-display font-bold ${item.color} tracking-tight drop-shadow-md`}>{item.value}</h3>
               <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mt-1">{item.label}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-panel p-1 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] h-[540px] flex flex-col">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20 rounded-t-2xl">
               <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="text-emerald-400" size={18} />
                  Live Geospatial Matrix
               </h2>
               <div className="flex gap-2">
                 <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium tracking-wide">Optimized</span>
               </div>
            </div>
            <div className="flex-1 rounded-b-xl overflow-hidden relative bg-dark-900 border-t border-white/5">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-azure-900/10 via-dark-900 to-dark-900 pointer-events-none z-10 opacity-60"></div>
              {/* Optional Grid Overlay */}
              <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none z-10 mix-blend-overlay"></div>
              <BinMap />
            </div>
          </div>
          
          <div className="glass-panel p-5">
            <h2 className="text-lg font-display font-medium text-white mb-6 flex items-center gap-2">
               <Zap className="text-violet-400" size={18} />
               Pattern Analysis
            </h2>
            <AnalyticsPanel />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="glass-panel p-0 overflow-hidden flex flex-col max-h-[420px]">
             <div className="p-5 border-b border-white/5 bg-gradient-to-r from-red-500/10 to-transparent">
               <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
                 <AlertTriangle className="text-red-400" size={18} />
                 Anomaly Detection
               </h2>
             </div>
             <div className="p-2 overflow-auto custom-scrollbar">
                <AlertsPanel />
             </div>
          </div>
          
          <div className="glass-panel p-5 border-azure-500/20 flex-1 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-azure-500/10 rounded-full blur-[40px] pointer-events-none" />
            <h2 className="text-lg font-display font-medium text-white mb-4 flex items-center gap-2 relative z-10">
               <Truck className="text-azure-400" size={18} />
               A* Route Formulation
            </h2>
            <div className="relative z-10 flex-1">
               <RoutePanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Alert Icon fallback to prevent import issues if missing
function AlertTriangle(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
  );
}
