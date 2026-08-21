import { Colors } from './src/constants/Colors';
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import '../global.css';

export default function TrackOrder() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-background-main" edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-6 pt-4 pb-4 flex-row items-center justify-between bg-white z-10 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <View>
            <Text className="text-black font-bold text-lg">Track Order</Text>
            <Text className="text-gray-500 font-semibold text-sm">#ORD123456</Text>
          </View>
        </View>
        <TouchableOpacity className="bg-background-lightBeige px-4 py-1.5 rounded-xl border border-background-darkBeige">
          <Text className="text-primary-darkGreen font-bold text-xs">HELP</Text>
        </TouchableOpacity>
      </View>

      {/* Map Area Mock */}
      <View className="flex-1 bg-background-map relative overflow-hidden">
        {/* Mock Map Background Grid */}
        <View className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <View key={i} className="absolute bg-primary-mutedGreen" style={{
              width: Math.random() * 80 + 20,
              height: Math.random() * 60 + 20,
              top: Math.random() * 600,
              left: Math.random() * 400,
              borderRadius: 4
            }} />
          ))}
        </View>
        
        {/* Mock Route Line */}
        <View className="absolute top-[20%] left-[20%] w-[60%] h-[40%] border-l-4 border-b-4 border-accent-brown opacity-80" style={{ transform: [{ skewY: '15deg' }] }} />
        
        {/* Mock Pins */}
        <View className="absolute top-[15%] left-[15%]">
          <Ionicons name="location" size={40} color={Colors.primary.brandGreen} />
        </View>
        <View className="absolute top-[60%] left-[75%]">
          <Ionicons name="location" size={40} color={Colors.status.error} />
        </View>

        {/* Floating Map Actions */}
        <View className="absolute right-4 top-[35%] space-y-4">
          <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg border border-gray-100">
            <MaterialIcons name="my-location" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg border border-gray-100 mt-4">
            <MaterialIcons name="center-focus-weak" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg border border-gray-100 mt-4">
            <Feather name="phone" size={20} color={Colors.accent.brown} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Information Card */}
      <View className="bg-white rounded-t-3xl px-6 pt-6 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] -mt-6">
        
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-black font-extrabold text-lg">Order in Progress</Text>
            <Text className="text-gray-500 font-medium text-xs mt-1">Estimated time</Text>
          </View>
          <Text className="text-primary-brandGreen font-extrabold text-base">15 mins</Text>
        </View>

        {/* Route Details */}
        <View className="mb-6">
          <View className="flex-row mb-4">
            <View className="items-center mr-4">
              <View className="w-5 h-5 rounded-full bg-primary-lightGreen items-center justify-center mb-1">
                <View className="w-2.5 h-2.5 rounded-full bg-primary-brandGreen" />
              </View>
              <View className="w-0.5 h-8 bg-gray-200" />
            </View>
            <View>
              <Text className="text-gray-500 text-[11px] font-semibold">Pickup</Text>
              <Text className="text-black font-bold text-sm mt-0.5">Anna Nagar, Chennai</Text>
            </View>
          </View>

          <View className="flex-row">
            <View className="items-center mr-4">
              <View className="w-5 h-5 rounded-full bg-status-errorLight items-center justify-center">
                <View className="w-2.5 h-2.5 rounded-full bg-status-error" />
              </View>
            </View>
            <View>
              <Text className="text-gray-500 text-[11px] font-semibold">Drop</Text>
              <Text className="text-black font-bold text-sm mt-0.5">T. Nagar, Chennai</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View 
          className="flex-row justify-between space-x-4"
          style={{ paddingBottom: Math.max(insets.bottom, 10) }}
        >
          <TouchableOpacity className="flex-1 bg-primary-darkGreen py-3.5 rounded-2xl flex-row items-center justify-center shadow-md">
            <Feather name="phone-call" size={18} color="white" className="mr-3" />
            <Text className="text-white font-bold text-sm ml-2">Contact Customer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="w-14 h-14 bg-white border border-gray-100 rounded-2xl items-center justify-center shadow-sm ml-4">
            <Feather name="phone" size={22} color={Colors.accent.brown} />
          </TouchableOpacity>
        </View>
        
      </View>

    </SafeAreaView>
  );
}
