import { Feather, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import { Colors } from "../src/constants/Colors";
import { getAvailableOrders, getMyOrders } from "./api";
import BottomBar from "./src/Buttombar/BottomBar";
import NewOrderPopup from "./src/NewOrderPopup/NewOrderPopup";
import TopHeader from "./src/TopHeader/TopHeader";

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [orders, setOrders] = useState<any[]>([]);
  const [period, setPeriod] = useState("Today");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setError("");
      const [myOrdersResult, availableOrdersResult] = await Promise.allSettled([
        getMyOrders("All"),
        getAvailableOrders(),
      ]);
      const myOrdersResponse =
        myOrdersResult.status === "fulfilled" ? myOrdersResult.value : null;
      const availableResponse =
        availableOrdersResult.status === "fulfilled"
          ? availableOrdersResult.value
          : null;
      const myOrders = Array.isArray(myOrdersResponse)
        ? myOrdersResponse
        : myOrdersResponse?.orders || [];
      const availableOrders = Array.isArray(availableResponse)
        ? availableResponse
        : availableResponse?.orders || [];
      const mergedOrders = [...myOrders, ...availableOrders].filter(
        (order, index, list) =>
          list.findIndex(
            (item) =>
              (item.id || item.order_id) === (order.id || order.order_id),
          ) === index,
      );
      setOrders(mergedOrders);
      if (
        !mergedOrders.length &&
        myOrdersResult.status === "rejected" &&
        availableOrdersResult.status === "rejected"
      ) {
        throw myOrdersResult.reason;
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load available orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const now = new Date();
  const periodOrders = orders.filter((order) => isInPeriod(order, period, now));
  const deliveredOrders = periodOrders.filter((order) =>
    normalizeStatus(order).includes("delivered"),
  );
  const pendingOrders = periodOrders.filter((order) => isPendingStatus(order));
  const cancelledOrders = periodOrders.filter((order) =>
    normalizeStatus(order).includes("cancel"),
  );
  const revenue = deliveredOrders.reduce(
    (sum, order) =>
      sum + Number(order.total_amount || order.total || order.amount || 0),
    0,
  );
  const isTablet = width >= 600;
  const periodLabel = period === "Today" ? "today" : period.toLowerCase();

  return (
    <SafeAreaView
      className="flex-1 bg-background-main"
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Fixed Header — outside ScrollView so it doesn't scroll */}
      <TopHeader />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.darkGreen}
          />
        }
      >
        <View className="px-6 pt-6">
          <View className="flex-row items-center justify-between mb-5">
            <View>
              <Text className="text-gray-500 text-xs font-medium">
                Your delivery desk
              </Text>
              <Text className="text-2xl font-extrabold text-gray-900 mt-1">
                Today&apos;s pulse
              </Text>
            </View>
            <View className="flex-row items-center bg-primary-lightGreen px-3 py-2 rounded-full">
              <View className="w-2 h-2 rounded-full bg-primary-brandGreen mr-2" />
              <Text className="text-primary-brandGreen text-xs font-bold">
                Live
              </Text>
            </View>
          </View>

          <View className="bg-primary-darkGreen rounded-3xl p-5 overflow-hidden">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                  {period} delivered earnings
                </Text>
                <Text className="text-white text-3xl font-extrabold mt-2">
                  ₹{revenue.toFixed(0)}
                </Text>
                <Text className="text-white/70 text-xs mt-2">
                  From {periodOrders.length} order
                  {periodOrders.length === 1 ? "" : "s"} {periodLabel}
                </Text>
              </View>
              <View className="bg-white/10 rounded-2xl p-3">
                <Ionicons name="wallet-outline" size={24} color="#F4D69F" />
              </View>
            </View>
            <View className="flex-row items-center mt-6">
              <Ionicons name="location-outline" size={15} color="#D7E8C5" />
              <Text className="text-white/80 text-xs ml-2">
                Anna Nagar, Chennai
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/orders")}
                className="ml-auto flex-row items-center"
              >
                <Text className="text-white text-xs font-bold mr-1">
                  Open orders
                </Text>
                <Feather name="arrow-up-right" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row mt-5 mb-5">
            {["Today", "This Week", "This Month"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setPeriod(item)}
                className={`mr-2 px-4 py-2.5 rounded-xl ${period === item ? "bg-accent-darkBrown" : "bg-white border border-gray-100"}`}
              >
                <Text
                  className={`text-xs font-bold ${period === item ? "text-white" : "text-gray-500"}`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity className="ml-auto bg-white border border-gray-100 rounded-xl px-3 py-2.5">
              <Feather
                name="sliders"
                size={16}
                color={Colors.primary.darkGreen}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between">
            <MetricCard
              icon="layers"
              label="Total orders"
              value={periodOrders.length}
              tone="green"
              wide={isTablet}
            />
            <MetricCard
              icon="clock"
              label="Pending orders"
              value={pendingOrders.length}
              tone="gold"
              wide={isTablet}
            />
            <MetricCard
              icon="check-circle"
              label="Delivered"
              value={deliveredOrders.length}
              tone="blue"
              wide={isTablet}
            />
            <MetricCard
              icon="x-circle"
              label="Cancelled"
              value={cancelledOrders.length}
              tone="red"
              wide={isTablet}
            />
          </View>

          <View className="flex-row items-center justify-between mt-7 mb-3">
            <Text className="text-lg font-extrabold text-gray-900">
              Quick actions
            </Text>
          </View>
          <View className="flex-row justify-between">
            <QuickAction
              icon="plus-circle"
              label="New order"
              onPress={() => router.push("/orders")}
            />
            <QuickAction
              icon="navigation"
              label="Assign"
              onPress={() => router.push("/orders")}
            />
            <QuickAction
              icon="list"
              label="All orders"
              onPress={() => router.push("/orders")}
            />
            <QuickAction
              icon="bar-chart-2"
              label="Earnings"
              onPress={() => router.push("/earnings")}
            />
          </View>

          <View className="flex-row items-center justify-between mt-8 mb-4">
            <View>
              <Text className="text-lg font-extrabold text-gray-900">
                Recent orders
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                Your latest delivery activity
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/orders")}>
              <Text className="text-accent-darkBrown font-bold text-xs">
                View all
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator
                size="small"
                color={Colors.primary.darkGreen}
              />
              <Text className="text-gray-400 mt-3 text-sm">
                Loading orders...
              </Text>
            </View>
          ) : error ? (
            <View className="items-center py-8">
              <Text className="text-gray-500 text-sm text-center">{error}</Text>
              <TouchableOpacity onPress={fetchOrders} className="mt-3">
                <Text className="text-primary-darkGreen font-bold text-sm">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : periodOrders.length > 0 ? (
            periodOrders
              .slice(0, 4)
              .map((order) => (
                <OrderCard
                  key={order.id || order.order_id}
                  order={order}
                  onPress={() => router.push("/orders")}
                />
              ))
          ) : (
            <View className="items-center py-8">
              <Text className="text-gray-400 text-sm">
                No orders in this period yet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* New Order Polling Popup */}
      <NewOrderPopup />

      {/* Bottom Navigation */}
      <BottomBar activeTab="home" />
    </SafeAreaView>
  );
}

function normalizeStatus(order: any) {
  return String(order.status || order.order_status || "pending").toLowerCase();
}

function isPendingStatus(order: any) {
  const status = normalizeStatus(order);
  return !["delivered", "cancelled", "failed", "completed"].some(
    (terminalStatus) => status.includes(terminalStatus),
  );
}

function isInPeriod(order: any, period: string, now: Date) {
  if (period === "Today") {
    const date = new Date(
      order.created_at || order.order_date || order.createdAt || 0,
    );
    return date.toDateString() === now.toDateString();
  }
  const date = new Date(
    order.created_at || order.order_date || order.createdAt || 0,
  ).getTime();
  if (!date) return true;
  const days = period === "This Week" ? 7 : 30;
  return now.getTime() - date <= days * 24 * 60 * 60 * 1000;
}

function MetricCard({
  icon,
  label,
  value,
  tone,
  wide,
}: {
  icon: any;
  label: string;
  value: number;
  tone: string;
  wide: boolean;
}) {
  const colors: Record<string, { bg: string; icon: string }> = {
    green: { bg: "#EBF7EB", icon: Colors.primary.brandGreen },
    gold: { bg: "#FFF5DE", icon: Colors.accent.golden },
    orange: { bg: "#FFF0E8", icon: Colors.accent.orange },
    blue: { bg: "#EAF3F7", icon: "#36758B" },
    red: { bg: "#FDEAEA", icon: Colors.status.error },
    purple: { bg: "#F0ECF7", icon: "#75618F" },
  };
  const palette = colors[tone];
  return (
    <View
      className={`bg-white rounded-2xl p-4 mb-3 border border-gray-100 ${wide ? "w-[31.5%]" : "w-[48.5%]"}`}
    >
      <View className="flex-row items-center justify-between">
        <View
          className="rounded-xl p-2.5"
          style={{ backgroundColor: palette.bg }}
        >
          <Feather name={icon} size={17} color={palette.icon} />
        </View>
        <Feather name="more-horizontal" size={17} color="#C7C7C7" />
      </View>
      <Text className="text-2xl font-extrabold text-gray-900 mt-4">
        {value}
      </Text>
      <Text
        className="text-gray-500 text-xs font-medium mt-1"
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} className="items-center w-[23%]">
      <View className="bg-white border border-gray-100 rounded-2xl p-3.5">
        <Feather name={icon} size={20} color={Colors.primary.darkGreen} />
      </View>
      <Text
        className="text-gray-500 text-[10px] font-bold mt-2"
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function OrderCard({ order, onPress }: { order: any; onPress: () => void }) {
  const id = order.order_id || `#${order.id}`;
  const price = Number(order.total_amount || 0).toFixed(2);
  const pickup =
    order.pickup_address || order.restaurant_address || "Restaurant address";
  const drop =
    order.delivery_address || order.street_address || "Customer address";
  const distance = order.distance
    ? `${order.distance} km`
    : "Distance unavailable";
  const time = order.estimated_time
    ? `${order.estimated_time} mins`
    : "New order";

  return (
    <View className="bg-white rounded-3xl p-4 shadow-sm border border-gray-50 mb-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-bold text-black text-base">{id}</Text>
        <View className="bg-primary-lightGreen px-3 py-1 rounded-lg">
          <Text className="text-primary-brandGreen font-bold">₹{price}</Text>
        </View>
      </View>

      <View className="flex-row items-center mb-3">
        <View className="w-3 h-3 rounded-full bg-primary-brandGreen border-[3px] border-primary-lightGreen" />
        <Text className="text-gray-500 text-xs ml-3 font-medium">
          {distance} • {time}
        </Text>
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
        <TouchableOpacity
          onPress={onPress}
          className="bg-primary-darkGreen px-6 py-2.5 rounded-xl"
        >
          <Text className="text-white font-bold text-sm">View Order</Text>
        </TouchableOpacity>
      </View>

      {/* Dashed line connecting dots */}
      <View className="absolute left-[21px] top-[74px] w-0.5 h-8 border-l border-dashed border-gray-300" />
    </View>
  );
}
