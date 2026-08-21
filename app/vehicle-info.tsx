import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { getStoredUser } from './api';
import { Colors } from './src/constants/Colors';
import '../global.css';

export default function VehicleInfo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredUser().then(u => { setUser(u); setLoading(false); });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background-main" edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-6 pb-5 z-50" style={{ paddingTop: Math.max(insets.top + 8, 20), backgroundColor: Colors.primary.darkGreen, paddingBottom: 16 }}>
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

            <SectionTitle title="Vehicle Details" />
            <InfoCard label="Vehicle Brand" value={user?.vehicle_brand} icon="truck" />
            <InfoCard label="Vehicle Model" value={user?.vehicle_model} icon="settings" />
            <InfoCard label="Vehicle Number" value={user?.vehicle_number} icon="hash" />
            <InfoCard label="Vehicle Color" value={user?.vehicle_color} icon="droplet" />

            <SectionTitle title="License" />
            <InfoCard label="License Number" value={user?.license_number} icon="credit-card" />
            <InfoCard label="License Holder Name" value={user?.license_holder_name} icon="user" />
            <InfoCard label="License Issue Date" value={user?.license_issue_date} icon="calendar" />
            <InfoCard label="License Expiry Date" value={user?.license_expiry_date} icon="alert-circle" />

            <SectionTitle title="RC & Insurance" />
            <InfoCard label="RC Book Number" value={user?.rc_book_number} icon="file-text" />
            <InfoCard label="Insurance Number" value={user?.insurance_number} icon="shield" />
            <InfoCard label="Insurance Expiry Date" value={user?.insurance_expiry_date} icon="alert-circle" />
            <InfoCard label="Pollution Certificate No." value={user?.pollution_certificate_number} icon="wind" />

            <SectionTitle title="Delivery Preferences" />
            <InfoCard label="Preferred Distance" value={user?.preferred_distance} icon="map" />
            <InfoCard label="Delivery Radius" value={user?.delivery_radius} icon="navigation" />
            <InfoCard label="Driving Experience" value={user?.driving_experience} icon="award" />
            <InfoCard label="Available Areas" value={user?.available_areas} icon="map-pin" />
            <InfoCard label="Online Status" value={user?.online_status} icon="wifi" />
            <InfoCard label="Current Location" value={user?.current_location} icon="navigation" />
            <InfoCard label="Shift Timing" value={user?.shift_timing} icon="clock" />
            <InfoCard label="Working Days" value={user?.working_days} icon="calendar" />

            <SectionTitle title="Available Times" />
            <BoolCard label="Morning" value={user?.available_time_morning} />
            <BoolCard label="Afternoon" value={user?.available_time_afternoon} />
            <BoolCard label="Evening" value={user?.available_time_evening} />
            <BoolCard label="Night" value={user?.available_time_night} />

          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text className="text-primary-darkGreen font-bold text-xs uppercase tracking-widest mb-3 mt-5">{title}</Text>;
}

function InfoCard({ label, value, icon }: any) {
  return (
    <View className="bg-white rounded-2xl px-5 py-4 mb-3 border border-gray-100 shadow-sm">
      <View className="flex-row items-center mb-1">
        <Feather name={icon} size={13} color={Colors.text.muted} />
        <Text className="text-gray-400 text-xs font-semibold ml-2">{label}</Text>
      </View>
      <Text className="text-black font-semibold text-sm mt-0.5">{value || '—'}</Text>
    </View>
  );
}

function BoolCard({ label, value }: any) {
  const active = value === 1 || value === true || value === '1';
  return (
    <View className="bg-white rounded-2xl px-5 py-4 mb-3 border border-gray-100 shadow-sm flex-row justify-between items-center">
      <Text className="text-gray-700 font-semibold text-sm">{label}</Text>
      <View className={`px-3 py-1 rounded-full ${active ? 'bg-primary-lightGreen' : 'bg-gray-100'}`}>
        <Text className={`text-xs font-bold ${active ? 'text-primary-brandGreen' : 'text-gray-400'}`}>
          {active ? 'Available' : 'Not Available'}
        </Text>
      </View>
    </View>
  );
}
