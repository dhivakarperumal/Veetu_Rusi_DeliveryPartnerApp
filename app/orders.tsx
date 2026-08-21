import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import BottomBar from "./src/Buttombar/BottomBar";
import TopHeader from "./src/TopHeader/TopHeader";
import "../global.css";

export default function Orders() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F9F9F9]" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <TopHeader title="My Orders" showBack />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Tab Selector */}
        <View className="px-6 mt-2 mb-6 flex-row justify-between space-x-2">
          <TouchableOpacity className="flex-1 bg-[#304B26] py-3 rounded-xl items-center shadow-sm">
            <Text className="text-white font-bold text-xs">New (3)</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-white border border-gray-100 py-3 rounded-xl items-center ml-2 shadow-sm">
            <Text className="text-gray-500 font-semibold text-xs">In Progress (2)</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-white border border-gray-100 py-3 rounded-xl items-center ml-2 shadow-sm">
            <Text className="text-gray-500 font-semibold text-xs">Completed</Text>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        <View className="px-6 space-y-4 pb-24">
          <OrderDetailsCard 
            id="#ORD123456"
            time="Today, 10:30 AM"
            price="75.00"
            pickup="Anna Nagar, Chennai"
            drop="T. Nagar, Chennai"
          />
          <OrderDetailsCard 
            id="#ORD123457"
            time="Today, 11:15 AM"
            price="60.00"
            pickup="Villivakkam, Chennai"
            drop="Purasawalkam, Chennai"
          />
          <OrderDetailsCard 
            id="#ORD123458"
            time="Today, 12:05 PM"
            price="80.00"
            pickup="Kodambakkam, Chennai"
            drop="Vadapalani, Chennai"
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomBar activeTab="orders" />
    </SafeAreaView>
  );
}

function OrderDetailsCard({ id, time, price, pickup, drop }: any) {
  const router = useRouter();
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => router.push('/order-details')}
      className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 mb-4"
    >
      {/* Header Row */}
      <View className="flex-row justify-between items-center mb-5">
        <Text className="font-bold text-black text-sm">{id}</Text>
        <View className="flex-row items-center">
          <Text className="text-gray-400 text-xs font-medium mr-3">{time}</Text>
          <View className="bg-[#FDF6E7] px-3 py-1 rounded-lg">
            <Text className="text-[#AF6333] font-bold text-xs">New</Text>
          </View>
        </View>
      </View>

      {/* Locations */}
      <View className="mb-4">
        <View className="flex-row items-center mb-3">
          <View className="w-2.5 h-2.5 rounded-full bg-[#217032] border-2 border-[#EBF7EB] ml-[1px]" />
          <Text className="text-gray-600 text-sm ml-3.5">{pickup}</Text>
        </View>

        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full bg-red-500 ml-[1px]" />
          <Text className="text-gray-600 text-sm ml-3.5">{drop}</Text>
        </View>
        
        {/* Dashed line connecting dots */}
        <View className="absolute left-[5px] top-[14px] w-0.5 h-5 border-l border-dashed border-gray-300" />
      </View>

      {/* Footer Row */}
      <View className="flex-row justify-between items-center mt-2">
        <Text className="font-extrabold text-black text-xl">₹{price}</Text>
        <TouchableOpacity className="bg-[#304B26] px-8 py-2.5 rounded-xl">
          <Text className="text-white font-bold text-sm">Accept</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
