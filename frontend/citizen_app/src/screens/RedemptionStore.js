// SWACHH-AI — Citizen App
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { t } from '../utils/i18n';

const REWARDS = [
  { id: 'r1', name: 'BEST Bus Pass 1-day', city: 'Mumbai', cost: 200, icon: '🚌' },
  { id: 'r2', name: 'DTC Metro Top-up ₹50', city: 'Delhi', cost: 150, icon: '🚇' },
  { id: 'r3', name: 'BigBasket ₹100 voucher', city: 'All', cost: 300, icon: '🛒' },
  { id: 'r4', name: 'PMC Water Bill ₹20 credit', city: 'Pune', cost: 250, icon: '💧' },
  { id: 'r5', name: 'Tree planted in your name', city: 'All', cost: 500, icon: '🌳' },
  { id: 'r6', name: 'Donate to school', city: 'All', cost: 100, icon: '🏫' },
  { id: 'r7', name: 'Swachh-AI Premium badge', city: 'All', cost: 100, icon: '💎' },
  { id: 'r8', name: 'Local grocery voucher ₹50', city: 'All', cost: 180, icon: '🛍️' },
];

const RedemptionStore = () => {
  const [balance, setBalance] = useState(340); // Mock starting balance

  const handleRedeem = (item) => {
    if (balance < item.cost) return;

    Alert.prompt(
      t('confirmRedeem'),
      `Enter 4-digit PIN to redeem ${item.name} for ${item.cost} credits.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Redeem', 
          onPress: (pin) => {
            if (pin && pin.length === 4) {
               setBalance(prev => prev - item.cost);
               const code = Math.random().toString(36).substring(2, 10).toUpperCase();
               Alert.alert('Success!', `Your voucher code is: ${code}`);
            } else {
               Alert.alert('Error', 'Invalid PIN');
            }
          } 
        }
      ],
      'secure-text'
    );
  };

  const renderItem = ({ item }) => {
    const disabled = balance < item.cost;
    return (
      <TouchableOpacity 
        style={[styles.card, disabled && styles.cardDisabled]} 
        onPress={() => handleRedeem(item)}
        disabled={disabled}
      >
        <Text style={styles.cardIcon}>{item.icon}</Text>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardCity}>{item.city}</Text>
        <Text style={[styles.cardCost, disabled && styles.cardCostDisabled]}>{item.cost} {t('credits')}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
       <View style={styles.header}>
         <Text style={styles.balanceTitle}>Available Balance</Text>
         <Text style={styles.balance}>{balance} 🌿</Text>
       </View>

       <FlatList
         data={REWARDS}
         keyExtractor={item => item.id}
         renderItem={renderItem}
         numColumns={2}
         contentContainerStyle={styles.list}
       />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 20, backgroundColor: 'white', alignItems: 'center', elevation: 2, marginBottom: 10 },
  balanceTitle: { fontSize: 16, color: '#6b7280' },
  balance: { fontSize: 36, fontWeight: 'bold', color: '#15803d', marginTop: 8 },
  list: { padding: 10 },
  card: { flex: 1, backgroundColor: 'white', margin: 8, padding: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
  cardDisabled: { opacity: 0.5 },
  cardIcon: { fontSize: 40, marginBottom: 10 },
  cardName: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#1f2937', marginBottom: 4 },
  cardCity: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  cardCost: { fontSize: 14, fontWeight: 'bold', color: '#047857' },
  cardCostDisabled: { color: '#9ca3af' }
});

export default RedemptionStore;
