/**
 * SWACHH-AI — Green Dashboard Screen
 * ====================================
 * Main screen showing:
 *  - User's Eco-Rank (Bronze Scavenger → Gold Guardian)
 *  - Progress bar toward next rank
 *  - Large "Scan & Dispose" button
 *  - Daily quest cards
 *  - Impact tracker stats
 *
 * "Indore-model" inspired design with high-contrast UI.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../components/ProgressBar';
import DailyQuest from '../components/DailyQuest';
import ImpactTracker from '../components/ImpactTracker';
import {
    getUserRank,
    getProgressToNextRank,
    RANKS,
} from '../utils/gamification';

const { width } = Dimensions.get('window');

const GreenDashboard = () => {
    const { t } = useTranslation();

    // ── User State (in production, from backend/AsyncStorage) ────
    const [userStats, setUserStats] = useState({
        totalCredits: 1250,
        totalKg: 34.5,
        itemsDisposed: 87,
        streak: 5,
        level: 12,
    });

    // Animation refs
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Scan button pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.08,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Fade in content
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const currentRank = getUserRank(userStats.totalCredits);
    const progress = getProgressToNextRank(userStats.totalCredits);

    // Daily quests
    const dailyQuests = [
        {
            id: 'q1',
            title: t('quest_plastic_title'),
            description: t('quest_plastic_desc'),
            reward: 50,
            progress: 2,
            target: 3,
            icon: '♻️',
        },
        {
            id: 'q2',
            title: t('quest_organic_title'),
            description: t('quest_organic_desc'),
            reward: 30,
            progress: 1,
            target: 5,
            icon: '🌱',
        },
        {
            id: 'q3',
            title: t('quest_streak_title'),
            description: t('quest_streak_desc'),
            reward: 100,
            progress: 5,
            target: 7,
            icon: '🔥',
        },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* ── Header ──────────────────────────── */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>{t('greeting')}</Text>
                    <Text style={styles.headerTitle}>SWACHH-AI</Text>
                </View>

                {/* ── Eco-Rank Card ───────────────────── */}
                <View style={styles.rankCard}>
                    <View style={styles.rankBadge}>
                        <Text style={styles.rankEmoji}>{currentRank.emoji}</Text>
                    </View>
                    <Text style={styles.rankTitle}>{t(currentRank.nameKey)}</Text>
                    <Text style={styles.rankSubtitle}>
                        {t('level')} {userStats.level} • {userStats.totalCredits} {t('credits')}
                    </Text>

                    <ProgressBar
                        progress={progress.percentage}
                        label={`${progress.current}/${progress.needed} ${t('to_next_rank')}`}
                        color={currentRank.color}
                    />
                </View>

                {/* ── Scan & Dispose Button ───────────── */}
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <TouchableOpacity
                        style={styles.scanButton}
                        activeOpacity={0.8}
                        onPress={() => {
                            // Navigate to camera / QR scanner
                            console.log('Scan & Dispose pressed');
                        }}
                    >
                        <Text style={styles.scanIcon}>📷</Text>
                        <Text style={styles.scanText}>{t('scan_dispose')}</Text>
                        <Text style={styles.scanSubtext}>{t('scan_subtitle')}</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Impact Tracker ──────────────────── */}
                <ImpactTracker
                    kgWaste={userStats.totalKg}
                    itemsDisposed={userStats.itemsDisposed}
                    streak={userStats.streak}
                />

                {/* ── Daily Quests ────────────────────── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎯 {t('daily_quests')}</Text>
                    {dailyQuests.map((quest) => (
                        <DailyQuest key={quest.id} quest={quest} />
                    ))}
                </View>

                {/* ── Stats Grid ──────────────────────── */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{userStats.itemsDisposed}</Text>
                        <Text style={styles.statLabel}>{t('items_disposed')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{userStats.streak}🔥</Text>
                        <Text style={styles.statLabel}>{t('day_streak')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{userStats.totalKg}kg</Text>
                        <Text style={styles.statLabel}>{t('waste_sorted')}</Text>
                    </View>
                </View>
            </Animated.View>
        </ScrollView>
    );
};

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A1628',
    },
    content: {
        padding: 20,
        paddingTop: 50,
    },
    header: {
        marginBottom: 24,
    },
    greeting: {
        fontSize: 16,
        color: '#94A3B8',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#22C55E',
        letterSpacing: 2,
    },

    // Rank Card
    rankCard: {
        backgroundColor: '#0F1D32',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#1E3A5F',
        alignItems: 'center',
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    rankBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    rankEmoji: {
        fontSize: 36,
    },
    rankTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#F1F5F9',
        marginBottom: 4,
    },
    rankSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 16,
    },

    // Scan Button
    scanButton: {
        backgroundColor: '#22C55E',
        borderRadius: 24,
        paddingVertical: 28,
        paddingHorizontal: 32,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    scanIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    scanText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0A1628',
        letterSpacing: 1,
    },
    scanSubtext: {
        fontSize: 13,
        color: '#0A1628',
        opacity: 0.7,
        marginTop: 4,
    },

    // Sections
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#F1F5F9',
        marginBottom: 16,
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#0F1D32',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#22C55E',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#94A3B8',
        textAlign: 'center',
    },
});

export default GreenDashboard;
