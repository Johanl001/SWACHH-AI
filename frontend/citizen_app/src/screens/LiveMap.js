// SWACHH-AI — Citizen App
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import BottomSheet from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { db } from '../utils/firebase';
import { t } from '../utils/i18n';
import Geolocation from '@react-native-community/geolocation';

const LiveMap = () => {
  const [bins, setBins] = useState({});
  const [selectedBin, setSelectedBin] = useState(null);
  const [filter, setFilter] = useState('All');
  const [userLocation, setUserLocation] = useState(null);
  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Mock data for demo
    const mockBins = {
      1: { id: 1, lat: 18.5204, lng: 73.8567, fill_pct: 45, battery_v: 3.8, address: "Shivaji Nagar, Pune", updated_at: Date.now() },
      2: { id: 2, lat: 18.5254, lng: 73.8600, fill_pct: 85, battery_v: 3.2, address: "FC Road, Pune", updated_at: Date.now() },
      3: { id: 3, lat: 18.5300, lng: 73.8500, fill_pct: 65, battery_v: 3.9, address: "JM Road, Pune", updated_at: Date.now() },
    };
    setBins(mockBins);

    try {
      Geolocation.getCurrentPosition(
        info => setUserLocation({ lat: info.coords.latitude, lng: info.coords.longitude }),
        err => console.log(err),
        { enableHighAccuracy: true }
      );
    } catch (e) {
      console.log(e);
    }
  }, []);

  const getMarkerColor = (fill) => {
    if (fill === undefined) return 'gray';
    if (fill < 60) return 'green';
    if (fill <= 80) return 'gold';
    return 'red';
  };

  const handleMarkerPress = (bin) => {
    setSelectedBin(bin);
    bottomSheetRef.current?.expand();
  };

  const centerUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const openDirections = () => {
    if (selectedBin) {
      Linking.openURL(`google.navigation:q=${selectedBin.lat},${selectedBin.lng}`);
    }
  };

  const filteredBins = Object.values(bins).filter(bin => {
    if (filter === 'Critical') return bin.fill_pct > 80;
    return true; // All
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={[styles.filterBtn, filter === 'All' && styles.filterBtnActive]} onPress={() => setFilter('All')}>
          <Text style={[styles.filterText, filter === 'All' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, filter === 'Critical' && styles.filterBtnActive]} onPress={() => setFilter('Critical')}>
          <Text style={[styles.filterText, filter === 'Critical' && styles.filterTextActive]}>Critical</Text>
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 18.5204,
          longitude: 73.8567,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
      >
        {filteredBins.map(bin => (
          <Marker
            key={bin.id}
            coordinate={{ latitude: bin.lat, longitude: bin.lng }}
            pinColor={getMarkerColor(bin.fill_pct)}
            onPress={() => handleMarkerPress(bin)}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.myLocationBtn} onPress={centerUser}>
        <Icon name="crosshairs-gps" size={24} color="#000" />
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['30%', '40%']}
        enablePanDownToClose
      >
        {selectedBin && (
          <View style={styles.sheetContent}>
            <Text style={styles.binTitle}>Bin #{selectedBin.id}</Text>
            <Text style={styles.binAddress}>{selectedBin.address}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Fill Level</Text>
                <Text style={[styles.statValue, { color: getMarkerColor(selectedBin.fill_pct) }]}>{Math.round(selectedBin.fill_pct)}%</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Battery</Text>
                <Text style={styles.statValue}>{selectedBin.battery_v.toFixed(1)}V</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.navBtn} onPress={openDirections}>
                <Icon name="navigation" size={20} color="white" />
                <Text style={styles.navText}>{t('navigateToBin')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reportBtn}>
                <Icon name="alert" size={20} color="#dc2626" />
                <Text style={styles.reportText}>{t('reportProblem')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  header: { position: 'absolute', top: 40, left: 20, right: 20, flexDirection: 'row', zIndex: 1 },
  filterBtn: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, elevation: 4 },
  filterBtnActive: { backgroundColor: '#10b981' },
  filterText: { color: '#374151', fontWeight: 'bold' },
  filterTextActive: { color: 'white' },
  myLocationBtn: { position: 'absolute', bottom: 30, right: 20, backgroundColor: 'white', padding: 12, borderRadius: 30, elevation: 5 },
  sheetContent: { padding: 20 },
  binTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  binAddress: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  navBtn: { flex: 1, backgroundColor: '#2563eb', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 8, marginRight: 10 },
  navText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
  reportBtn: { flex: 1, backgroundColor: '#fee2e2', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 8 },
  reportText: { color: '#dc2626', fontWeight: 'bold', marginLeft: 8 }
});

export default LiveMap;
