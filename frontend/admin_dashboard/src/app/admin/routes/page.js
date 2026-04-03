import RoutePanel from '../../../components/RoutePanel';
import { Truck } from 'lucide-react';

export default function RoutesPage() {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-medium text-white tracking-wide">Fleet & Routes</h2>
          <p className="text-gray-400 mt-1">A* Pathfinding and truck synchronization</p>
        </div>
      </div>
      <div className="glass-panel p-5 border-azure-500/20 flex-1 flex flex-col relative overflow-hidden min-h-[600px]">
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
  );
}
