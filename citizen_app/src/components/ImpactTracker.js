/**
 * SWACHH-AI — Impact Tracker Component
 * ======================================
 * Converts kg of waste into environmental equivalents:
 *   - Liters of water saved
 *   - Trees planted equivalent
 *   - CO₂ prevented (kg)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { kgToWaterSaved, kgToTreesPlanted, kgToCO2Saved } from '../utils/gamification';

const ImpactTracker = ({ kgWaste = 0, itemsDisposed = 0, streak = 0 }) => {
    const { t } = useTranslation();

    const waterSaved = kgToWaterSaved(kgWaste);
    const treesPlanted = kgToTreesPlanted(kgWaste);
    const co2Saved = kgToCO2Saved(kgWaste);

    const impacts = [
        {
            emoji: '💧',
            value: `${waterSaved.toFixed(0)}L`,
            label: t('water_saved'),
            color: '#06B6D4',
        },
        {
            emoji: '🌳',
            value: treesPlanted.toFixed(1),
            label: t('trees_equivalent'),
            color: '#22C55E',
        },
        {
            emoji: '🌍',
            value: `${co2Saved.toFixed(1)}kg`,
            label: t('co2_prevented'),
            color: '#8B5CF6',
        },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🌍 {t('your_impact')}</Text>
            <View style={styles.grid}>
                {impacts.map((impact, idx) => (
                    <View key={idx} style={styles.impactCard}>
                        <Text style={styles.impactEmoji}>{impact.emoji}</Text>
                        <Text style={[styles.impactValue, { color: impact.color }]}>
                            {impact.value}
                        </Text>
                        <Text style={styles.impactLabel}>{impact.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#F1F5F9',
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    impactCard: {
        flex: 1,
        backgroundColor: '#0F1D32',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1E3A5F',
    },
    impactEmoji: {
        fontSize: 28,
        marginBottom: 8,
    },
    impactValue: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 4,
    },
    impactLabel: {
        fontSize: 11,
        color: '#94A3B8',
        textAlign: 'center',
    },
});

export default ImpactTracker;
