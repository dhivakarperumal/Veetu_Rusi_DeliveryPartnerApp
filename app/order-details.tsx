import { Feather, Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import "../global.css";
import { Colors } from "../src/constants/Colors";
import { updateOrderStatus } from "./api";

const DELIVERY_STATUSES = [
  "New Order",
  "Delivery Partner Assigned",
  "Picked Up",
  "Start Ride",
  "Reached Location",
  "Waiting for Customer",
  "Out for Delivery",
  "Delivered",
];

const STATUS_STYLE: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  "New Order": { bg: "#1e293b", text: "#94a3b8", border: "#334155" },
  Accepted: { bg: "#172554", text: "#93c5fd", border: "#1e40af" },
  Preparing: { bg: "#3b0764", text: "#d8b4fe", border: "#6b21a8" },
  "Food Ready": { bg: "#431407", text: "#fdba74", border: "#9a3412" },
  Packing: { bg: "#1e1b4b", text: "#a5b4fc", border: "#3730a3" },
  "Searching Delivery Partner": {
    bg: "#451a03",
    text: "#fde047",
    border: "#92400e",
  },
  "Delivery Partner Assigned": {
    bg: "#083344",
    text: "#67e8f9",
    border: "#155e75",
  },
  "Picked Up": { bg: "#082f49", text: "#7dd3fc", border: "#075985" },
  "Start Ride": { bg: "#172554", text: "#93c5fd", border: "#1e40af" },
  "Reached Location": { bg: "#4a044e", text: "#f0abfc", border: "#86198f" },
  "Waiting for Customer": { bg: "#451a03", text: "#fcd34d", border: "#92400e" },
  "Out for Delivery": { bg: "#1e1b4b", text: "#a5b4fc", border: "#3730a3" },
  Delivered: { bg: "#022c22", text: "#6ee7b7", border: "#065f46" },
  Cancelled: { bg: "#450a0a", text: "#fca5a5", border: "#991b1b" },
};

type OrderParams = {
  orderId?: string;
  status?: string;
  amount?: string;
  pickup?: string;
  drop?: string;
  payment?: string;
};

export default function OrderDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<OrderParams>();
  const [currentStatus, setCurrentStatus] = useState(
    params.status || "New Order",
  );
  const [updating, setUpdating] = useState(false);
  const orderKey = String(params.orderId || "").replace(/^#/, "");
  const orderId = orderKey ? `#${orderKey}` : "#ORD123456";
  const amount = Number(params.amount || 75).toFixed(2);
  const pickup =
    params.pickup || "12, 4th Avenue, Anna Nagar, Chennai - 600040";
  const drop = params.drop || "23, Rangan Street, T. Nagar, Chennai - 600017";
  const payment = params.payment || "Prepaid Online";
  const statusIndex = DELIVERY_STATUSES.indexOf(currentStatus);
  const nextStatus =
    statusIndex >= 0
      ? DELIVERY_STATUSES[statusIndex + 1]
      : DELIVERY_STATUSES[1];
  const currentStatusStyle =
    STATUS_STYLE[currentStatus] || STATUS_STYLE["New Order"];
  const canUpdate = Boolean(
    orderKey && nextStatus && currentStatus.toLowerCase() !== "cancelled",
  );

  const handleStatusUpdate = async () => {
    if (!canUpdate || updating) return;
    setUpdating(true);
    try {
      await updateOrderStatus(orderKey, nextStatus);
      setCurrentStatus(nextStatus);
      router.replace({
        pathname: "/track-order",
        params: { orderId: orderKey, status: nextStatus },
      });
    } catch (error: any) {
      Alert.alert(
        "Unable to update status",
        error?.message || "Please try again.",
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background-main"
      edges={["left", "right"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View
        className="bg-primary-darkGreen pb-6 px-6 flex-row items-center justify-between rounded-b-3xl mb-4 shadow-sm"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
      >
        <View className="flex-row items-center flex-1 mr-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 w-10 h-10 items-center justify-center bg-white/10 rounded-full"
          >
            <Feather name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text
              className="text-white font-extrabold text-lg tracking-wide"
              numberOfLines={1}
            >
              Order Details
            </Text>
            <Text className="text-white/70 font-semibold text-xs mt-1">
              {orderId}
            </Text>
          </View>
        </View>
        <View
          className="max-w-[42%] rounded-xl border px-3 py-1.5"
          style={{
            backgroundColor: currentStatusStyle.bg,
            borderColor: currentStatusStyle.border,
          }}
        >
          <Text
            className="text-[10px] font-bold uppercase tracking-wider"
            numberOfLines={1}
            style={{ color: currentStatusStyle.text }}
          >
            {currentStatus}
          </Text>
        </View>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mt-4">
          <LocationCard
            title="Pickup Location"
            address={pickup}
            color={Colors.primary.brandGreen}
          />
          <LocationCard
            title="Drop Location"
            address={drop}
            color={Colors.status.error}
          />
          <View className="mt-6 mb-8">
            <Text className="font-bold text-black text-sm mb-4">
              Order Info
            </Text>
            <InfoRow label="Parcel / Document" value="Small Box" />
            <InfoRow label="Order Weight" value="1.2 kg" />
            <InfoRow
              label="Payment"
              value={payment}
              valueColor={Colors.primary.brandGreen}
            />
            <View className="flex-row justify-between items-center py-4">
              <Text className="text-gray-600 text-xs font-medium">
                Order Amount
              </Text>
              <Text className="text-black text-base font-extrabold">
                ₹{amount}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View
        className="px-6 bg-transparent"
        style={{ paddingTop: 10, paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          className="bg-primary-darkGreen w-full py-4 rounded-xl items-center shadow-md"
          onPress={handleStatusUpdate}
          disabled={!canUpdate || updating}
        >
          {updating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">
              {nextStatus
                ? currentStatus === "New Order"
                  ? "Accept Order"
                  : `Update to ${nextStatus}`
                : "Delivery completed"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function LocationCard({
  title,
  address,
  color,
}: {
  title: string;
  address: string;
  color: string;
}) {
  return (
    <View className="bg-white rounded-3xl p-5 border border-gray-50 mb-4">
      <Text className="text-gray-500 text-xs font-semibold mb-3">{title}</Text>
      <View className="flex-row items-start">
        <Ionicons name="location-outline" size={21} color={color} />
        <View className="ml-3 flex-1">
          <Text className="font-bold text-black text-sm">{address}</Text>
          <Text className="text-gray-500 text-xs mt-1 leading-relaxed">
            {address}
          </Text>
        </View>
        <View className="w-10 h-10 rounded-full bg-background-lightBeige items-center justify-center">
          <Feather name="phone" size={18} color={Colors.accent.orange} />
        </View>
      </View>
    </View>
  );
}

function InfoRow({
  label,
  value,
  valueColor = "#000000",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
      <Text className="text-gray-600 text-xs font-medium">{label}</Text>
      <Text className="text-xs font-bold" style={{ color: valueColor }}>
        {value}
      </Text>
    </View>
  );
}
