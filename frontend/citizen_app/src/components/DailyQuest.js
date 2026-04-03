/**
 * SWACHH-AI — Daily Quest Card Component
 * ========================================
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressBar from './ProgressBar';

const DailyQuest = ({ quest }) => {
    const {
        title,
        description,
        reward,
        progress,
        target,
        icon,
    } = quest;

    const pct = (progress / target) * 100;
    const isComplete = progress >= target;

    return (
        <View style={[styles.card, isComplete && styles.cardComplete]}>
            <View style={styles.header}>
                <Text style={styles.icon}>{icon}</Text>
                <View style={styles.headerText}>
                    <Text style={[styles.title, isComplete && styles.titleComplete]}>
                        {title}
                    </Text>
                    <Text style={styles.description}>{description}</Text>
                </View>
                <View style={styles.rewardBadge}>
                    <Text style={styles.rewardText}>+{reward}</Text>
                    <Text style={styles.rewardLabel}>💰</Text>
                </View>
            </View>

            <View style={styles.progressSection}>
                <ProgressBar
                    progress={pct}
                    color={isComplete ? '#22C55E' : '#3B82F6'}
                    height={8}
                    showPercentage={false}
                />
                <Text style={styles.progressText}>
                    {progress}/{target} {isComplete ? '✅' : ''}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#0F1D32',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    cardComplete: {
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    icon: {
        fontSize: 28,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: '#F1F5F9',
    },
    titleComplete: {
        textDecorationLine: 'line-through',
        color: '#22C55E',
    },
    description: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    rewardBadge: {
        alignItems: 'center',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    rewardText: {
        color: '#22C55E',
        fontWeight: '800',
        fontSize: 14,
    },
    rewardLabel: {
        fontSize: 10,
    },
    progressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressText: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '600',
        minWidth: 50,
        textAlign: 'right',
    },
});

export default DailyQuest;
