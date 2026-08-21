import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { getStoredUser } from './api';
import { Colors } from './src/constants/Colors';
import '../global.css';

export default function BankDetails() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredUser().then(u => { setUser(u); setLoading(false); });
  }, []);

  const bank = user?.bankDetails || user?.bank || {};

  return (
    <SafeAreaView className="flex-1 bg-background-main" edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-6 pb-5 z-50" style={{ paddingTop: 52, backgroundColor: Colors.primary.darkGreen }}>
        <View className="flex-row items-center mt-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Bank Details</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary.darkGreen} />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 mt-6 pb-10">

            {/* Bank Card */}
            <View className="bg-primary-darkGreen rounded-3xl px-6 py-6 mb-6 shadow-md">
              <Text className="text-white/70 text-xs font-semibold mb-1">Account Holder</Text>
              <Text className="text-white font-bold text-lg mb-4">{bank?.accountName || user?.name || '—'}</Text>
              <Text className="text-white/70 text-xs font-semibold mb-1">Account Number</Text>
              <Text className="text-white font-bold text-base tracking-widest">
                {bank?.accountNumber ? `**** **** ${String(bank.accountNumber).slice(-4)}` : '—'}
              </Text>
            </View>

            <InfoCard label="Bank Name" value={bank?.bankName || '—'} icon="home" />
            <InfoCard label="Branch Name" value={bank?.branch || '—'} icon="map-pin" />
            <InfoCard label="IFSC Code" value={bank?.ifsc || '—'} icon="hash" />
            <InfoCard label="Account Type" value={bank?.accountType || 'Savings'} icon="credit-card" />
            <InfoCard label="UPI ID" value={user?.upiId || '—'} icon="smartphone" />

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
