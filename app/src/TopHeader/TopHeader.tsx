import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getStoredUser, logoutUser } from "../../api";
import { Colors } from "../constants/Colors";

type TopHeaderProps = {
  title?: string;
  showBack?: boolean;
};

export default function TopHeader({ title, showBack }: TopHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [userName, setUserName] = useState("User");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Load logged-in user from storage
  useEffect(() => {
    const loadUser = async () => {
      const user = await getStoredUser();
      if (user?.name) {
        setUserName(user.name);
      } else if (user?.email) {
        setUserName(user.email.split("@")[0]);
      }
    };
    loadUser();
  }, []);

  const firstLetter = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logoutUser();
    router.replace("/src/Auth/LoginScreen");
  };

  const handleProfile = () => {
    setShowProfileMenu(false);
    router.push("/profile");
  };

  return (
    <View
      className="px-6 pb-6 z-50"
      style={{
        paddingTop: Math.max(insets.top + 8, 20),
        backgroundColor: Colors.primary.darkGreen,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center justify-between mt-2">
        <View className="flex-row items-center">
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
        )}

        {title ? (
          <Text className="text-white font-bold text-lg">{title}</Text>
        ) : (
          <View>
            <Text className="text-white/70 text-xs font-medium">
              Good Morning,
            </Text>
            <Text className="text-white font-bold text-lg">{userName} 👋</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center">
        {/* Notifications */}
        <View>
          <TouchableOpacity onPress={() => setShowNotifMenu(true)}>
            <Feather name="bell" size={24} color="white" />
            <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-primary-darkGreen" />
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
        <View className="ml-4">
          <TouchableOpacity
            onPress={() => setShowProfileMenu(true)}
            className="w-10 h-10 rounded-full bg-white items-center justify-center border-2 border-primary-lightGreen"
          >
            <Text className="text-primary-darkGreen font-bold text-lg">{firstLetter}</Text>
          </TouchableOpacity>

          {/* Profile Dropdown */}
          <Modal visible={showProfileMenu} transparent animationType="fade">
            <Pressable
              className="flex-1"
              onPress={() => setShowProfileMenu(false)}
            >
              <View className="absolute top-[80px] right-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 w-52">
                {/* User Info */}
                <View className="px-3 py-3 border-b border-gray-100">
                  <Text className="font-bold text-black text-sm">{userName}</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">Delivery Partner</Text>
                </View>

                <TouchableOpacity
                  className="flex-row items-center p-3 border-b border-gray-50"
                  onPress={handleProfile}
                >
                  <Feather name="user" size={18} color={Colors.primary.darkGreen} />
                  <Text className="ml-3 font-semibold text-black">Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center p-3"
                  onPress={handleLogout}
                >
                  <Feather name="log-out" size={18} color={Colors.status.error} />
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
    </View>
  );
}
