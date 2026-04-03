import BinMap from '../../../components/BinMap';
import AlertsPanel from '../../../components/AlertsPanel';
import { Activity } from 'lucide-react';

export default function BinsPage() {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-medium text-white tracking-wide">Bin Health Matrix</h2>
          <p className="text-gray-400 mt-1">Geospatial tracking and active anomalies</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-panel p-1 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] h-[600px] flex flex-col">
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20 rounded-t-2xl">
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="text-emerald-400" size={18} />
                Live Geospatial Distribution
             </h2>
          </div>
          <div className="flex-1 rounded-b-xl overflow-hidden relative bg-dark-900 border-t border-white/5">
             <BinMap />
          </div>
        </div>
        
        <div className="glass-panel p-0 overflow-hidden flex flex-col h-[600px]">
           <div className="p-5 border-b border-white/5 bg-gradient-to-r from-red-500/10 to-transparent">
             <h2 className="text-lg font-display font-medium text-white">Anomaly Detection</h2>
           </div>
           <div className="p-2 overflow-auto custom-scrollbar">
              <AlertsPanel />
           </div>
        </div>
      </div>
    </div>
  );
}
