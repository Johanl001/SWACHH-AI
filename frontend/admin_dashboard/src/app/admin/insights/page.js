import AnalyticsPanel from '../../../components/AnalyticsPanel';
import { Zap } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-medium text-white tracking-wide">AI Pattern Analysis</h2>
          <p className="text-gray-400 mt-1">Predictive logistics and historical data modeling</p>
        </div>
      </div>
      
      <div className="glass-panel p-6 min-h-[600px]">
        <h2 className="text-xl font-display font-medium text-white mb-6 flex items-center gap-2">
           <Zap className="text-violet-400" size={24} />
           Ecosystem Metrics
        </h2>
        <div className="mt-8">
           <AnalyticsPanel />
        </div>
      </div>
    </div>
  );
}
