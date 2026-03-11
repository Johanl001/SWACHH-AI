/**
 * SWACHH-AI — Live Map Screen
 * ============================
 * Displays nearby SWACHH-AI smart bins with real-time availability.
 *
 * Markers:
 *   🟢 Green  = Empty  (< 50%)
 *   🟡 Yellow = Half   (50-80%)
 *   🔴 Red    = Full   (> 80%)
 *
 * Connects to MQTT broker via WebSocket for real-time updates.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

// ── Mock bin data (in production, from MQTT subscription) ─────
const INITIAL_BINS = [
    {
        id: 1,
        lat: 22.7196,
        lng: 75.8577,
        address: 'MG Road, Indore',
        fill_pct: 35,
        zone: 'Zone-A',
        lastUpdate: '2 min ago',
    },
    {
        id: 2,
        lat: 22.7235,
        lng: 75.8625,
        address: 'Rajwada, Indore',
        fill_pct: 72,
        zone: 'Zone-A',
        lastUpdate: '5 min ago',
    },
    {
        id: 3,
        lat: 22.7150,
        lng: 75.8500,
        address: 'Sapna Sangeeta Rd',
        fill_pct: 91,
        zone: 'Zone-B',
        lastUpdate: '1 min ago',
    },
    {
        id: 4,
        lat: 22.7300,
        lng: 75.8700,
        address: 'Vijay Nagar, Indore',
        fill_pct: 15,
        zone: 'Zone-B',
        lastUpdate: '8 min ago',
    },
    {
        id: 5,
        lat: 22.7100,
        lng: 75.8450,
        address: 'Palasia Square',
        fill_pct: 88,
        zone: 'Zone-C',
        lastUpdate: '3 min ago',
    },
];

const LiveMap = () => {
    const { t } = useTranslation();
    const [bins, setBins] = useState(INITIAL_BINS);
    const [selectedBin, setSelectedBin] = useState(null);
    const [filter, setFilter] = useState('all'); // all, available, full
    const slideAnim = useRef(new Animated.Value(200)).current;
    const mapRef = useRef(null);

    // ── MQTT Connection (WebSocket) ────────────────
    useEffect(() => {
        // In production, connect to MQTT broker:
        // const client = mqtt.connect('ws://broker:9001');
        // client.subscribe('swachh/bin_status');
        // client.on('message', (topic, message) => {
        //   const data = JSON.parse(message.toString());
        //   updateBin(data);
        // });

        // Simulate real-time updates for demo
        const interval = setInterval(() => {
            setBins((prev) =>
                prev.map((bin) => ({
                    ...bin,
                    fill_pct: Math.max(
                        0,
                        Math.min(100, bin.fill_pct + (Math.random() * 6 - 3))
                    ),
                    lastUpdate: 'just now',
                }))
            );
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // ── Helpers ────────────────────────────────────
    const getBinColor = (fill_pct) => {
        if (fill_pct >= 80) return '#EF4444'; // Red
        if (fill_pct >= 50) return '#F59E0B'; // Yellow
        return '#22C55E'; // Green
    };

    const getBinStatus = (fill_pct) => {
        if (fill_pct >= 80) return t('bin_full');
        if (fill_pct >= 50) return t('bin_half');
        return t('bin_available');
    };

    const getBinEmoji = (fill_pct) => {
        if (fill_pct >= 80) return '🔴';
        if (fill_pct >= 50) return '🟡';
        return '🟢';
    };

    // ── Filter bins ────────────────────────────────
    const filteredBins = bins.filter((bin) => {
        if (filter === 'available') return bin.fill_pct < 80;
        if (filter === 'full') return bin.fill_pct >= 80;
        return true;
    });

    // ── Select bin (show detail card) ──────────────
    const onBinPress = (bin) => {
        setSelectedBin(bin);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start();

        mapRef.current?.animateToRegion(
            {
                latitude: bin.lat,
                longitude: bin.lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            },
            500
        );
    };

    const dismissDetail = () => {
        Animated.timing(slideAnim, {
            toValue: 200,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setSelectedBin(null));
    };

    // ── Indore center coordinates ──────────────────
    const initialRegion = {
        latitude: 22.7196,
        longitude: 75.8577,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
    };

    return (
        <View style={styles.container}>
            {/* ── Map ─────────────────────────────── */}
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                customMapStyle={darkMapStyle}
                showsUserLocation
                showsMyLocationButton
            >
                {filteredBins.map((bin) => (
                    <Marker
                        key={bin.id}
                        coordinate={{ latitude: bin.lat, longitude: bin.lng }}
                        onPress={() => onBinPress(bin)}
                        pinColor={getBinColor(bin.fill_pct)}
                    >
                        <View style={[styles.markerContainer]}>
                            <View
                                style={[
                                    styles.marker,
                                    { backgroundColor: getBinColor(bin.fill_pct) },
                                ]}
                            >
                                <Text style={styles.markerText}>
                                    {Math.round(bin.fill_pct)}%
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.markerArrow,
                                    { borderTopColor: getBinColor(bin.fill_pct) },
                                ]}
                            />
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* ── Header Overlay ──────────────────── */}
            <View style={styles.headerOverlay}>
                <Text style={styles.headerTitle}>🗺️ {t('live_map')}</Text>
                <Text style={styles.headerSubtitle}>
                    {filteredBins.length} {t('bins_nearby')}
                </Text>
            </View>

            {/* ── Filter Pills ────────────────────── */}
            <View style={styles.filterRow}>
                {[
                    { key: 'all', label: t('filter_all'), emoji: '📍' },
                    { key: 'available', label: t('filter_available'), emoji: '🟢' },
                    { key: 'full', label: t('filter_full'), emoji: '🔴' },
                ].map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[
                            styles.filterPill,
                            filter === f.key && styles.filterPillActive,
                        ]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === f.key && styles.filterTextActive,
                            ]}
                        >
                            {f.emoji} {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Selected Bin Detail Card ─────────── */}
            {selectedBin && (
                <Animated.View
                    style={[
                        styles.detailCard,
                        { transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.detailClose}
                        onPress={dismissDetail}
                    >
                        <Text style={styles.detailCloseText}>✕</Text>
                    </TouchableOpacity>

                    <View style={styles.detailHeader}>
                        <Text style={styles.detailEmoji}>
                            {getBinEmoji(selectedBin.fill_pct)}
                        </Text>
                        <View style={styles.detailHeaderText}>
                            <Text style={styles.detailTitle}>
                                {t('bin')} #{selectedBin.id}
                            </Text>
                            <Text style={styles.detailAddress}>
                                {selectedBin.address}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailStats}>
                        <View style={styles.detailStat}>
                            <Text style={styles.detailStatValue}>
                                {Math.round(selectedBin.fill_pct)}%
                            </Text>
                            <Text style={styles.detailStatLabel}>{t('fill_level')}</Text>
                        </View>
                        <View style={styles.detailStat}>
                            <Text
                                style={[
                                    styles.detailStatValue,
                                    { color: getBinColor(selectedBin.fill_pct) },
                                ]}
                            >
                                {getBinStatus(selectedBin.fill_pct)}
                            </Text>
                            <Text style={styles.detailStatLabel}>{t('status')}</Text>
                        </View>
                        <View style={styles.detailStat}>
                            <Text style={styles.detailStatValue}>
                                {selectedBin.lastUpdate}
                            </Text>
                            <Text style={styles.detailStatLabel}>{t('last_update')}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.navigateButton}>
                        <Text style={styles.navigateText}>
                            🧭 {t('navigate_to_bin')}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* ── Legend ──────────────────────────── */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                    <Text style={styles.legendText}>&lt;50%</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.legendText}>50-80%</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.legendText}>&gt;80%</Text>
                </View>
            </View>
        </View>
    );
};

// ── Dark Map Style (Google Maps) ──────────────────────────────
const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#304a7d' }],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#0e1626' }],
    },
];

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A1628',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },

    // Header
    headerOverlay: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(15, 29, 50, 0.92)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#F1F5F9',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#94A3B8',
        marginTop: 2,
    },

    // Markers
    markerContainer: {
        alignItems: 'center',
    },
    marker: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 44,
        alignItems: 'center',
    },
    markerText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 12,
    },
    markerArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },

    // Filter pills
    filterRow: {
        position: 'absolute',
        top: 130,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    filterPill: {
        backgroundColor: 'rgba(15, 29, 50, 0.85)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    filterPillActive: {
        backgroundColor: '#22C55E',
        borderColor: '#22C55E',
    },
    filterText: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#0A1628',
    },

    // Detail Card
    detailCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0F1D32',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 32,
        borderWidth: 1,
        borderColor: '#1E3A5F',
        borderBottomWidth: 0,
    },
    detailClose: {
        position: 'absolute',
        top: 12,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailCloseText: {
        color: '#94A3B8',
        fontSize: 16,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    detailEmoji: {
        fontSize: 36,
        marginRight: 16,
    },
    detailHeaderText: {},
    detailTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#F1F5F9',
    },
    detailAddress: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 2,
    },
    detailStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    detailStat: {
        alignItems: 'center',
        flex: 1,
    },
    detailStatValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F1F5F9',
    },
    detailStatLabel: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
    },
    navigateButton: {
        backgroundColor: '#22C55E',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
    },
    navigateText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0A1628',
    },

    // Legend
    legend: {
        position: 'absolute',
        bottom: 20,
        right: 16,
        backgroundColor: 'rgba(15, 29, 50, 0.9)',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'column',
        gap: 6,
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    legendText: {
        color: '#94A3B8',
        fontSize: 11,
    },
});

export default LiveMap;
