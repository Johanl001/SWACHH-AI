// SWACHH-AI — Admin Dashboard
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

'use client';
import React, { useState } from 'react';
import { optimizeRoute } from '../lib/astar';
import { Compass, Printer, Send, MapPin, Search } from 'lucide-react';

export default function RoutePanel() {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    setLoading(true);
    setTimeout(() => {
      // Mock result
      setRoute({
        distance: 12.4,
        duration: 38,
        fuelSaved: 15,
        waypoints: [
          { id: 'start', address: 'Central Depot Alpha', fill: 0 },
          { id: 2, address: 'Sector-7 Collection Point', fill: 85 },
          { id: 7, address: 'Tech Park Zone', fill: 92 },
          { id: 'end', address: 'Processing Facility Omega', fill: 0 }
        ]
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full font-sans">
      {!route ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 h-full relative">
          <div className="absolute inset-0 bg-map-pattern opacity-5 pointer-events-none" />
          <Compass size={48} className="text-azure-500/50 mb-4 animate-[spin_10s_linear_infinite]" />
          <p className="text-gray-400 mb-6 text-center text-sm font-medium">No active formulation for this sector.</p>
          <button 
            onClick={handleOptimize}
            disabled={loading}
            className="w-full relative overflow-hidden bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 border border-emerald-400/50 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <Search size={18} className="animate-pulse" />
                <span className="tracking-wider">Executing A* Search...</span>
              </>
            ) : (
              <>
                <Zap size={18} />
                <span className="tracking-wide">Initialize A* Routing</span>
              </>
            )}
            {!loading && <div className="absolute inset-0 bg-white/20 transform -translate-x-[150%] skew-x-[45deg] group-hover:translate-x-[150%] transition-transform duration-700 pointer-events-none" />}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-3 gap-2 text-center bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-md">
            <div>
              <span className="block font-black text-2xl text-white tracking-tighter">{route.distance}<span className="text-sm font-normal text-gray-500 ml-1">km</span></span>
              <span className="text-[10px] uppercase text-gray-500 tracking-widest font-bold">Vector</span>
            </div>
            <div className="border-x border-white/10">
              <span className="block font-black text-2xl text-white tracking-tighter">{route.duration}<span className="text-sm font-normal text-gray-500 ml-1">m</span></span>
              <span className="text-[10px] uppercase text-gray-500 tracking-widest font-bold">Est. Time</span>
            </div>
            <div>
              <span className="block font-black text-2xl text-emerald-400 tracking-tighter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">~{route.fuelSaved}%</span>
              <span className="text-[10px] uppercase text-emerald-500/70 tracking-widest font-bold">Fuel Cons.</span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 mb-2">
            <span className="text-xs uppercase text-gray-400 font-bold tracking-widest">Waypoints ({route.waypoints.length})</span>
            <span className="text-[10px] bg-azure-500/20 text-azure-400 px-2.5 py-1 rounded-md border border-azure-500/30 uppercase tracking-widest font-bold flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-azure-400 animate-pulse" />
              Locked
            </span>
          </div>

          <ul className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-2 relative">
            <div className="absolute left-4 top-2 bottom-6 w-px bg-white/10 pointer-events-none" />
            {route.waypoints.map((wp, i) => (
              <li key={wp.id} className="relative flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl shadow-sm backdrop-blur-sm group hover:border-white/20 transition-colors">
                 <div className="flex items-center gap-3 relative z-10">
                   <div className={`h-8 w-8 rounded-lg flex items-center justify-center shadow-inner font-bold text-xs ${wp.fill > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                     {wp.id === 'start' || wp.id === 'end' ? <MapPin size={14} /> : i+1}
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-200">{wp.address}</p>
                   </div>
                 </div>
                 {wp.fill > 0 && (
                   <span className="text-xs font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded-md border border-red-500/30 relative z-10">
                     {wp.fill}% Cap
                   </span>
                 )}
              </li>
            ))}
          </ul>
          
          <div className="flex gap-3 pt-4 mt-2">
             <button className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2">
               <Printer size={16} />
               <span>Hardcopy</span>
             </button>
             <button className="flex-[2] relative overflow-hidden bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2">
               <Send size={16} />
               <span>Transmit to Fleet</span>
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline fallback icon
function Zap(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

