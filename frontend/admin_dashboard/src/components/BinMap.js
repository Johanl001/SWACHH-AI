// SWACHH-AI — Admin Dashboard
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

'use client';

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const center = { lat: 18.5204, lng: 73.8567 };

const MOCK_BINS = [
  { id: 1, lat: 18.5204, lng: 73.8567, fill_pct: 45, battery_v: 3.8, address: "Central Depot Alpha" },
  { id: 2, lat: 18.5254, lng: 73.8600, fill_pct: 85, battery_v: 3.2, address: "Sector-7 Collection Point" },
  { id: 3, lat: 18.5300, lng: 73.8500, fill_pct: 65, battery_v: 3.9, address: "Processing Facility Omega" },
];

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];

export default function BinMap() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState(null);
  const [activeWindow, setActiveWindow] = useState(null);
  
  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const getMarkerIcon = (fill) => {
    let color = 'gray';
    if (fill !== undefined) {
      if (fill < 60) color = 'green';
      else if (fill <= 80) color = 'yellow';
      else color = 'red';
    }
    return `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
  };

  if (!isLoaded) return <div className="animate-pulse bg-dark-900 w-full h-full rounded shadow-inner"></div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={center}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{ styles: darkMapStyle }}
    >
      {MOCK_BINS.map((bin) => (
        <Marker
          key={bin.id}
          position={{ lat: bin.lat, lng: bin.lng }}
          icon={getMarkerIcon(bin.fill_pct)}
          onClick={() => setActiveWindow(bin.id)}
        >
          {activeWindow === bin.id && (
            <InfoWindow onCloseClick={() => setActiveWindow(null)}>
              <div className="p-2 min-w-[150px] text-black">
                <h3 className="font-bold border-b border-gray-200 pb-1 mb-2">Node #{bin.id}</h3>
                <p className="text-sm mb-1">📍 {bin.address}</p>
                <p className="text-sm"><span className="font-semibold text-emerald-600">Capacity:</span> {bin.fill_pct}%</p>
                <p className="text-sm"><span className="font-semibold text-violet-600">Bat LvL:</span> {bin.battery_v}V</p>
                <button className="mt-3 w-full bg-black text-emerald-400 border border-emerald-500/50 hover:bg-emerald-900/40 hover:text-white text-xs font-bold py-1.5 px-2 rounded transition-colors shadow">
                   Add to Matrix
                </button>
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  );
}
