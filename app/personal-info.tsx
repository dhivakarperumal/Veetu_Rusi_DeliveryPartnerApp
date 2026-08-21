import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { getStoredUser } from './api';
import { Colors } from './src/constants/Colors';
import '../global.css';

export default function PersonalInfo() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredUser().then(u => { setUser(u); setLoading(false); });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background-main" edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-6 pb-5 z-50" style={{ paddingTop: 52, backgroundColor: Colors.primary.darkGreen }}>
        <View className="flex-row items-center mt-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Personal Information</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary.darkGreen} />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 mt-6 pb-10">

            <InfoCard label="Full Name" value={user?.name || '—'} icon="user" />
            <InfoCard label="Email Address" value={user?.email || '—'} icon="mail" />
            <InfoCard label="Mobile Number" value={user?.phone || user?.mobile || '—'} icon="phone" />
            <InfoCard label="Date of Birth" value={user?.dob || '—'} icon="calendar" />
            <InfoCard label="Gender" value={user?.gender || '—'} icon="users" />
            <InfoCard label="Address" value={user?.address || '—'} icon="map-pin" />
            <InfoCard label="City" value={user?.city || '—'} icon="map" />
            <InfoCard label="Pincode" value={user?.pincode || '—'} icon="hash" />

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
