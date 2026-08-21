import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function TopHeader() {
  return (
    <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <TouchableOpacity>
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
        <View className="ml-4">
          <Text className="text-gray-500 text-xs font-medium">Good Morning,</Text>
          <Text className="text-black font-bold text-lg">Dhivakar 👋</Text>
        </View>
      </View>
      <TouchableOpacity>
        <Feather name="bell" size={24} color="#8D4925" />
        <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
      </TouchableOpacity>
    </View>
  );
}
