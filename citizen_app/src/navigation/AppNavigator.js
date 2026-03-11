/**
 * SWACHH-AI — App Navigator (Bottom Tabs)
 * ========================================
 * Three-tab navigation: Dashboard, Map, Store
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import GreenDashboard from '../screens/GreenDashboard';
import LiveMap from '../screens/LiveMap';
import RedemptionStore from '../screens/RedemptionStore';

const Tab = createBottomTabNavigator();

// Simple icon component (replace with react-native-vector-icons in production)
const TabIcon = ({ name, focused }) => {
    const icons = {
        Dashboard: '🏠',
        Map: '🗺️',
        Store: '🎁',
    };

    return (
        <View style={[styles.iconContainer, focused && styles.iconFocused]}>
            <View style={styles.iconText}>
                {/* Using emoji as placeholder — use Icon component in production */}
            </View>
        </View>
    );
};

const AppNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#22C55E',
                tabBarInactiveTintColor: '#64748B',
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarIcon: ({ focused }) => (
                    <TabIcon name={route.name} focused={focused} />
                ),
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={GreenDashboard}
                options={{ tabBarLabel: '🏠 Home' }}
            />
            <Tab.Screen
                name="Map"
                component={LiveMap}
                options={{ tabBarLabel: '🗺️ Map' }}
            />
            <Tab.Screen
                name="Store"
                component={RedemptionStore}
                options={{ tabBarLabel: '🎁 Rewards' }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#0F1D32',
        borderTopColor: '#1E3A5F',
        borderTopWidth: 1,
        height: 65,
        paddingBottom: 8,
        paddingTop: 8,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconFocused: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
    },
    iconText: {
        fontSize: 20,
    },
});

export default AppNavigator;
