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
      edges={["top", "left", "right"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-6 pt-3 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-black font-bold text-lg" numberOfLines={1}>
              Order Details
            </Text>
            <Text className="text-gray-500 font-semibold text-sm">
              {orderId}
            </Text>
          </View>
        </View>
        <View className="bg-background-lightBeige px-3 py-1.5 rounded-xl max-w-[42%]">
          <Text
            className="text-accent-orange font-bold text-xs"
            numberOfLines={1}
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
