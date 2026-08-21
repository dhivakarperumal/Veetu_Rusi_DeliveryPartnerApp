import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { getStoredUser } from './api';
import { Colors } from './src/constants/Colors';
import '../global.css';

export default function Documents() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredUser().then(u => { setUser(u); setLoading(false); });
  }, []);

  const docs = user?.documents || {};

  return (
    <SafeAreaView className="flex-1 bg-background-main" edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-6 pb-5 z-50" style={{ paddingTop: 52, backgroundColor: Colors.primary.darkGreen }}>
        <View className="flex-row items-center mt-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Documents</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary.darkGreen} />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 mt-6 pb-10">

            <DocCard label="Aadhar Card" number={docs?.aadhar || user?.aadharNumber || '—'} status={docs?.aadharStatus || 'Pending'} />
            <DocCard label="PAN Card" number={docs?.pan || user?.panNumber || '—'} status={docs?.panStatus || 'Pending'} />
            <DocCard label="Driving License" number={docs?.license || user?.licenseNumber || '—'} status={docs?.licenseStatus || 'Pending'} />
            <DocCard label="Passport" number={docs?.passport || user?.passportNumber || '—'} status={docs?.passportStatus || 'Not Uploaded'} />

          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function DocCard({ label, number, status }: any) {
  const isVerified = status === 'Verified' || status === 'Approved';
  const isPending = status === 'Pending';

  return (
    <View className="bg-white rounded-2xl px-5 py-4 mb-4 border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Feather name="file-text" size={14} color={Colors.text.muted} />
            <Text className="text-gray-400 text-xs font-semibold ml-2">{label}</Text>
          </View>
          <Text className="text-black font-semibold text-sm mt-0.5">{number}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${isVerified ? 'bg-primary-lightGreen' : isPending ? 'bg-yellow-50' : 'bg-gray-100'}`}>
          <Text className={`text-xs font-bold ${isVerified ? 'text-primary-brandGreen' : isPending ? 'text-yellow-600' : 'text-gray-500'}`}>
            {status}
          </Text>
        </View>
      </View>
    </View>
  );
}
