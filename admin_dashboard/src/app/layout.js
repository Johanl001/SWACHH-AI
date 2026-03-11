import './globals.css';

export const metadata = {
    title: 'SWACHH-AI Admin Dashboard | Smart Waste Logistics',
    description:
        'Real-time admin dashboard for SWACHH-AI smart waste management — optimized collection routes, bin monitoring, and driver dispatch.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#0A1628" />
            </head>
            <body>
                <div className="app-container">
                    {/* ── Sidebar ──────────────────── */}
                    <aside className="sidebar">
                        <div className="sidebar-logo">
                            🌿 SWACHH-AI
                            <span>Admin Dashboard</span>
                        </div>
                        <a href="/" style={navLinkStyle}>📊 Dashboard</a>
                        <a href="/" style={navLinkStyle}>🗺️ Route Planner</a>
                        <a href="/" style={navLinkStyle}>🗑️ Bin Management</a>
                        <a href="/" style={navLinkStyle}>👥 Citizens</a>
                        <a href="/" style={navLinkStyle}>📈 Analytics</a>
                        <a href="/" style={{ ...navLinkStyle, marginTop: 'auto' }}>⚙️ Settings</a>
                    </aside>

                    {/* ── Main Content ─────────────── */}
                    <main className="main-content">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}

const navLinkStyle = {
    color: '#94A3B8',
    textDecoration: 'none',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
};
