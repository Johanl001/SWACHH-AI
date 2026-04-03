// SWACHH-AI — Citizen App
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { db, auth } from '../utils/firebase';
import { calculateImpact, getProgressToNextRank, generateDailyQuests } from '../utils/gamification';
import { t } from '../utils/i18n';

const GreenDashboard = ({ navigation }) => {
  const [userData, setUserData] = useState({ credits: 0, totalExp: 0, history: [] });
  const [refreshing, setRefreshing] = useState(false);
  const user = auth?.currentUser || { uid: 'demo_user_001', displayName: 'Demo User' };

  const loadData = () => {
    // In demo mode or normally, we would fetch from Firebase
    // Placeholder logic since Firebase isn't fully configured
    setTimeout(() => {
      setUserData({
        credits: 340,
        totalExp: 1200,
        history: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}] // 10 items
      });
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const { current, next, progressPct } = getProgressToNextRank(userData.totalExp);
  const impact = calculateImpact(userData.history);
  const quests = generateDailyQuests(new Date().getTime());

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('welcome')}, {user.displayName}</Text>
        <Text style={styles.cityBadge}>Pune</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('credits')}</Text>
        <Text style={styles.hugeNumber}>{userData.credits}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('rank')}: {current.name}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPct}%`, backgroundColor: current.color }]} />
        </View>
        <Text style={styles.subText}>{next ? `${Math.floor(next.minExp - userData.totalExp)} EXP to next rank` : 'Max Rank Reached!'}</Text>
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.gridItem}>
          <Text style={styles.gridValue}>{impact.kgRecycled.toFixed(1)} kg</Text>
          <Text style={styles.gridLabel}>Recycled</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridValue}>{impact.waterLitres.toFixed(1)} L</Text>
          <Text style={styles.gridLabel}>Water Saved</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridValue}>{impact.treeEquiv.toFixed(2)}</Text>
          <Text style={styles.gridLabel}>Trees Eq.</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridValue}>{impact.co2Kg.toFixed(1)} kg</Text>
          <Text style={styles.gridLabel}>CO2 Avoided</Text>
        </View>
      </View>

      <View style={styles.questsSection}>
        <Text style={styles.sectionTitle}>{t('quests')}</Text>
        {quests.map(q => (
          <View key={q.id} style={styles.questRow}>
            <View style={styles.checkbox} />
            <Text style={styles.questTitle}>{q.title}</Text>
            <Text style={styles.questReward}>+{q.reward} EXP</Text>
          </View>
        ))}
      </View>

      <View style={styles.footerNav}>
         <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Map')}>
            <Text style={styles.navButtonText}>{t('map')}</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Redeem')}>
            <Text style={styles.navButtonText}>{t('redeem')}</Text>
         </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#166534' },
  cityBadge: { backgroundColor: '#dcfce7', color: '#15803d', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  cardTitle: { fontSize: 16, color: '#4b5563', marginBottom: 8 },
  hugeNumber: { fontSize: 48, fontWeight: 'bold', color: '#15803d' },
  progressBarBg: { height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden', marginVertical: 8 },
  progressBarFill: { height: '100%' },
  subText: { fontSize: 12, color: '#6b7280' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  gridItem: { width: '48%', backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 10, alignItems: 'center', elevation: 2 },
  gridValue: { fontSize: 20, fontWeight: 'bold', color: '#047857' },
  gridLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  questsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },
  questRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db', marginRight: 12 },
  questTitle: { flex: 1, fontSize: 14, color: '#374151' },
  questReward: { fontSize: 14, fontWeight: 'bold', color: '#059669' },
  footerNav: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 30 },
  navButton: { flex: 1, backgroundColor: '#10b981', padding: 14, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  navButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default GreenDashboard;
