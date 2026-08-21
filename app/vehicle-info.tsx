import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { getStoredUser } from './api';
import { Colors } from './src/constants/Colors';
import '../global.css';

export default function VehicleInfo() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredUser().then(u => { setUser(u); setLoading(false); });
  }, []);

  const vehicle = user?.vehicle || {};

  return (
    <SafeAreaView className="flex-1 bg-background-main" edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-6 pb-5 z-50" style={{ paddingTop: 52, backgroundColor: Colors.primary.darkGreen }}>
        <View className="flex-row items-center mt-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Vehicle Information</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary.darkGreen} />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 mt-6 pb-10">

            <InfoCard label="Vehicle Type" value={vehicle?.type || user?.vehicleType || '—'} icon="truck" />
            <InfoCard label="Vehicle Number" value={vehicle?.number || user?.vehicleNumber || '—'} icon="hash" />
            <InfoCard label="Vehicle Model" value={vehicle?.model || user?.vehicleModel || '—'} icon="settings" />
            <InfoCard label="Vehicle Color" value={vehicle?.color || user?.vehicleColor || '—'} icon="droplet" />
            <InfoCard label="RC Number" value={vehicle?.rc || user?.rcNumber || '—'} icon="file-text" />
            <InfoCard label="Insurance Number" value={vehicle?.insurance || user?.insuranceNumber || '—'} icon="shield" />

          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function InfoCard({ label, value, icon }: any) {
  return (
    <View className="bg-white rounded-2xl px-5 py-4 mb-4 border border-gray-100 shadow-sm">
      <View className="flex-row items-center mb-1">
        <Feather name={icon} size={14} color={Colors.text.muted} />
        <Text className="text-gray-400 text-xs font-semibold ml-2">{label}</Text>
      </View>
      <Text className="text-black font-semibold text-sm mt-0.5">{value}</Text>
    </View>
  );
}
