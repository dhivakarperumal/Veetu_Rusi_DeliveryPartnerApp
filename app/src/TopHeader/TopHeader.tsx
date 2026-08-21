import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";

type TopHeaderProps = {
  title?: string;
  showBack?: boolean;
};

export default function TopHeader({ title, showBack }: TopHeaderProps) {
  const router = useRouter();
  const userName = "Dhivakar";
  const firstLetter = userName.charAt(0).toUpperCase();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  return (
    <View className="px-6 pt-4 pb-4 flex-row items-center justify-between z-50">
      <View className="flex-row items-center">
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
        )}

        {title ? (
          <Text className="text-black font-bold text-lg">{title}</Text>
        ) : (
          <View>
            <Text className="text-gray-500 text-xs font-medium">
              Good Morning,
            </Text>
            <Text className="text-black font-bold text-lg">{userName} 👋</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center">
        {/* Notifications */}
        <View>
          <TouchableOpacity onPress={() => setShowNotifMenu(true)}>
            <Feather name="bell" size={24} color={Colors.accent.brown} />
            <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
          </TouchableOpacity>

          {/* Notifications Dropdown */}
          <Modal visible={showNotifMenu} transparent animationType="fade">
            <Pressable
              className="flex-1"
              onPress={() => setShowNotifMenu(false)}
            >
              <View className="absolute top-[80px] right-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64">
                <Text className="font-bold text-black mb-2">Notifications</Text>
                <View className="py-2 border-b border-gray-50">
                  <Text className="text-sm font-medium text-black">
                    New Order Alert
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    Order #12345 is ready for pickup
                  </Text>
                </View>
                <View className="py-2">
                  <Text className="text-sm font-medium text-black">
                    Earnings Updated
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    You earned ₹150 for your last trip.
                  </Text>
                </View>
              </View>
            </Pressable>
          </Modal>
        </View>

        {/* Profile Avatar */}
        <View className="ml-5">
          <TouchableOpacity
            onPress={() => setShowProfileMenu(true)}
            className="w-10 h-10 rounded-full bg-primary-darkGreen items-center justify-center border-2 border-primary-lightGreen"
          >
            <Text className="text-white font-bold text-lg">{firstLetter}</Text>
          </TouchableOpacity>

          {/* Profile Dropdown */}
          <Modal visible={showProfileMenu} transparent animationType="fade">
            <Pressable
              className="flex-1"
              onPress={() => setShowProfileMenu(false)}
            >
              <View className="absolute top-[80px] right-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 w-48">
                <TouchableOpacity className="flex-row items-center p-3 border-b border-gray-50">
                  <Feather
                    name="user"
                    size={18}
                    color={Colors.primary.darkGreen}
                  />
                  <Text className="ml-3 font-semibold text-black">Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center p-3">
                  <Feather
                    name="log-out"
                    size={18}
                    color={Colors.status.error}
                  />
                  <Text className="ml-3 font-semibold text-status-error">
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        </View>
      </View>
    </View>
  );
}
