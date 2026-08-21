import { Colors } from './src/constants/Colors';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import BottomBar from './src/Buttombar/BottomBar';
import TopHeader from './src/TopHeader/TopHeader';
import { getStoredUser, logoutUser } from './api';
import '../global.css';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await getStoredUser();
      setUser(storedUser);
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/src/Auth/LoginScreen');
  };

  const firstLetter = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayPhone = user?.phone || user?.mobile || '—';

  return (
    <SafeAreaView className="flex-1 bg-background-main" edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Fixed Header */}
      <TopHeader title="My Profile" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {loading ? (
          <View className="items-center justify-center mt-20">
            <ActivityIndicator size="large" color={Colors.primary.darkGreen} />
          </View>
        ) : (
          <>
            {/* Profile Avatar & Info */}
            <View className="items-center mt-8 mb-6">
              <View className="relative">
                {/* Avatar Circle with first letter */}
                <View className="w-28 h-28 rounded-full bg-primary-darkGreen items-center justify-center border-4 border-primary-lightGreen shadow-sm">
                  <Text className="text-white font-extrabold text-4xl">{firstLetter}</Text>
                </View>
                <TouchableOpacity className="absolute bottom-0 right-0 bg-white w-9 h-9 rounded-full items-center justify-center border border-gray-200 shadow-sm">
                  <Feather name="edit-2" size={15} color={Colors.accent.brown} />
                </TouchableOpacity>
              </View>

              <Text className="text-black font-bold text-xl mt-4">{displayName}</Text>
              <Text className="text-gray-500 font-medium mt-1 text-sm">{displayPhone}</Text>

              {/* Role Badge */}
              <View className="bg-primary-lightGreen px-4 py-1 rounded-full mt-2">
                <Text className="text-primary-darkGreen font-semibold text-xs">
                  Delivery Partner
                </Text>
              </View>
            </View>

            {/* Info Card */}
            {user?.email && (
              <View className="mx-6 mb-6 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
                <View className="flex-row items-center">
                  <Feather name="mail" size={16} color={Colors.text.muted} />
                  <Text className="text-gray-500 text-xs ml-2">Email</Text>
                </View>
                <Text className="text-black font-semibold text-sm mt-1">{user.email}</Text>
              </View>
            )}

            {/* Menu Options */}
            <View className="px-6 pb-24">
              <MenuItem icon="user" label="Personal Information" onPress={() => router.push('/personal-info')} />
              <MenuItem icon="car" iconFamily="Ionicons" label="Vehicle Information" onPress={() => router.push('/vehicle-info')} />
              <MenuItem icon="file-text" label="Documents" onPress={() => router.push('/documents')} />
              <MenuItem icon="bank-outline" iconFamily="MaterialCommunityIcons" label="Bank Details" onPress={() => router.push('/bank-details')} />
              <MenuItem icon="bell" label="Notifications" onPress={() => {}} />
              <MenuItem icon="clock" label="Help & Support" onPress={() => router.push('/helpsupport')} />

              <TouchableOpacity
                className="flex-row items-center py-4 px-2 mt-2"
                onPress={handleLogout}
              >
                <Feather name="log-out" size={22} color={Colors.status.error} />
                <Text className="ml-4 text-status-error font-semibold text-[15px]">Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <BottomBar activeTab="profile" />
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, iconFamily = 'Feather', onPress }: any) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4 px-2 border-b border-gray-100"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {iconFamily === 'Feather' && <Feather name={icon} size={22} color={Colors.text.primary} />}
        {iconFamily === 'Ionicons' && <Ionicons name={`${icon}-outline`} size={22} color={Colors.text.primary} />}
        {iconFamily === 'MaterialCommunityIcons' && <MaterialCommunityIcons name={icon} size={22} color={Colors.text.primary} />}
        <Text className="ml-4 text-gray-800 font-semibold text-[15px]">{label}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={Colors.text.muted} />
    </TouchableOpacity>
  );
}
