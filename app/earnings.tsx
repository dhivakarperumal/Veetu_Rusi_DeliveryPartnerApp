import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import BottomBar from "./src/Buttombar/BottomBar";
import "../global.css";

export default function Earnings() {
  const chartData = [
    { day: "Mon", value: 320 },
    { day: "Tue", value: 280 },
    { day: "Wed", value: 400 },
    { day: "Thu", value: 360 },
    { day: "Fri", value: 550 },
    { day: "Sat", value: 470 },
    { day: "Sun", value: 400 },
  ];
  
  const maxVal = 550;
  const maxBarHeight = 120;

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-2">
          <Text className="text-black font-extrabold text-2xl">My Earnings</Text>
        </View>

        <View className="px-6 mt-2 pb-24">
          
          {/* Date Selector */}
          <TouchableOpacity className="flex-row items-center mb-4 self-start">
            <Text className="text-gray-700 font-semibold text-sm mr-1">12 May - 18 May</Text>
            <Feather name="chevron-down" size={16} color="#4A4A4A" />
          </TouchableOpacity>

          {/* Total Earnings Card */}
          <View className="bg-[#304B26] rounded-3xl p-6 mb-4 flex-row justify-between items-center shadow-md">
            <View>
              <Text className="text-white/80 font-medium text-xs mb-1">Total Earnings</Text>
              <Text className="text-white font-extrabold text-3xl">₹2,650.00</Text>
            </View>
            <View className="border border-[#DC9441] rounded-xl p-3 bg-[#426136]">
              <Feather name="briefcase" size={28} color="#DC9441" />
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row justify-between mb-8 space-x-2">
            <View className="flex-1 bg-white p-3 rounded-2xl items-center border border-gray-100 shadow-sm">
              <Text className="text-gray-500 text-[10px] font-semibold mb-1">Orders</Text>
              <Text className="text-black font-bold text-lg">32</Text>
            </View>
            <View className="flex-1 bg-white p-3 rounded-2xl items-center border border-gray-100 shadow-sm ml-2">
              <Text className="text-gray-500 text-[10px] font-semibold mb-1">Online Hours</Text>
              <Text className="text-black font-bold text-lg">18h 40m</Text>
            </View>
            <View className="flex-1 bg-white p-3 rounded-2xl items-center border border-gray-100 shadow-sm ml-2">
              <Text className="text-gray-500 text-[10px] font-semibold mb-1">Incentives</Text>
              <Text className="text-black font-bold text-lg">₹350</Text>
            </View>
          </View>

          {/* Earnings Summary Chart */}
          <Text className="text-black font-bold text-base mb-6">Earnings Summary</Text>
          <View className="flex-row justify-between items-end h-[160px] mb-8 bg-white p-4 rounded-3xl border border-gray-50 shadow-sm">
            {chartData.map((item, index) => {
              const height = (item.value / maxVal) * maxBarHeight;
              return (
                <View key={index} className="items-center w-8">
                  <Text className="text-[10px] font-bold text-gray-700 mb-2">₹{item.value}</Text>
                  <View 
                    className="w-6 bg-[#8FA759] rounded-md"
                    style={{ height }}
                  />
                  <Text className="text-[10px] font-medium text-gray-500 mt-2">{item.day}</Text>
                </View>
              );
            })}
          </View>

          {/* Payout History */}
          <Text className="text-black font-bold text-base mb-4">Payout History</Text>
          <View className="flex-row justify-between space-x-2 mb-4">
            <TouchableOpacity className="flex-1 flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <Feather name="chevron-right" size={16} color="#A0A0A0" className="mr-2" />
              <View className="ml-2">
                <Text className="text-black font-bold text-lg">₹2,300</Text>
                <Text className="text-gray-400 text-xs mt-0.5">Paid on 12 May</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm ml-3">
              <Feather name="chevron-right" size={16} color="#A0A0A0" className="mr-2" />
              <View className="ml-2">
                <Text className="text-black font-bold text-lg">₹2,250</Text>
                <Text className="text-gray-400 text-xs mt-0.5">Paid on 5 May</Text>
              </View>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomBar activeTab="earnings" />
    </SafeAreaView>
  );
}
