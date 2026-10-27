import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#32A041' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Catálogo',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="leaf" size={24} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map" size={24} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Leitor QR',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="qrcode-scan" size={24} color={color as string} />,
        }}
      />
    </Tabs>
  );
}
