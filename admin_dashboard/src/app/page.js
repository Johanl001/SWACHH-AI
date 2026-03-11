'use client';

/**
 * SWACHH-AI — Admin Dashboard Home Page
 * =======================================
 * Displays:
 *   - Real-time bin status overview (stats bar)
 *   - Google Maps with bin markers and optimized route
 *   - Route panel with stop sequence, ETA, and distance
 */

import { useState, useEffect, useCallback } from 'react';
import BinMap from '../components/BinMap';
import RoutePanel from '../components/RoutePanel';
import { subscribeTopic, TOPICS } from '../lib/mqtt';
import { computeOptimalRoute } from '../lib/astar';

// ── Mock bin data (replaced by MQTT in production) ────────────
const INITIAL_BINS = [
    { id: 1, lat: 22.7196, lng: 75.8577, fill_pct: 92, address: 'MG Road, Indore', zone: 'Zone-A', status: 'CRITICAL' },
    { id: 2, lat: 22.7235, lng: 75.8625, fill_pct: 85, address: 'Rajwada, Indore', zone: 'Zone-A', status: 'FULL' },
    { id: 3, lat: 22.7150, lng: 75.8500, fill_pct: 45, address: 'Sapna Sangeeta Rd', zone: 'Zone-B', status: 'HALF' },
    { id: 4, lat: 22.7300, lng: 75.8700, fill_pct: 30, address: 'Vijay Nagar', zone: 'Zone-B', status: 'LOW' },
    { id: 5, lat: 22.7100, lng: 75.8450, fill_pct: 88, address: 'Palasia Square', zone: 'Zone-C', status: 'FULL' },
    { id: 6, lat: 22.7280, lng: 75.8540, fill_pct: 95, address: 'Geeta Bhawan', zone: 'Zone-A', status: 'CRITICAL' },
    { id: 7, lat: 22.7050, lng: 75.8650, fill_pct: 15, address: 'Rau Circle', zone: 'Zone-C', status: 'EMPTY' },
    { id: 8, lat: 22.7180, lng: 75.8420, fill_pct: 82, address: 'LIG Colony', zone: 'Zone-B', status: 'FULL' },
];

const DEPOT = { lat: 22.7196, lng: 75.8577, name: 'Municipal Depot' };

export default function AdminDashboard() {
    const [bins, setBins] = useState(INITIAL_BINS);
    const [route, setRoute] = useState(null);
    const [mqttStatus, setMqttStatus] = useState('connecting');

    // ── MQTT Subscription ──────────────────────
    useEffect(() => {
        const unsubscribe = subscribeTopic(TOPICS.BIN_STATUS, (data) => {
            setBins((prev) =>
                prev.map((bin) =>
                    bin.id === data.bin_id ? { ...bin, ...data } : bin
                )
            );
            setMqttStatus('online');
        });

        // Fallback: mark as offline after 5s if no data
        const timeout = setTimeout(() => {
            setMqttStatus((s) => (s === 'connecting' ? 'demo' : s));
        }, 5000);

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    // ── Compute Route ──────────────────────────
    const handleOptimizeRoute = useCallback(() => {
        const result = computeOptimalRoute(bins, DEPOT, 80);
        setRoute(result);
    }, [bins]);

    // Auto-compute on load
    useEffect(() => {
        handleOptimizeRoute();
    }, [handleOptimizeRoute]);

    // ── Stats ──────────────────────────────────
    const totalBins = bins.length;
    const criticalBins = bins.filter((b) => b.fill_pct >= 80).length;
    const avgFill = Math.round(
        bins.reduce((s, b) => s + b.fill_pct, 0) / totalBins
    );
    const todayCollections = 12; // In production: from database

    return (
        <>
            {/* ── Page Header ───────────────────── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">📊 Dashboard</h1>
                    <p className="page-subtitle">
                        Real-time waste management overview — Indore Municipal Corporation
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span className={`status-badge ${mqttStatus === 'online' ? 'online' : 'offline'}`}>
                        <span
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: mqttStatus === 'online' ? '#22C55E' : '#F59E0B',
                                display: 'inline-block',
                            }}
                            className={mqttStatus === 'online' ? 'pulse' : ''}
                        />
                        {mqttStatus === 'online' ? 'Live' : mqttStatus === 'demo' ? 'Demo Mode' : 'Connecting...'}
                    </span>
                    <button className="btn-primary" onClick={handleOptimizeRoute}>
                        🔄 Optimize Route
                    </button>
                </div>
            </div>

            {/* ── Stats Bar ──────────────────────── */}
            <div className="stats-bar">
                <div className="stat-card">
                    <div className="stat-icon">🗑️</div>
                    <div className="stat-value">{totalBins}</div>
                    <div className="stat-label">Total Smart Bins</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔴</div>
                    <div className="stat-value" style={{ color: '#EF4444' }}>
                        {criticalBins}
                    </div>
                    <div className="stat-label">Need Collection (&ge;80%)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">{avgFill}%</div>
                    <div className="stat-label">Average Fill Level</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🚛</div>
                    <div className="stat-value">{todayCollections}</div>
                    <div className="stat-label">Today&apos;s Collections</div>
                </div>
            </div>

            {/* ── Map + Route Panel ──────────────── */}
            <div className="dashboard-body">
                <div className="map-container">
                    <BinMap bins={bins} route={route} depot={DEPOT} />
                </div>
                <RoutePanel route={route} onOptimize={handleOptimizeRoute} />
            </div>
        </>
    );
}
