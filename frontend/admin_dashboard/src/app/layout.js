import './globals.css';
import { Inter, Manrope } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata = {
  title: 'SWACHH-AI | Government Portal',
  description: 'AI-driven waste management ecosystem',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="bg-dark-900 text-gray-100 font-sans min-h-screen overflow-hidden selection:bg-emerald-500/30">
        {/* Global Background glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-5%] w-[30rem] h-[30rem] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[25rem] h-[25rem] bg-azure-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="flex h-screen overflow-hidden relative z-10 w-full backdrop-blur-[2px]">
          {children}
        </div>
      </body>
    </html>
  );
}
