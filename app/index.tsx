import { Colors } from './src/constants/Colors';
import { ScrollView, Text, View, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import BottomBar from "./src/Buttombar/BottomBar";
import TopHeader from "./src/TopHeader/TopHeader";
import "../global.css";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-background-main">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <TopHeader />

        {/* Location Selector */}
        <View className="px-6 mt-4">
          <View className="bg-primary-darkGreen rounded-2xl flex-row items-center px-4 py-3 justify-between">
            <View className="flex-row items-center">
              <View className="bg-white rounded-full p-1.5 mr-3">
                <Ionicons name="location-sharp" size={16} color={Colors.primary.darkGreen} />
              </View>
              <View>
                <Text className="text-white/80 text-xs">Current Location</Text>
                <Text className="text-white font-semibold text-sm">Anna Nagar, Chennai</Text>
              </View>
            </View>
            <Feather name="chevron-down" size={20} color="white" />
          </View>
        </View>

        {/* Banner Section */}
        <View className="px-6 mt-6">
          <View className="bg-background-beige rounded-3xl p-5 relative overflow-hidden">
            <View className="w-2/3 z-10">
              <Text className="text-2xl font-extrabold text-black leading-tight">
                Deliver Fast.{"\n"}Earn More.
              </Text>
              <Text className="text-gray-500 text-xs mt-2 w-32">
                Be the reason someone smiles today!
              </Text>
              <TouchableOpacity className="bg-accent-darkBrown mt-6 py-2.5 px-4 rounded-xl self-start">
                <Text className="text-white font-bold text-sm">Go Online</Text>
              </TouchableOpacity>
            </View>
            {/* Scooter image placeholder - in a real app this would be an actual image */}
            <View className="absolute -right-4 -bottom-4 w-44 h-44 bg-orange-200/50 rounded-full z-0 items-center justify-center">
              <Ionicons name="bicycle" size={80} color={Colors.accent.orange} />
            </View>
          </View>
        </View>

        {/* Available Orders Header */}
        <View className="px-6 mt-8 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-black">Available Orders</Text>
          <TouchableOpacity>
            <Text className="text-accent-darkBrown font-semibold text-sm">View All &gt;</Text>
          </TouchableOpacity>
        </View>

        {/* Order Cards */}
        <View className="px-6 mt-4 space-y-4 pb-24">
          <OrderCard 
            id="#ORD123456"
            price="75.00"
            distance="2.4 km"
            time="15 mins"
            pickup="Anna Nagar, Chennai"
            drop="T. Nagar, Chennai"
          />
          <OrderCard 
            id="#ORD123457"
            price="60.00"
            distance="3.1 km"
            time="18 mins"
            pickup="Villivakkam, Chennai"
            drop="Purasawalkam, Chennai"
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomBar />
    </SafeAreaView>
  );
}

function OrderCard({ id, price, distance, time, pickup, drop }: any) {
  return (
    <View className="bg-white rounded-3xl p-4 shadow-sm border border-gray-50 mb-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-bold text-black text-base">{id}</Text>
        <View className="bg-primary-lightGreen px-3 py-1 rounded-lg border border-primary-lightGreen">
          <Text className="text-primary-brandGreen font-bold">₹{price}</Text>
        </View>
      </View>

      <View className="flex-row items-center mb-3">
        <View className="w-3 h-3 rounded-full bg-primary-brandGreen border-[3px] border-primary-lightGreen" />
        <Text className="text-gray-500 text-xs ml-3 font-medium">{distance} • {time}</Text>
      </View>

      <View className="flex-row items-center mb-2">
        <View className="w-2.5 h-2.5 rounded-full bg-red-500 ml-[1px]" />
        <Text className="text-gray-600 text-sm ml-3.5">{pickup}</Text>
      </View>

      <View className="flex-row items-center justify-between mt-2">
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full bg-red-500 ml-[1px]" />
          <Text className="text-gray-600 text-sm ml-3.5">{drop}</Text>
        </View>
        <TouchableOpacity className="bg-primary-darkGreen px-6 py-2.5 rounded-xl">
          <Text className="text-white font-bold text-sm">Accept</Text>
        </TouchableOpacity>
      </View>
      
      {/* Dashed line connecting dots */}
      <View className="absolute left-[21px] top-[74px] w-0.5 h-8 border-l border-dashed border-gray-300" />
    </View>
  );

}
