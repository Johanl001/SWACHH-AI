/**
 * SWACHH-AI — Redemption Store Screen
 * =====================================
 * Local rewards store where users redeem Green Credits.
 *
 * Rewards:
 *   - Utility bill discounts
 *   - Local store vouchers
 *   - Tree planting pledges
 *   - Public transport passes
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

// ── Available Rewards ─────────────────────────────────────────
const REWARDS = [
    {
        id: 'r1',
        emoji: '⚡',
        title: 'reward_electricity',
        description: 'reward_electricity_desc',
        credits: 500,
        category: 'utility',
        color: '#F59E0B',
        popular: true,
    },
    {
        id: 'r2',
        emoji: '🚌',
        title: 'reward_bus_pass',
        description: 'reward_bus_pass_desc',
        credits: 300,
        category: 'transport',
        color: '#3B82F6',
        popular: false,
    },
    {
        id: 'r3',
        emoji: '🌳',
        title: 'reward_plant_tree',
        description: 'reward_plant_tree_desc',
        credits: 200,
        category: 'environment',
        color: '#22C55E',
        popular: true,
    },
    {
        id: 'r4',
        emoji: '🛒',
        title: 'reward_grocery',
        description: 'reward_grocery_desc',
        credits: 400,
        category: 'shopping',
        color: '#8B5CF6',
        popular: false,
    },
    {
        id: 'r5',
        emoji: '💧',
        title: 'reward_water_bill',
        description: 'reward_water_bill_desc',
        credits: 350,
        category: 'utility',
        color: '#06B6D4',
        popular: false,
    },
    {
        id: 'r6',
        emoji: '📱',
        title: 'reward_mobile_recharge',
        description: 'reward_mobile_recharge_desc',
        credits: 250,
        category: 'digital',
        color: '#EC4899',
        popular: true,
    },
    {
        id: 'r7',
        emoji: '🏥',
        title: 'reward_health_checkup',
        description: 'reward_health_checkup_desc',
        credits: 600,
        category: 'health',
        color: '#EF4444',
        popular: false,
    },
    {
        id: 'r8',
        emoji: '☕',
        title: 'reward_cafe_voucher',
        description: 'reward_cafe_voucher_desc',
        credits: 150,
        category: 'food',
        color: '#A16207',
        popular: false,
    },
];

const RedemptionStore = () => {
    const { t } = useTranslation();
    const [userCredits] = useState(1250);
    const [showModal, setShowModal] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);
    const [filter, setFilter] = useState('all');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const modalAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const filteredRewards = REWARDS.filter((r) => {
        if (filter === 'affordable') return r.credits <= userCredits;
        if (filter === 'popular') return r.popular;
        return true;
    });

    const onRedeem = (reward) => {
        setSelectedReward(reward);
        setShowModal(true);
        Animated.spring(modalAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start();
    };

    const confirmRedeem = () => {
        // In production: call API to deduct credits and issue reward
        console.log(`Redeemed: ${selectedReward.id}`);
        setShowModal(false);
        modalAnim.setValue(0);
    };

    const cancelRedeem = () => {
        setShowModal(false);
        modalAnim.setValue(0);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* ── Header ─────────────────────────── */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>🎁 {t('rewards_store')}</Text>
                    <View style={styles.creditBadge}>
                        <Text style={styles.creditBadgeText}>
                            💰 {userCredits} {t('credits')}
                        </Text>
                    </View>
                </View>

                {/* ── Filter Tabs ────────────────────── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                >
                    {[
                        { key: 'all', label: t('filter_all') },
                        { key: 'affordable', label: t('filter_affordable') },
                        { key: 'popular', label: '🔥 ' + t('filter_popular') },
                    ].map((f) => (
                        <TouchableOpacity
                            key={f.key}
                            style={[
                                styles.filterTab,
                                filter === f.key && styles.filterTabActive,
                            ]}
                            onPress={() => setFilter(f.key)}
                        >
                            <Text
                                style={[
                                    styles.filterTabText,
                                    filter === f.key && styles.filterTabTextActive,
                                ]}
                            >
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ── Rewards Grid ───────────────────── */}
                <View style={styles.grid}>
                    {filteredRewards.map((reward) => {
                        const canAfford = userCredits >= reward.credits;
                        return (
                            <TouchableOpacity
                                key={reward.id}
                                style={[
                                    styles.rewardCard,
                                    !canAfford && styles.rewardCardDisabled,
                                ]}
                                onPress={() => canAfford && onRedeem(reward)}
                                disabled={!canAfford}
                                activeOpacity={0.7}
                            >
                                {reward.popular && (
                                    <View style={styles.popularBadge}>
                                        <Text style={styles.popularText}>🔥 Popular</Text>
                                    </View>
                                )}

                                <View
                                    style={[
                                        styles.rewardIcon,
                                        { backgroundColor: reward.color + '20' },
                                    ]}
                                >
                                    <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
                                </View>

                                <Text style={styles.rewardTitle}>{t(reward.title)}</Text>
                                <Text style={styles.rewardDesc}>
                                    {t(reward.description)}
                                </Text>

                                <View style={styles.rewardFooter}>
                                    <Text
                                        style={[
                                            styles.rewardCredits,
                                            { color: canAfford ? '#22C55E' : '#64748B' },
                                        ]}
                                    >
                                        💰 {reward.credits}
                                    </Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.redeemButton,
                                            !canAfford && styles.redeemButtonDisabled,
                                        ]}
                                        disabled={!canAfford}
                                        onPress={() => canAfford && onRedeem(reward)}
                                    >
                                        <Text
                                            style={[
                                                styles.redeemText,
                                                !canAfford && styles.redeemTextDisabled,
                                            ]}
                                        >
                                            {canAfford ? t('redeem') : t('need_more')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </Animated.View>

            {/* ── Confirmation Modal ───────────────── */}
            <Modal visible={showModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <Animated.View
                        style={[
                            styles.modalCard,
                            {
                                transform: [
                                    {
                                        scale: modalAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.8, 1],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        {selectedReward && (
                            <>
                                <Text style={styles.modalEmoji}>{selectedReward.emoji}</Text>
                                <Text style={styles.modalTitle}>
                                    {t('confirm_redeem')}
                                </Text>
                                <Text style={styles.modalDesc}>
                                    {t(selectedReward.title)} — {selectedReward.credits}{' '}
                                    {t('credits')}
                                </Text>

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.modalCancel}
                                        onPress={cancelRedeem}
                                    >
                                        <Text style={styles.modalCancelText}>{t('cancel')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalConfirm}
                                        onPress={confirmRedeem}
                                    >
                                        <Text style={styles.modalConfirmText}>
                                            ✅ {t('confirm')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </Animated.View>
                </View>
            </Modal>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#F1F5F9',
    },
    creditBadge: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#22C55E',
    },
    creditBadgeText: {
        color: '#22C55E',
        fontWeight: '700',
        fontSize: 14,
    },

    // Filters
    filterScroll: {
        marginBottom: 20,
    },
    filterTab: {
        backgroundColor: '#0F1D32',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    filterTabActive: {
        backgroundColor: '#22C55E',
        borderColor: '#22C55E',
    },
    filterTabText: {
        color: '#94A3B8',
        fontWeight: '600',
        fontSize: 14,
    },
    filterTabTextActive: {
        color: '#0A1628',
    },

    // Grid
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    rewardCard: {
        width: (width - 52) / 2,
        backgroundColor: '#0F1D32',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    rewardCardDisabled: {
        opacity: 0.5,
    },
    popularBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    popularText: {
        fontSize: 10,
        color: '#F59E0B',
        fontWeight: '600',
    },
    rewardIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    rewardEmoji: {
        fontSize: 24,
    },
    rewardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#F1F5F9',
        marginBottom: 4,
    },
    rewardDesc: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 12,
        lineHeight: 16,
    },
    rewardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rewardCredits: {
        fontWeight: '800',
        fontSize: 14,
    },
    redeemButton: {
        backgroundColor: '#22C55E',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    redeemButtonDisabled: {
        backgroundColor: '#1E3A5F',
    },
    redeemText: {
        color: '#0A1628',
        fontWeight: '700',
        fontSize: 12,
    },
    redeemTextDisabled: {
        color: '#64748B',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        backgroundColor: '#0F1D32',
        borderRadius: 24,
        padding: 32,
        width: width - 64,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    modalEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#F1F5F9',
        marginBottom: 8,
    },
    modalDesc: {
        fontSize: 15,
        color: '#94A3B8',
        marginBottom: 24,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancel: {
        flex: 1,
        backgroundColor: '#1E3A5F',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    modalCancelText: {
        color: '#94A3B8',
        fontWeight: '700',
        fontSize: 16,
    },
    modalConfirm: {
        flex: 1,
        backgroundColor: '#22C55E',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    modalConfirmText: {
        color: '#0A1628',
        fontWeight: '700',
        fontSize: 16,
    },
});

export default RedemptionStore;
