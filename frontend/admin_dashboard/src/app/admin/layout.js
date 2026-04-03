'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <>
      {/* Glassmorphic Sidebar */}
      <aside className="w-64 glass-panel border-l-0 border-y-0 !border-r-white/5 flex-col hidden md:flex rounded-none h-full z-20">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-azure-400 font-display">
            SWACHH<span className="text-white">AI</span>
          </h1>
          <p className="text-emerald-400/80 text-xs mt-1 font-medium tracking-wider uppercase">Logistics Core</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {[
            { name: 'Overview', href: '/admin' },
            { name: 'Route Panel', href: '/admin/routes' },
            { name: 'Bin Health', href: '/admin/bins' },
            { name: 'AI Insights', href: '/admin/insights' },
            { name: 'Settings', href: '/admin/settings' }
          ].map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`block py-3 px-4 rounded-xl transition-all duration-300 font-medium text-sm flex items-center gap-3 ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-transparent'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-white/5">
           <div className="glass-panel p-4 flex items-center gap-3">
             <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-400 to-azure-500 flex items-center justify-center text-dark-900 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]">
               AR
             </div>
             <div>
               <p className="text-sm font-bold text-white">Alex Rivera</p>
               <Link href="/" className="text-xs text-gray-400 hover:text-emerald-400">Exit Portal</Link>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-dark-900/50 backdrop-blur-md z-10">
          <div className="flex items-center">
            <div className="relative group">
              <select className="appearance-none bg-white/5 border border-white/10 rounded-xl text-sm py-2.5 pl-4 pr-10 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-md shadow-lg cursor-pointer">
                <option className="bg-dark-900 text-white">Zone Alpha (Sector-7)</option>
                <option className="bg-dark-900 text-white">Zone Beta (Sector-3)</option>
                <option className="bg-dark-900 text-white">Zone Omega (Sector-9)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer group">
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] z-10" />
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition">
                 <span className="text-gray-300">🔔</span>
              </div>
            </div>
            
            <button className="glass-button flex items-center gap-2">
               <span className="animate-pulse text-emerald-400">⚡</span>
               <span className="text-emerald-400">System Online</span>
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth relative z-0">
          {children}
        </main>
      </div>
    </>
  );
}
