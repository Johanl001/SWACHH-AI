// SWACHH-AI — Citizen App
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Share } from 'react-native';
import { t } from '../utils/i18n';

const ProfileScreen = () => {
  const [demoMode, setDemoMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  
  const handleRefer = async () => {
    try {
      await Share.share({
        message: 'Join me on SWACHH-AI and earn Green Credits! Use my referral code: REF-DEMO-2026'
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>DU</Text></View>
        <Text style={styles.name}>Demo User</Text>
        <Text style={styles.city}>Pune • +91 9876543210</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>340</Text>
          <Text style={styles.statLabel}>Lifetime Credits</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>14</Text>
          <Text style={styles.statLabel}>Items Disposed</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>Silver</Text>
          <Text style={styles.statLabel}>Rank</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Demo Mode (No Network)</Text>
          <Switch value={demoMode} onValueChange={setDemoMode} trackColor={{ false: "#d1d5db", true: "#86efac" }} thumbColor={demoMode ? "#16a34a" : "#f3f4f6"} />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: "#d1d5db", true: "#86efac" }} thumbColor={notifications ? "#16a34a" : "#f3f4f6"} />
        </View>

        <TouchableOpacity style={styles.languageBtn}>
          <Text style={styles.settingLabel}>Language</Text>
          <Text style={styles.languageText}>English</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.referBtn} onPress={handleRefer}>
        <Text style={styles.referText}>Refer a Friend</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: 'white', padding: 30, alignItems: 'center', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  city: { fontSize: 14, color: '#6b7280', marginTop: 5 },
  statsRow: { flexDirection: 'row', backgroundColor: 'white', paddingVertical: 20, marginBottom: 20, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  statBox: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderColor: '#e5e7eb' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#047857' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  section: { backgroundColor: 'white', padding: 20, marginBottom: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 15 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  settingLabel: { fontSize: 16, color: '#4b5563' },
  languageBtn: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15 },
  languageText: { fontSize: 16, color: '#2563eb', fontWeight: 'bold' },
  referBtn: { backgroundColor: '#10b981', marginHorizontal: 20, padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  referText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { marginHorizontal: 20, padding: 15, borderRadius: 10, alignItems: 'center', backgroundColor: '#fee2e2' },
  logoutText: { color: '#dc2626', fontWeight: 'bold', fontSize: 16 }
});

export default ProfileScreen;
