/**
 * SWACHH-AI — Animated Progress Bar Component
 * =============================================
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const ProgressBar = ({
    progress = 0,           // 0–100
    label = '',
    color = '#22C55E',
    height = 12,
    showPercentage = true,
}) => {
    const animWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animWidth, {
            toValue: Math.min(progress, 100),
            duration: 1200,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const widthInterpolation = animWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <View style={[styles.track, { height }]}>
                <Animated.View
                    style={[
                        styles.fill,
                        {
                            width: widthInterpolation,
                            backgroundColor: color,
                            height,
                        },
                    ]}
                />
                {/* Glow effect */}
                <Animated.View
                    style={[
                        styles.glow,
                        {
                            width: widthInterpolation,
                            backgroundColor: color,
                            height: height + 4,
                        },
                    ]}
                />
            </View>
            {showPercentage && (
                <Text style={[styles.percentage, { color }]}>
                    {Math.round(progress)}%
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 8,
        textAlign: 'center',
    },
    track: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    fill: {
        borderRadius: 20,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    glow: {
        borderRadius: 20,
        position: 'absolute',
        top: -2,
        left: 0,
        opacity: 0.2,
    },
    percentage: {
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'right',
        marginTop: 6,
    },
});

export default ProgressBar;
