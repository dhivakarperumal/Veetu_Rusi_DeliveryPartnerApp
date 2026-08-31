import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import { Colors } from "../src/constants/Colors";
import { getStoredUser, logoutUser } from "./api";
import BottomBar from "./src/Buttombar/BottomBar";
import TopHeader from "./src/TopHeader/TopHeader";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await getStoredUser();
      setUser(storedUser);
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/src/Auth/LoginScreen");
  };

  const firstLetter = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
      ? user.email.charAt(0).toUpperCase()
      : "U";

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const displayPhone = user?.phone || user?.mobile || "—";

  return (
    <SafeAreaView
      className="flex-1 bg-background-main"
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Fixed Header */}
      <TopHeader title="My Profile" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="items-center justify-center mt-20">
            <ActivityIndicator size="large" color={Colors.primary.darkGreen} />
          </View>
        ) : (
          <>
            {/* Profile Header Card */}
            <View className="mx-4 mt-8 mb-6 overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-sm">
              <View className="bg-primary-darkGreen px-5 pb-6 pt-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="h-16 w-16 items-center justify-center rounded-full border-4 border-primary-lightGreen bg-white/10">
                      <Text className="text-2xl font-extrabold text-white">
                        {firstLetter}
                      </Text>
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-xl font-extrabold text-white">
                        {displayName}
                      </Text>
                      <Text className="mt-1 text-xs font-medium text-white/75">
                        {displayPhone}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10">
                    <Feather name="edit-2" size={16} color="white" />
                  </TouchableOpacity>
                </View>

                <View className="mt-5 flex-row items-center justify-between">
                  <View className="rounded-full bg-white/10 px-3 py-1.5">
                    <Text className="text-[10px] font-bold uppercase tracking-[1.2px] text-white/80">
                      Delivery Partner
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <Text className="ml-2 text-xs font-semibold text-white/80">
                      Available
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-white px-4 pb-4 pt-3">
                <View className="flex-row justify-between">
                  <ProfileStatCard label="Orders" value="128" tone="green" />
                  <ProfileStatCard label="Rating" value="4.9" tone="gold" />
                  <ProfileStatCard label="Trips" value="96%" tone="blue" />
                </View>

                {user?.email && (
                  <View className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <View className="flex-row items-center">
                      <Feather
                        name="mail"
                        size={16}
                        color={Colors.text.muted}
                      />
                      <Text className="ml-2 text-[11px] font-semibold uppercase tracking-[1.2px] text-gray-500">
                        Email
                      </Text>
                    </View>
                    <Text className="mt-2 text-sm font-semibold text-gray-800">
                      {user.email}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Menu Options */}
            <View className="px-6 pb-24 space-y-3">
              <MenuItem
                icon="user"
                label="Personal Information"
                onPress={() => router.push("/personal-info")}
              />
              <MenuItem
                icon="car"
                iconFamily="Ionicons"
                label="Vehicle Information"
                onPress={() => router.push("/vehicle-info")}
              />
              <MenuItem
                icon="file-text"
                label="Documents"
                onPress={() => router.push("/documents")}
              />
              <MenuItem
                icon="bank-outline"
                iconFamily="MaterialCommunityIcons"
                label="Bank Details"
                onPress={() => router.push("/bank-details")}
              />
              <MenuItem icon="bell" label="Notifications" onPress={() => {}} />
              <MenuItem
                icon="clock"
                label="Help & Support"
                onPress={() => router.push("/helpsupport")}
              />

              <TouchableOpacity
                className="flex-row items-center py-4 px-2 mt-2"
                onPress={handleLogout}
              >
                <Feather name="log-out" size={22} color={Colors.status.error} />
                <Text className="ml-4 text-status-error font-semibold text-[15px]">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <BottomBar activeTab="profile" />
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, iconFamily = "Feather", onPress }: any) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm mb-3"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {iconFamily === "Feather" && (
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-lightGreen">
            <Feather name={icon} size={20} color={Colors.primary.darkGreen} />
          </View>
        )}
        {iconFamily === "Ionicons" && (
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-lightGreen">
            <Ionicons
              name={`${icon}-outline`}
              size={20}
              color={Colors.primary.darkGreen}
            />
          </View>
        )}
        {iconFamily === "MaterialCommunityIcons" && (
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-lightGreen">
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={Colors.primary.darkGreen}
            />
          </View>
        )}
        <Text className="ml-4 text-gray-800 font-semibold text-[15px]">
          {label}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={Colors.text.muted} />
    </TouchableOpacity>
  );
}

function ProfileStatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  const palette: Record<string, { bg: string; text: string }> = {
    green: { bg: "#EBF7EB", text: Colors.primary.brandGreen },
    gold: { bg: "#FFF5DE", text: Colors.accent.golden },
    blue: { bg: "#EAF3F7", text: "#36758B" },
  };

  return (
    <View
      className="flex-1 items-center rounded-2xl px-3 py-3 border border-gray-100"
      style={{ backgroundColor: palette[tone]?.bg || "#F8FAFC" }}
    >
      <Text
        className="text-xl font-extrabold"
        style={{ color: palette[tone]?.text || Colors.primary.darkGreen }}
      >
        {value}
      </Text>
      <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[1px] text-gray-500">
        {label}
      </Text>
    </View>
  );
}
