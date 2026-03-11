'use client';

/**
 * SWACHH-AI — Route Panel Component
 * ===================================
 * Side panel showing:
 *   - Route summary (distance, time, bins)
 *   - Ordered stop sequence with fill levels
 *   - Dispatch button for drivers
 */

const RoutePanel = ({ route, onOptimize }) => {
    if (!route) {
        return (
            <div className="route-panel">
                <h2 className="route-panel-title">🛣️ Route Planner</h2>
                <p style={{ color: '#64748B', textAlign: 'center', marginTop: 40 }}>
                    Click &quot;Optimize Route&quot; to compute the best collection path.
                </p>
            </div>
        );
    }

    const { route: stops, totalDistance, estimatedTime, binsToCollect, binsSkipped } = route;

    const getBinColor = (fill_pct) => {
        if (fill_pct >= 80) return '#EF4444';
        if (fill_pct >= 50) return '#F59E0B';
        return '#22C55E';
    };

    const getFillClass = (fill_pct) => {
        if (fill_pct >= 80) return 'critical';
        if (fill_pct >= 50) return 'warning';
        return 'ok';
    };

    return (
        <div className="route-panel">
            {/* ── Header ─────────────────────── */}
            <div className="route-panel-header">
                <h2 className="route-panel-title">🛣️ Optimized Route</h2>
                <button className="btn-secondary" onClick={onOptimize}>
                    🔄
                </button>
            </div>

            {/* ── Summary Stats ──────────────── */}
            <div className="route-summary">
                <div className="route-stat">
                    <div className="route-stat-value">{totalDistance} km</div>
                    <div className="route-stat-label">Total Distance</div>
                </div>
                <div className="route-stat">
                    <div className="route-stat-value">{estimatedTime} min</div>
                    <div className="route-stat-label">Estimated Time</div>
                </div>
                <div className="route-stat">
                    <div className="route-stat-value" style={{ color: '#EF4444' }}>
                        {binsToCollect}
                    </div>
                    <div className="route-stat-label">Bins to Collect</div>
                </div>
                <div className="route-stat">
                    <div className="route-stat-value" style={{ color: '#94A3B8' }}>
                        {binsSkipped}
                    </div>
                    <div className="route-stat-label">Bins Skipped (&lt;80%)</div>
                </div>
            </div>

            {/* ── Stop Sequence ──────────────── */}
            <h3
                style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#94A3B8',
                    marginBottom: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                }}
            >
                Stop Sequence
            </h3>

            {/* Start: Depot */}
            <div className="stop-card" style={{ borderColor: '#22C55E' }}>
                <div className="stop-number" style={{ background: '#3B82F6' }}>
                    🏢
                </div>
                <div className="stop-info">
                    <div className="stop-name">Municipal Depot</div>
                    <div className="stop-address">Starting Point</div>
                </div>
                <span style={{ color: '#3B82F6', fontWeight: 700, fontSize: 12 }}>
                    START
                </span>
            </div>

            {/* Route Stops */}
            {stops.map((bin, idx) => (
                <div key={bin.id} className="stop-card">
                    <div className="stop-number">{idx + 1}</div>
                    <div className="stop-info">
                        <div className="stop-name">Bin #{bin.id}</div>
                        <div className="stop-address">{bin.address}</div>
                    </div>
                    <span className={`stop-fill ${getFillClass(bin.fill_pct)}`}>
                        {Math.round(bin.fill_pct)}%
                    </span>
                </div>
            ))}

            {/* End: Return to Depot */}
            <div className="stop-card" style={{ borderColor: '#3B82F6' }}>
                <div className="stop-number" style={{ background: '#3B82F6' }}>
                    🏢
                </div>
                <div className="stop-info">
                    <div className="stop-name">Municipal Depot</div>
                    <div className="stop-address">Return</div>
                </div>
                <span style={{ color: '#3B82F6', fontWeight: 700, fontSize: 12 }}>
                    END
                </span>
            </div>

            {/* ── Dispatch Button ────────────── */}
            <button
                className="btn-primary"
                style={{ width: '100%', marginTop: 20, padding: '16px' }}
                onClick={() => {
                    alert(
                        `Route dispatched!\n\n` +
                        `Stops: ${stops.length}\n` +
                        `Distance: ${totalDistance} km\n` +
                        `ETA: ${estimatedTime} min`
                    );
                }}
            >
                🚛 Dispatch Route to Driver
            </button>
        </div>
    );
};

export default RoutePanel;
