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
        {/* ── Promotional Banner (Attached to Top) ──────────────── */}
        <HomeBanner />

        <View className="px-5 pt-5">
          <View className="flex-row items-center justify-between mb-5">
            <View>
              <Text className="text-gray-500 text-xs font-medium">
                Your delivery desk
              </Text>
              <Text className="text-2xl font-extrabold text-gray-900 mt-1">
                Today pulse
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

          <View className="flex-row items-center justify-between mt-7 mb-4">
            <Text className="text-lg font-extrabold text-gray-900">
              Quick Actions
            </Text>
          </View>
          <View className="flex-row justify-between">
            <QuickAction
              icon="map"
              label="My Routes"
              bg="#16A34A"
              onPress={() => router.push("/orders")}
            />
            <QuickAction
              icon="bar-chart-2"
              label="Earnings"
              bg="#9333EA"
              onPress={() => router.push("/earnings")}
            />
            <QuickAction
              icon="credit-card"
              label="Wallet"
              bg="#2563EB"
              onPress={() => router.push("/bank-details")}
            />
            <QuickAction
              icon="headphones"
              label="Support"
              bg="#EA580C"
              onPress={() => router.push("/helpsupport")}
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
            periodOrders.slice(0, 4).map((order) => (
              <OrderCard
                key={order.id || order.order_id}
                order={order}
                onPress={() =>
                  router.push({
                    pathname: "/order-details",
                    params: getOrderDetailsParams(order),
                  })
                }
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

function getOrderDetailsParams(order: any) {
  return {
    orderId: String(order.id || order.order_id || ""),
    status: String(order.status || order.order_status || "New Order"),
    amount: String(order.total_amount || order.total || order.amount || "0"),
    pickup: String(
      order.pickup_address || order.restaurant_address || "Restaurant address",
    ),
    drop: String(
      order.delivery_address || order.street_address || "Customer address",
    ),
    payment: String(order.payment_method || "COD"),
    customer: String(order.customer_name || "Customer"),
  };
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
  const palette: Record<string, { solid: string; dark: string; glow: string }> =
    {
      green: {
        solid: "#16A34A",
        dark: "#14532D",
        glow: "rgba(22,163,74,0.18)",
      },
      gold: { solid: "#D97706", dark: "#78350F", glow: "rgba(217,119,6,0.18)" },
      blue: { solid: "#2563EB", dark: "#1E3A8A", glow: "rgba(37,99,235,0.18)" },
      red: { solid: "#DC2626", dark: "#7F1D1D", glow: "rgba(220,38,38,0.18)" },
      purple: {
        solid: "#7C3AED",
        dark: "#4C1D95",
        glow: "rgba(124,58,237,0.18)",
      },
      orange: {
        solid: "#EA580C",
        dark: "#7C2D12",
        glow: "rgba(234,88,12,0.18)",
      },
    };
  const p = palette[tone] || palette.green;

  return (
    <View
      style={{
        width: wide ? "31.5%" : "48.5%",
        backgroundColor: p.solid,
        borderRadius: 22,
        marginBottom: 12,
        padding: 18,
        elevation: 5,
        shadowColor: p.solid,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          right: -18,
          bottom: -18,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: "rgba(255,255,255,0.1)",
        }}
      />
      <View
        style={{
          position: "absolute",
          right: 10,
          top: -20,
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: "rgba(255,255,255,0.07)",
        }}
      />

      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.2)",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <Feather name={icon} size={18} color="white" />
      </View>

      <Text
        style={{
          fontSize: 30,
          fontWeight: "900",
          color: "white",
          lineHeight: 34,
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          fontSize: 11,
          fontWeight: "600",
          color: "rgba(255,255,255,0.75)",
          marginTop: 5,
        }}
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
  bg,
  onPress,
}: {
  icon: any;
  label: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="items-center w-[23%]"
    >
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 18,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: bg,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Feather name={icon} size={22} color="white" />
      </View>
      <Text
        className="text-gray-600 text-[11px] font-bold mt-2 text-center"
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function OrderCard({ order, onPress }: { order: any; onPress: () => void }) {
  const router = useRouter();
  const id = order.order_id || `#${order.id}`;
  const price = Number(order.total_amount || 0).toFixed(2);
  const pickup =
    order.pickup_address || order.restaurant_address || "Restaurant Address";
  const drop =
    order.delivery_address || order.street_address || "Customer Address";
  const status = order.status || order.order_status || "New Order";
  const customer = order.customer_name || "Customer";
  const payment = order.payment_method || "COD";
  const time =
    order.ordered_at || order.created_at
      ? new Date(order.ordered_at || order.created_at).toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        )
      : "";

  const handleViewDetails = () => {
    const params = getOrderDetailsParams(order);
    router.push({
      pathname: "/order-details",
      params,
    });
    if (onPress) onPress();
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 24,
        marginBottom: 14,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        elevation: 4,
        shadowColor: Colors.primary.darkGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          backgroundColor: Colors.primary.darkGreen,
          paddingHorizontal: 18,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Feather name="shopping-bag" size={16} color="white" />
          </View>
          <View>
            <Text style={{ fontSize: 13, fontWeight: "900", color: "white" }}>
              {id}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.65)",
                marginTop: 1,
              }}
            >
              {customer}
              {time ? ` · ${time}` : ""}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "900", color: "white" }}>
            ₹{price}
          </Text>
          <Text
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
            }}
          >
            {payment}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 4 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 8,
          }}
        >
          <View style={{ width: 24, alignItems: "center", marginRight: 10 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: Colors.primary.darkGreen,
                marginTop: 3,
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "800",
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 2,
              }}
            >
              Pickup
            </Text>
            <Text
              style={{ fontSize: 13, fontWeight: "600", color: "#1E293B" }}
              numberOfLines={1}
            >
              {pickup}
            </Text>
          </View>
        </View>

        <View style={{ marginLeft: 28, marginBottom: 8 }}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                width: 2,
                height: 5,
                backgroundColor: "#CBD5E1",
                borderRadius: 1,
                marginBottom: 2,
              }}
            />
          ))}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <View style={{ width: 24, alignItems: "center", marginRight: 10 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: "#EF4444",
                marginTop: 3,
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "800",
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 2,
              }}
            >
              Dropoff
            </Text>
            <Text
              style={{ fontSize: 13, fontWeight: "600", color: "#1E293B" }}
              numberOfLines={1}
            >
              {drop}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 18, paddingBottom: 16 }}>
        <TouchableOpacity
          onPress={handleViewDetails}
          activeOpacity={0.85}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F0FDF4",
            borderWidth: 1.5,
            borderColor: Colors.primary.darkGreen,
            paddingVertical: 12,
            borderRadius: 16,
            gap: 8,
          }}
        >
          <Feather name="eye" size={15} color={Colors.primary.darkGreen} />
          <Text
            style={{
              color: Colors.primary.darkGreen,
              fontWeight: "800",
              fontSize: 13,
            }}
          >
            View Order Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── Home Banner ────────────────────────────────────────────────────── */
const BANNERS = [
  {
    id: 1,
    title: "Boost Your Earnings!",
    subtitle: "Complete 10 deliveries today\nand earn a ₹150 bonus.",
    emoji: "🚀",
    bg: ["#1B5E20", "#2E7D32"],
    accent: "#A5D6A7",
    tag: "Today's Challenge",
    tagBg: "rgba(255,255,255,0.15)",
  },
  {
    id: 2,
    title: "Peak Hour Active",
    subtitle: "12 PM – 3 PM earns\n1.5× your base rate.",
    emoji: "⚡",
    bg: ["#7B1FA2", "#6A1B9A"],
    accent: "#CE93D8",
    tag: "Peak Hours",
    tagBg: "rgba(255,255,255,0.15)",
  },
  {
    id: 3,
    title: "Weekend Bonus",
    subtitle: "Extra ₹50 per order\nthis Saturday & Sunday.",
    emoji: "🎉",
    bg: ["#B71C1C", "#C62828"],
    accent: "#FFAB91",
    tag: "Weekend Special",
    tagBg: "rgba(255,255,255,0.15)",
  },
  {
    id: 4,
    title: "Refer & Earn",
    subtitle: "Invite a friend and get\n₹200 when they complete 5 trips.",
    emoji: "🤝",
    bg: ["#0277BD", "#01579B"],
    accent: "#81D4FA",
    tag: "Referral",
    tagBg: "rgba(255,255,255,0.15)",
  },
];

function HomeBanner() {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = width;
  const banner = BANNERS[0]; // Just use the first banner

  return (
    <View className="mb-2 w-full">
      <View
        className="overflow-hidden px-7 py-6"
        style={{ width: CARD_WIDTH, backgroundColor: Colors.primary.darkGreen }}
      >
        <View className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <View className="absolute right-8 -bottom-12 h-24 w-24 rounded-full bg-white/5" />

        <View className="mb-4 self-start rounded-full border border-white/20 bg-white/10 px-2.5 py-1">
          <Text
            className="text-[9px] font-extrabold uppercase tracking-[1.2px]"
            style={{ color: banner.accent }}
          >
            {banner.tag}
          </Text>
        </View>

        <View className="flex-row items-start justify-between">
          <View className="mr-3 flex-1">
            <Text
              className="mb-1.5 text-lg font-black text-white"
              style={{ lineHeight: 24 }}
            >
              {banner.title}
            </Text>
            <Text
              className="text-xs font-medium text-white/75"
              style={{ lineHeight: 18 }}
            >
              {banner.subtitle}
            </Text>
          </View>
          <Text className="text-4xl">{banner.emoji}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className="mt-5 flex-row items-center self-start rounded-xl border border-white/25 bg-white/15 px-4 py-2"
        >
          <Text className="text-xs font-extrabold text-white">Learn more</Text>
          <Feather
            name="arrow-right"
            size={13}
            color="white"
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
