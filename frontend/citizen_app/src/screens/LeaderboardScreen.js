// SWACHH-AI — Citizen App
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const MOCK_DATA = [
  { id: '1', name: 'Aarav Patel', credits: 4500, rank: 'Diamond' },
  { id: '2', name: 'Priya Sharma', credits: 4200, rank: 'Platinum' },
  { id: '3', name: 'Rohan Gupta', credits: 3900, rank: 'Platinum' },
  { id: '4', name: 'Demo User', credits: 340, rank: 'Silver', isMe: true },
  { id: '5', name: 'Sneha Deshmukh', credits: 320, rank: 'Silver' },
];

const LeaderboardScreen = () => {
  const [tab, setTab] = useState('City');

  const renderItem = ({ item, index }) => {
    return (
      <View style={[styles.row, item.isMe && styles.myRow]}>
        <Text style={styles.rankNum}>{index + 1}</Text>
        <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.charAt(0)}</Text></View>
        <View style={styles.info}>
           <Text style={[styles.name, item.isMe && styles.myText]}>{item.name}</Text>
           <Text style={styles.rankBadge}>{item.rank}</Text>
        </View>
        <Text style={[styles.credits, item.isMe && styles.myText]}>{item.credits} 🌿</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {['City', 'Neighbourhood', 'Friends'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.activeTab]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.podium}>
         <Text style={styles.podiumText}>Top 3</Text>
         <View style={styles.podiumRow}>
           <View style={[styles.podiumBox, {height: 80, backgroundColor: '#C0C0C0'}]}><Text>2nd</Text></View>
           <View style={[styles.podiumBox, {height: 120, backgroundColor: '#FFD700'}]}><Text>1st</Text></View>
           <View style={[styles.podiumBox, {height: 60, backgroundColor: '#CD7F32'}]}><Text>3rd</Text></View>
         </View>
      </View>

      <FlatList
        data={MOCK_DATA}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  tabs: { flexDirection: 'row', backgroundColor: 'white', elevation: 2 },
  tab: { flex: 1, padding: 15, alignItems: 'center', borderBottomWidth: 3, borderColor: 'transparent' },
  activeTab: { borderColor: '#10b981' },
  tabText: { color: '#6b7280', fontWeight: 'bold' },
  activeTabText: { color: '#10b981' },
  podium: { backgroundColor: 'white', padding: 20, alignItems: 'center', marginBottom: 10 },
  podiumText: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  podiumRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 10 },
  podiumBox: { width: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  list: { padding: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 8 },
  myRow: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#86efac' },
  rankNum: { width: 30, fontSize: 16, fontWeight: 'bold', color: '#6b7280' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#9ca3af' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  myText: { color: '#166534' },
  rankBadge: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  credits: { fontSize: 16, fontWeight: 'bold', color: '#047857' }
});

export default LeaderboardScreen;
