// SWACHH-AI — Citizen App
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MOCK_HISTORY = [
  { id: '1', type: 'earn', title: 'Plastic Bottle', amount: 25, date: '2026-03-24', icon: 'bottle-wine' },
  { id: '2', type: 'earn', title: 'Cardboard Box', amount: 15, date: '2026-03-23', icon: 'package' },
  { id: '3', type: 'redeem', title: 'DTC Metro Top-up', amount: -150, date: '2026-03-20', icon: 'ticket' },
];

const HistoryScreen = () => {
  const [filter, setFilter] = useState('All');

  const handleExport = async () => {
    try {
      await Share.open({
        message: "SWACHH-AI History Export: \n\n" + MOCK_HISTORY.map(h => `${h.date}: ${h.title} [${h.amount > 0 ? '+' : ''}${h.amount}]`).join('\n')
      });
    } catch (e) {
      console.log(e);
    }
  };

  const filtered = MOCK_HISTORY.filter(h => {
    if (filter === 'Earned') return h.type === 'earn';
    if (filter === 'Redeemed') return h.type === 'redeem';
    return true;
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: item.amount > 0 ? '#dcfce7' : '#fee2e2' }]}>
        <Icon name={item.icon} size={24} color={item.amount > 0 ? '#15803d' : '#dc2626'} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={[styles.amount, { color: item.amount > 0 ? '#059669' : '#dc2626' }]}>
        {item.amount > 0 ? '+' : ''}{item.amount}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.filters}>
          {['All', 'Earned', 'Redeemed'].map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterBtn, filter === f && styles.filterBtnActive]}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Icon name="file-pdf-box" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'white', elevation: 2 },
  filters: { flexDirection: 'row', gap: 10 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: '#f3f4f6' },
  filterBtnActive: { backgroundColor: '#10b981' },
  filterText: { color: '#4b5563', fontSize: 12 },
  filterTextActive: { color: 'white', fontWeight: 'bold' },
  exportBtn: { padding: 5 },
  list: { padding: 15 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  date: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  amount: { fontSize: 18, fontWeight: 'bold' }
});

export default HistoryScreen;
