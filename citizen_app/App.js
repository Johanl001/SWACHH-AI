/**
 * SWACHH-AI Citizen App — Root Component
 * =======================================
 * Gamified waste management app for Indian citizens.
 * "Indore-model" inspired UI with multilingual support.
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import './src/i18n/i18nConfig';

const App = () => {
    return (
        <NavigationContainer>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#0A1628"
                translucent={false}
            />
            <AppNavigator />
        </NavigationContainer>
    );
};

export default App;
