import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center relative p-6">
      
      {/* Decorative center glowing orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-12 z-10 relative">
        
        {/* Header / Brand */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl mb-4 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
             <span className="text-4xl">🌿</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-azure-400 font-display drop-shadow-sm">
            SWACHH<span className="text-white">AI</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl font-light">
            Smart Waste Management Ecosystem <br className="hidden md:block"/> 
            <span className="text-emerald-400 font-medium">India Innovate 2026 Initiative</span>
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          
          {/* Citizen Portal Card */}
          <div className="glass-panel p-8 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300 border-violet-500/20 hover:border-violet-500/50 hover:shadow-[0_10px_40px_rgba(139,92,246,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-violet-500/20 transition-all" />
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl shadow-lg mb-6 z-10">
              📱
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 z-10 font-display">Citizen Portal</h2>
            <p className="text-sm text-gray-400 mb-8 z-10 flex-1">
              Download the mobile app to participate in gamified waste segregation, track your eco-points, and report local bins.
            </p>
            <div className="w-full space-y-3 z-10">
              <button disabled className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-medium cursor-not-allowed flex items-center justify-center gap-2">
                Available on Mobile App
              </button>
              <p className="text-xs text-violet-400 font-medium">Refer to the citizen_app folder</p>
            </div>
          </div>

          {/* Admin Portal Card */}
          <div className="glass-panel p-8 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300 border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_10px_40px_rgba(16,185,129,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -ml-10 -mt-10 group-hover:bg-emerald-500/20 transition-all" />
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-3xl shadow-lg mb-6 text-dark-900 z-10">
              📊
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 z-10 font-display">System Admin</h2>
            <p className="text-sm text-gray-400 mb-8 z-10 flex-1">
              Access the logistics core matrix to monitor real-time bin health, view AI insights, and manage fleet routes.
            </p>
            <Link href="/admin" className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-dark-900 font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 z-10">
               Login to Dashboard →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
