import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BottomBar() {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      className="absolute bottom-0 left-0 right-0 bg-white pt-4 px-8 flex-row justify-between items-center border-t border-gray-100 rounded-t-3xl shadow-lg"
      style={{ paddingBottom: Math.max(insets.bottom, 24) }}
    >
      <TouchableOpacity className="items-center">
        <Ionicons name="home" size={24} color="#304B26" style={{ marginBottom: 4 }} />
        <Text className="text-[10px] font-bold text-[#304B26]">Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity className="items-center">
        <Feather name="plus-square" size={24} color="#8F8F8F" style={{ marginBottom: 4 }} />
        <Text className="text-[10px] font-semibold text-gray-400">Orders</Text>
      </TouchableOpacity>
      
      <TouchableOpacity className="items-center">
        <Feather name="shopping-bag" size={24} color="#8F8F8F" style={{ marginBottom: 4 }} />
        <Text className="text-[10px] font-semibold text-gray-400">Earnings</Text>
      </TouchableOpacity>
      
      <TouchableOpacity className="items-center">
        <Feather name="user" size={24} color="#8F8F8F" style={{ marginBottom: 4 }} />
        <Text className="text-[10px] font-semibold text-gray-400">Profile</Text>
      </TouchableOpacity>
    </View>
  );
}
