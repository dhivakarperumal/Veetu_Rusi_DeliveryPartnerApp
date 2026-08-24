import { Feather, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import "../global.css";
import { Colors } from "../src/constants/Colors";

export default function OrderDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      className="flex-1 bg-background-main"
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header for Order Details */}
      <View className="px-6 pt-4 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <View>
            <Text className="text-black font-bold text-lg">Order Details</Text>
            <Text className="text-gray-500 font-semibold text-sm">
              #ORD123456
            </Text>
          </View>
        </View>
        <View className="bg-background-lightBeige px-4 py-1.5 rounded-xl">
          <Text className="text-accent-orange font-bold text-sm">New</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 mt-4 space-y-4">
          {/* Pickup Location Card */}
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
            <Text className="text-gray-500 text-xs font-semibold mb-3">
              Pickup Location
            </Text>
            <View className="flex-row items-start justify-between">
              <View className="flex-row flex-1">
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={Colors.primary.brandGreen}
                  className="mt-0.5"
                />
                <View className="ml-3 flex-1 pr-4">
                  <Text className="font-bold text-black text-sm">
                    Anna Nagar, Chennai
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1 leading-relaxed">
                    12, 4th Avenue, Anna Nagar,{"\n"}Chennai - 600040
                  </Text>
                </View>
              </View>
              <TouchableOpacity className="w-10 h-10 rounded-full bg-background-lightBeige items-center justify-center">
                <Feather name="phone" size={18} color={Colors.accent.orange} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Drop Location Card */}
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
            <Text className="text-gray-500 text-xs font-semibold mb-3">
              Drop Location
            </Text>
            <View className="flex-row items-start justify-between">
              <View className="flex-row flex-1">
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={Colors.status.error}
                  className="mt-0.5"
                />
                <View className="ml-3 flex-1 pr-4">
                  <Text className="font-bold text-black text-sm">
                    T. Nagar, Chennai
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1 leading-relaxed">
                    23, Rangan Street, T. Nagar,{"\n"}Chennai - 600017
                  </Text>
                </View>
              </View>
              <TouchableOpacity className="w-10 h-10 rounded-full bg-background-lightBeige items-center justify-center">
                <Feather name="phone" size={18} color={Colors.accent.orange} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Order Info Section */}
          <View className="mt-6 mb-8">
            <Text className="font-bold text-black text-sm mb-4">
              Order Info
            </Text>

            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600 text-xs font-medium">
                Parcel / Document
              </Text>
              <Text className="text-black text-xs font-semibold">
                Small Box
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600 text-xs font-medium">
                Order Weight
              </Text>
              <Text className="text-black text-xs font-semibold">1.2 kg</Text>
            </View>

            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-gray-600 text-xs font-medium">Payment</Text>
              <Text className="text-primary-brandGreen text-xs font-bold">
                Prepaid Online
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-4">
              <Text className="text-gray-600 text-xs font-medium">
                Order Amount
              </Text>
              <Text className="text-black text-base font-extrabold">
                ₹75.00
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Accept Order Button */}
      <View
        className="px-6 bg-transparent"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <TouchableOpacity
          className="bg-primary-darkGreen w-full py-4 rounded-xl items-center shadow-md"
          onPress={() => router.push("/track-order")}
        >
          <Text className="text-white font-bold text-base">Accept Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
