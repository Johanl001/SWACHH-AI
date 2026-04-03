// SWACHH-AI — Citizen App
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Placeholder imports for Auth. Use existing LoginScreen/HomeScreen if available.
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';

import GreenDashboard from '../screens/GreenDashboard';
import LiveMap from '../screens/LiveMap';
import RedemptionStore from '../screens/RedemptionStore';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'leaf';
          if (route.name === 'Dashboard') iconName = 'leaf';
          else if (route.name === 'Map') iconName = 'map-marker';
          else if (route.name === 'Redeem') iconName = 'gift';
          else if (route.name === 'Leaderboard') iconName = 'trophy';
          else if (route.name === 'Profile') iconName = 'account';

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2ecc71',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={GreenDashboard} />
      <Tab.Screen name="Map" component={LiveMap} />
      <Tab.Screen name="Redeem" component={RedemptionStore} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = ({ user }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
           <>
             <Stack.Screen name="MainTabs" component={MainTabs} />
             <Stack.Screen name="History" component={HistoryScreen} />
           </>
        ) : (
           <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
