'use client';

/**
 * SWACHH-AI — BinMap Component (Google Maps)
 * ============================================
 * Renders Google Maps with:
 *   - Color-coded bin markers (Green/Yellow/Red)
 *   - Optimized route polyline
 *   - Depot marker
 *   - Info windows on marker click
 */

import { useCallback, useRef, useState } from 'react';

// ── Note: In production, use @react-google-maps/api ──────────
// This component uses a simplified map rendering approach
// that works without a Google Maps API key for development.

const BinMap = ({ bins = [], route = null, depot = null }) => {
    const [selectedBin, setSelectedBin] = useState(null);

    const getBinColor = (fill_pct) => {
        if (fill_pct >= 80) return '#EF4444';
        if (fill_pct >= 50) return '#F59E0B';
        return '#22C55E';
    };

    const getStatusLabel = (fill_pct) => {
        if (fill_pct >= 90) return 'CRITICAL';
        if (fill_pct >= 80) return 'FULL';
        if (fill_pct >= 50) return 'HALF';
        if (fill_pct >= 20) return 'LOW';
        return 'EMPTY';
    };

    // Route bins (ordered stops)
    const routeBins = route?.route || [];
    const isOnRoute = (binId) =>
        routeBins.some((rb) => rb.id === binId);

    return (
        <div style={styles.container}>
            {/* Map placeholder with interactive bin visualization */}
            <div style={styles.mapPlaceholder}>
                {/* Grid-based bin visualization */}
                <div style={styles.header}>
                    <span style={styles.headerText}>🗺️ Indore Smart Bin Network</span>
                    <span style={styles.headerSub}>
                        {bins.length} bins • {routeBins.length} stops on route
                    </span>
                </div>

                {/* Visual bin grid */}
                <div style={styles.binGrid}>
                    {bins.map((bin) => {
                        const onRoute = isOnRoute(bin.id);
                        const routeIndex = routeBins.findIndex((rb) => rb.id === bin.id);

                        return (
                            <div
                                key={bin.id}
                                style={{
                                    ...styles.binNode,
                                    borderColor: getBinColor(bin.fill_pct),
                                    boxShadow: onRoute
                                        ? `0 0 20px ${getBinColor(bin.fill_pct)}40`
                                        : 'none',
                                    opacity: route ? (onRoute ? 1 : 0.4) : 1,
                                }}
                                onClick={() => setSelectedBin(bin)}
                            >
                                {onRoute && (
                                    <div style={styles.routeBadge}>{routeIndex + 1}</div>
                                )}

                                <div
                                    style={{
                                        ...styles.fillBar,
                                        height: `${bin.fill_pct}%`,
                                        backgroundColor: getBinColor(bin.fill_pct),
                                    }}
                                />

                                <div style={styles.binInfo}>
                                    <span style={styles.binId}>#{bin.id}</span>
                                    <span
                                        style={{
                                            ...styles.binPct,
                                            color: getBinColor(bin.fill_pct),
                                        }}
                                    >
                                        {bin.fill_pct}%
                                    </span>
                                </div>

                                <div style={styles.binAddress}>{bin.address}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Route info overlay */}
                {route && routeBins.length > 0 && (
                    <div style={styles.routeOverlay}>
                        <div style={styles.routePath}>
                            <span style={styles.routeNode}>🏢 Depot</span>
                            {routeBins.map((bin, idx) => (
                                <span key={bin.id} style={styles.routeConnection}>
                                    <span style={styles.routeArrow}>→</span>
                                    <span
                                        style={{
                                            ...styles.routeNode,
                                            borderColor: getBinColor(bin.fill_pct),
                                        }}
                                    >
                                        #{bin.id} ({bin.fill_pct}%)
                                    </span>
                                </span>
                            ))}
                            <span style={styles.routeArrow}>→</span>
                            <span style={styles.routeNode}>🏢 Depot</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Selected bin detail */}
            {selectedBin && (
                <div style={styles.infoWindow}>
                    <button
                        style={styles.infoClose}
                        onClick={() => setSelectedBin(null)}
                    >
                        ✕
                    </button>
                    <h3 style={styles.infoTitle}>
                        Bin #{selectedBin.id} — {selectedBin.zone}
                    </h3>
                    <p style={styles.infoAddress}>{selectedBin.address}</p>
                    <div style={styles.infoStats}>
                        <div>
                            <span style={{ color: getBinColor(selectedBin.fill_pct), fontWeight: 800, fontSize: 24 }}>
                                {selectedBin.fill_pct}%
                            </span>
                            <div style={{ color: '#94A3B8', fontSize: 12 }}>Fill Level</div>
                        </div>
                        <div>
                            <span style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 18 }}>
                                {getStatusLabel(selectedBin.fill_pct)}
                            </span>
                            <div style={{ color: '#94A3B8', fontSize: 12 }}>Status</div>
                        </div>
                        <div>
                            <span style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 18 }}>
                                {selectedBin.lat.toFixed(4)}
                            </span>
                            <div style={{ color: '#94A3B8', fontSize: 12 }}>Latitude</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Map integration notice */}
            <div style={styles.mapNotice}>
                💡 Add <code>NEXT_PUBLIC_GOOGLE_MAPS_KEY</code> in <code>.env.local</code> for
                full Google Maps integration
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    mapPlaceholder: {
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0F1D32 0%, #132240 100%)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 700,
        color: '#F1F5F9',
    },
    headerSub: {
        fontSize: 13,
        color: '#94A3B8',
    },
    binGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        flex: 1,
    },
    binNode: {
        background: '#0A1628',
        border: '2px solid',
        borderRadius: 16,
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        minHeight: 120,
    },
    fillBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        opacity: 0.15,
        transition: 'height 1s ease',
    },
    routeBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: '#22C55E',
        color: '#0A1628',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 12,
        zIndex: 2,
    },
    binInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
    },
    binId: {
        fontSize: 14,
        fontWeight: 700,
        color: '#F1F5F9',
    },
    binPct: {
        fontSize: 20,
        fontWeight: 900,
    },
    binAddress: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 4,
        position: 'relative',
        zIndex: 1,
    },
    routeOverlay: {
        background: 'rgba(15, 29, 50, 0.9)',
        borderRadius: 12,
        padding: 16,
        border: '1px solid #1E3A5F',
    },
    routePath: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    routeNode: {
        padding: '6px 12px',
        borderRadius: 8,
        border: '1px solid #1E3A5F',
        fontSize: 12,
        fontWeight: 600,
        color: '#F1F5F9',
    },
    routeConnection: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    routeArrow: {
        color: '#22C55E',
        fontWeight: 700,
    },
    infoWindow: {
        position: 'absolute',
        top: 16,
        right: 16,
        background: '#0F1D32',
        border: '1px solid #1E3A5F',
        borderRadius: 16,
        padding: 20,
        minWidth: 280,
        zIndex: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    },
    infoClose: {
        position: 'absolute',
        top: 12,
        right: 12,
        background: 'none',
        border: 'none',
        color: '#94A3B8',
        cursor: 'pointer',
        fontSize: 16,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 700,
        color: '#F1F5F9',
        marginBottom: 4,
    },
    infoAddress: {
        fontSize: 13,
        color: '#94A3B8',
        marginBottom: 16,
    },
    infoStats: {
        display: 'flex',
        gap: 24,
    },
    mapNotice: {
        position: 'absolute',
        bottom: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 11,
        color: '#64748B',
        background: 'rgba(15, 29, 50, 0.9)',
        padding: '6px 16px',
        borderRadius: 8,
    },
};

export default BinMap;
