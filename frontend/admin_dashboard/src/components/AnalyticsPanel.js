// SWACHH-AI — Admin Dashboard
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

'use client';
import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

const fillData = [
  { name: 'Mon', bin2: 20, bin7: 45 },
  { name: 'Tue', bin2: 40, bin7: 75 },
  { name: 'Wed', bin2: 65, bin7: 90 },
  { name: 'Thu', bin2: 85, bin7: 15 },
  { name: 'Fri', bin2: 15, bin7: 35 },
  { name: 'Sat', bin2: 40, bin7: 60 },
  { name: 'Sun', bin2: 70, bin7: 85 },
];

const wasteTypeData = [
  { name: 'Plastic', count: 450 },
  { name: 'Organic', count: 800 },
  { name: 'Paper', count: 320 },
  { name: 'Metal', count: 150 },
];

export default function AnalyticsPanel() {
  const [range, setRange] = useState('Last 7 days');

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center bg-black/20 p-2 rounded-xl border border-white/5 backdrop-blur-md">
        <select 
          className="text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 text-gray-200"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
           <option className="bg-dark-900 text-white">Today</option>
           <option className="bg-dark-900 text-white">Last 7 days</option>
           <option className="bg-dark-900 text-white">Last 30 days</option>
        </select>
        <button className="flex items-center gap-2 text-xs bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] transition">
          <Download size={14} />
          Export Datastore
        </button>
      </div>

      <div className="h-[250px]">
        <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Node Telemetry (Critical)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={fillData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6b7280'}} stroke="rgba(255,255,255,0.1)" />
            <YAxis tick={{fontSize: 12, fill: '#6b7280'}} stroke="rgba(255,255,255,0.1)" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(10px)', color: '#fff' }} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
            <Line type="monotone" dataKey="bin2" name="Node #2" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#111827' }} activeDot={{ r: 6, fill: '#ef4444' }} />
            <Line type="monotone" dataKey="bin7" name="Node #7" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#111827' }} activeDot={{ r: 6, fill: '#f59e0b' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[250px] mt-4">
         <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Material Classification</h3>
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wasteTypeData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6b7280'}} stroke="rgba(255,255,255,0.1)" />
              <YAxis tick={{fontSize: 12, fill: '#6b7280'}} stroke="rgba(255,255,255,0.1)" />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(10px)', color: '#fff' }} />
              <Bar dataKey="count" fill="url(#colorEmerald)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </BarChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
}
