import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-medium text-white tracking-wide">System Settings</h2>
          <p className="text-gray-400 mt-1">Configure your logistics core</p>
        </div>
      </div>
      
      <div className="glass-panel p-8 max-w-2xl">
        <h2 className="text-xl font-display font-medium text-white mb-6 flex items-center gap-2">
           <Settings className="text-gray-400" size={24} />
           Configuration Parameters
        </h2>
        
        <div className="space-y-6">
           <div className="p-4 bg-white/5 rounded-xl border border-white/10">
             <h3 className="text-white font-medium mb-1">Mosquitto MQTT Broker</h3>
             <p className="text-sm text-gray-400 mb-4">Set connection parameters for the backend IoT bridge.</p>
             <input type="text" value="mqtt://localhost:1883" disabled className="w-full bg-dark-900 border border-white/10 rounded-lg py-2 px-3 text-gray-300 font-mono text-sm opacity-50 cursor-not-allowed" />
           </div>
           
           <div className="p-4 bg-white/5 rounded-xl border border-white/10">
             <h3 className="text-white font-medium mb-1">A* Pathfinding Weighting</h3>
             <p className="text-sm text-gray-400 mb-4">Adjust the preference between shortest distance vs minimum traffic.</p>
             <input type="range" className="w-full accent-emerald-500" />
             <div className="flex justify-between text-xs text-gray-500 mt-2">
               <span>Distance</span>
               <span>Balanced</span>
               <span>Traffic</span>
             </div>
           </div>
           
           <button className="px-6 py-2.5 bg-emerald-500 text-dark-900 font-bold rounded-lg hover:bg-emerald-400 transition-colors">
              Save Configuration
           </button>
        </div>
      </div>
    </div>
  );
}
