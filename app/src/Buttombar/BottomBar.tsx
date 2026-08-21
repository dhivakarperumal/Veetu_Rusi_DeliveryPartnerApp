import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

export default function BottomBar({
  activeTab = "home",
}: {
  activeTab?: string;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-white pt-4 px-8 flex-row justify-between items-center border-t border-gray-100 rounded-t-3xl shadow-lg"
      style={{ paddingBottom: Math.max(insets.bottom, 24) }}
    >
      <TouchableOpacity
        className="items-center"
        onPress={() => router.push("/")}
      >
        <Ionicons
          name={activeTab === "home" ? "home" : "home-outline"}
          size={24}
          color={
            activeTab === "home" ? Colors.primary.darkGreen : Colors.text.muted
          }
          style={{ marginBottom: 4 }}
        />
        <Text
          className={`text-[10px] font-bold ${activeTab === "home" ? "text-primary-darkGreen" : "text-gray-400"}`}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center"
        onPress={() => router.push("/orders")}
      >
        <Ionicons
          name={activeTab === "orders" ? "list" : "list-outline"}
          size={24}
          color={
            activeTab === "orders"
              ? Colors.primary.darkGreen
              : Colors.text.muted
          }
          style={{ marginBottom: 4 }}
        />
        <Text
          className={`text-[10px] font-bold ${activeTab === "orders" ? "text-primary-darkGreen" : "text-gray-400"}`}
        >
          Orders
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center"
        onPress={() => router.push("/earnings")}
      >
        <Feather
          name="shopping-bag"
          size={24}
          color={
            activeTab === "earnings"
              ? Colors.primary.darkGreen
              : Colors.text.muted
          }
          style={{ marginBottom: 4 }}
        />
        <Text
          className={`text-[10px] font-bold ${activeTab === "earnings" ? "text-primary-darkGreen" : "text-gray-400"}`}
        >
          Earnings
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center"
        onPress={() => router.push("/profile")}
      >
        <Feather
          name="user"
          size={24}
          color={
            activeTab === "profile"
              ? Colors.primary.darkGreen
              : Colors.text.muted
          }
          style={{ marginBottom: 4 }}
        />
        <Text
          className={`text-[10px] font-bold ${activeTab === "profile" ? "text-primary-darkGreen" : "text-gray-400"}`}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}
