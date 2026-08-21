import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import BottomBar from './src/Buttombar/BottomBar';
import '../global.css';

export default function Profile() {
  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
          <Text className="text-black font-extrabold text-2xl">My Profile</Text>
          <TouchableOpacity>
            <Feather name="settings" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View className="items-center mt-6 mb-8">
          <View className="relative">
            {/* Mocking the avatar with a View since we don't have the image asset */}
            <View className="w-28 h-28 bg-[#F4E3C5] rounded-full items-center justify-center border-4 border-white shadow-sm overflow-hidden">
              <Ionicons name="person" size={60} color="#D3A766" className="mt-4" />
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 bg-white w-8 h-8 rounded-full items-center justify-center border border-gray-200 shadow-sm">
              <Feather name="edit-2" size={14} color="#8D4925" />
            </TouchableOpacity>
          </View>
          <Text className="text-black font-bold text-xl mt-4">Dhivakar P</Text>
          <Text className="text-gray-500 font-medium mt-1">+91 12345 67890</Text>
        </View>

        {/* Menu Options */}
        <View className="px-6 pb-24">
          <MenuItem icon="user" label="Personal Information" />
          <MenuItem icon="car" iconFamily="Ionicons" label="Vehicle Information" />
          <MenuItem icon="file-text" label="Documents" />
          <MenuItem icon="bank-outline" iconFamily="MaterialCommunityIcons" label="Bank Details" />
          <MenuItem icon="bell" label="Notifications" />
          <MenuItem icon="clock" label="Help & Support" />
          
          <TouchableOpacity className="flex-row items-center py-4 px-2 mt-2">
            <Feather name="log-out" size={22} color="#E53935" />
            <Text className="ml-4 text-[#E53935] font-semibold text-[15px]">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomBar activeTab="profile" />
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, iconFamily = 'Feather' }: any) {
  return (
    <TouchableOpacity className="flex-row items-center justify-between py-4 px-2 border-b border-gray-100">
      <View className="flex-row items-center">
        {iconFamily === 'Feather' && <Feather name={icon} size={22} color="#1A1A1A" />}
        {iconFamily === 'Ionicons' && <Ionicons name={`${icon}-outline`} size={22} color="#1A1A1A" />}
        {iconFamily === 'MaterialCommunityIcons' && <MaterialCommunityIcons name={icon} size={22} color="#1A1A1A" />}
        <Text className="ml-4 text-gray-800 font-semibold text-[15px]">{label}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#BDBDBD" />
    </TouchableOpacity>
  );
}
