import { Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import { Colors } from "../src/constants/Colors";
import { getMyOrders } from "./api";
import BottomBar from "./src/Buttombar/BottomBar";
import TopHeader from "./src/TopHeader/TopHeader";

export default function Earnings() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [range, setRange] = useState("This Week");
  const [paymentFilter, setPaymentFilter] = useState("All payments");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setError("");
      const response = await getMyOrders("All");
      const result = Array.isArray(response)
        ? response
        : response?.orders || [];
      setOrders(result);
    } catch (err: any) {
      setError(err?.message || "Unable to load earnings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const deliveredOrders = useMemo(
    () =>
      orders.filter((order) => normalizeStatus(order).includes("delivered")),
    [orders],
  );
  const totalEarnings = deliveredOrders.reduce(
    (sum, order) => sum + getOrderAmount(order),
    0,
  );
  const today = new Date();
  const todayOrders = deliveredOrders.filter((order) =>
    isSameDay(getOrderDate(order), today),
  );
  const weekOrders = deliveredOrders.filter((order) =>
    isWithinDays(order, 7, today),
  );
  const monthOrders = deliveredOrders.filter((order) =>
    isWithinDays(order, 30, today),
  );
  const weekEarnings = weekOrders.reduce(
    (sum, order) => sum + getOrderAmount(order),
    0,
  );
  const pendingEarnings = orders
    .filter((order) => !isTerminal(order))
    .reduce((sum, order) => sum + getOrderAmount(order), 0);
  const filteredOrders = deliveredOrders.filter((order) => {
    const orderId = String(order.order_id || order.id || "").toLowerCase();
    const payment = String(
      order.payment_status || order.payment_method || "paid",
    ).toLowerCase();
    return (
      orderId.includes(search.toLowerCase()) &&
      (paymentFilter === "All payments" ||
        payment.includes(paymentFilter.toLowerCase()))
    );
  });
  const chartData = getChartData(deliveredOrders, today);
  const maxVal = Math.max(...chartData.map((item) => item.value), 1);
  const maxBarHeight = 120;

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background-main"
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Fixed Header */}
      <TopHeader title="My Earnings" />

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
        <View className="px-6 mt-4">
          <View className="flex-row flex-wrap justify-between mb-3">
            <SummaryCard
              icon="briefcase"
              label="Total Earnings"
              value={`₹${totalEarnings.toFixed(2)}`}
              note="All delivered orders"
            />
            <SummaryCard
              icon="sun"
              label="Today's Earnings"
              value={`₹${sumEarnings(todayOrders).toFixed(2)}`}
              note={`${todayOrders.length} deliveries`}
            />
            <SummaryCard
              icon="clock"
              label="Pending Earnings"
              value={`₹${pendingEarnings.toFixed(2)}`}
              note="Awaiting completion"
            />
            <SummaryCard
              icon="check-circle"
              label="Completed Deliveries"
              value={String(deliveredOrders.length)}
              note="Successfully delivered"
            />
          </View>

          {/* Date Selector */}
          <Text className="text-lg font-extrabold text-gray-900 mt-3 mb-3">
            Filter Earnings
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
          >
            {[
              "Today",
              "Yesterday",
              "This Week",
              "This Month",
              "Custom Range",
            ].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setRange(item)}
                className={`mr-2 px-3 py-2.5 rounded-xl ${range === item ? "bg-accent-darkBrown" : "bg-white border border-gray-100"}`}
              >
                <Text
                  className={`text-[11px] font-bold ${range === item ? "text-white" : "text-gray-500"}`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View className="flex-row items-center bg-white border border-gray-100 rounded-2xl px-4 py-1 mb-3">
            <Feather name="search" size={16} color={Colors.text.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by Order ID"
              placeholderTextColor={Colors.text.muted}
              className="flex-1 ml-3 text-gray-800 text-sm"
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {["All payments", "Paid", "Pending", "Processing"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setPaymentFilter(item)}
                className={`mr-2 px-3 py-2 rounded-lg ${paymentFilter === item ? "bg-primary-darkGreen" : "bg-white border border-gray-100"}`}
              >
                <Text
                  className={`text-[10px] font-bold ${paymentFilter === item ? "text-white" : "text-gray-500"}`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View className="flex-row mb-5">
            <TouchableOpacity
              onPress={() => {}}
              className="flex-1 bg-primary-darkGreen rounded-xl py-3 items-center mr-2"
            >
              <Text className="text-white font-bold text-sm">Apply Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setPaymentFilter("All payments");
                setRange("This Week");
              }}
              className="px-5 bg-white border border-gray-200 rounded-xl py-3 items-center"
            >
              <Text className="text-gray-600 font-bold text-sm">Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Date Selector */}
          <TouchableOpacity
            className="flex-row items-center mb-4 self-start"
            disabled
          >
            <Text className="text-gray-700 font-semibold text-sm mr-1">
              This week
            </Text>
            <Feather
              name="chevron-down"
              size={16}
              color={Colors.text.secondary}
            />
          </TouchableOpacity>

          {/* Total Earnings Card */}
          <View className="bg-primary-darkGreen rounded-3xl p-6 mb-4 flex-row justify-between items-center shadow-md">
            <View>
              <Text className="text-white/80 font-medium text-xs mb-1">
                This Week Earnings
              </Text>
              <Text className="text-white font-extrabold text-3xl">
                ₹{weekEarnings.toFixed(2)}
              </Text>
            </View>
            <View className="border border-accent-golden rounded-xl p-3 bg-primary-darkGreen">
              <Feather
                name="briefcase"
                size={28}
                color={Colors.accent.golden}
              />
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row justify-between mb-8 space-x-2">
            <View className="flex-1 bg-white p-3 rounded-2xl items-center border border-gray-100 shadow-sm">
              <Text className="text-gray-500 text-[10px] font-semibold mb-1">
                Orders
              </Text>
              <Text className="text-black font-bold text-lg">
                {weekOrders.length}
              </Text>
            </View>
            <View className="flex-1 bg-white p-3 rounded-2xl items-center border border-gray-100 shadow-sm ml-2">
              <Text className="text-gray-500 text-[10px] font-semibold mb-1">
                Online Hours
              </Text>
              <Text className="text-black font-bold text-lg">
                {formatHours(weekOrders)}
              </Text>
            </View>
            <View className="flex-1 bg-white p-3 rounded-2xl items-center border border-gray-100 shadow-sm ml-2">
              <Text className="text-gray-500 text-[10px] font-semibold mb-1">
                Incentives
              </Text>
              <Text className="text-black font-bold text-lg">₹0.00</Text>
            </View>
          </View>

          {/* Earnings Summary Chart */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-black font-bold text-base">
              Earnings Summary
            </Text>
            <Text className="text-gray-400 text-xs">Delivered only</Text>
          </View>
          <View className="flex-row justify-between items-end h-[160px] mb-8 bg-white p-4 rounded-3xl border border-gray-50 shadow-sm">
            {chartData.map((item, index) => {
              const height = (item.value / maxVal) * maxBarHeight;
              return (
                <View key={index} className="items-center w-8">
                  <Text className="text-[10px] font-bold text-gray-700 mb-2">
                    ₹{item.value}
                  </Text>
                  <View
                    className="w-6 bg-primary-oliveGreen rounded-md"
                    style={{ height }}
                  />
                  <Text className="text-[10px] font-medium text-gray-500 mt-2">
                    {item.day}
                  </Text>
                </View>
              );
            })}
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-lg font-extrabold text-gray-900">
                Earnings history
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                {filteredOrders.length} delivered records
              </Text>
            </View>
            <Feather name="list" size={18} color={Colors.primary.brandGreen} />
          </View>
          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator color={Colors.primary.darkGreen} />
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
          ) : filteredOrders.length > 0 ? (
            filteredOrders.slice(0, 20).map((order, index) => (
              <TouchableOpacity
                key={order.id || order.order_id || index}
                onPress={() => setSelectedOrder(order)}
                className="bg-white border border-gray-100 rounded-2xl p-4 mb-3"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-9 h-9 rounded-xl bg-primary-lightGreen items-center justify-center mr-3">
                      <Feather
                        name="check"
                        size={16}
                        color={Colors.primary.brandGreen}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-extrabold text-sm">
                        {order.order_id || `#${order.id}`}
                      </Text>
                      <Text
                        className="text-gray-400 text-xs mt-1"
                        numberOfLines={1}
                      >
                        {formatDate(getOrderDate(order))} ·{" "}
                        {order.customer_name || "Customer"}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-primary-brandGreen font-extrabold">
                      ₹{getOrderAmount(order).toFixed(2)}
                    </Text>
                    <Text className="text-green-600 text-[10px] font-bold mt-1">
                      Paid · View details
                    </Text>
                  </View>
                </View>
                <View className="flex-row border-t border-gray-50 mt-3 pt-3">
                  <Text className="text-gray-400 text-[10px] flex-1">
                    Distance: {order.distance ? `${order.distance} km` : "--"}
                  </Text>
                  <Text className="text-gray-400 text-[10px]">
                    Delivery fee
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center py-8">
              <Feather name="inbox" size={36} color="#CBD5E1" />
              <Text className="text-gray-400 text-sm mt-3">
                No delivered earnings found.
              </Text>
            </View>
          )}

          <Text className="text-lg font-extrabold text-gray-900 mt-5 mb-3">
            Payout
          </Text>
          <View className="bg-primary-darkGreen rounded-3xl p-5 mb-4">
            <Text className="text-white/70 text-xs font-semibold">
              Available balance
            </Text>
            <Text className="text-white text-3xl font-extrabold mt-2">
              ₹{totalEarnings.toFixed(2)}
            </Text>
            <View className="flex-row mt-5">
              <View className="flex-1">
                <Text className="text-white/60 text-[10px]">
                  Pending amount
                </Text>
                <Text className="text-white font-bold mt-1">
                  ₹{pendingEarnings.toFixed(2)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white/60 text-[10px]">Last payout</Text>
                <Text className="text-white font-bold mt-1">--</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white/60 text-[10px]">Next payout</Text>
                <Text className="text-white font-bold mt-1">--</Text>
              </View>
            </View>
            <View className="flex-row mt-5">
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Request payout",
                    "Payout requests will be available once your payout account is configured.",
                  )
                }
                className="flex-1 bg-accent-golden rounded-xl py-3 items-center mr-2"
              >
                <Text className="text-white font-extrabold text-sm">
                  Request Payout
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Payout history",
                    "No payout history is available yet.",
                  )
                }
                className="flex-1 border border-white/30 rounded-xl py-3 items-center"
              >
                <Text className="text-white font-bold text-sm">
                  Payout History
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomBar activeTab="earnings" />
      <EarningDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </SafeAreaView>
  );
}

function normalizeStatus(order: any) {
  return String(order.status || order.order_status || "").toLowerCase();
}

function isTerminal(order: any) {
  return ["delivered", "cancelled", "failed", "completed"].some((status) =>
    normalizeStatus(order).includes(status),
  );
}

function SummaryCard({
  icon,
  label,
  value,
  note,
}: {
  icon: any;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 w-[48.5%]">
      <View className="bg-primary-lightGreen rounded-xl p-2.5 self-start">
        <Feather name={icon} size={17} color={Colors.primary.brandGreen} />
      </View>
      <Text className="text-xl font-extrabold text-gray-900 mt-4">{value}</Text>
      <Text className="text-gray-700 text-xs font-bold mt-1" numberOfLines={1}>
        {label}
      </Text>
      <Text className="text-gray-400 text-[10px] mt-1" numberOfLines={1}>
        {note}
      </Text>
    </View>
  );
}

function formatDate(date: Date) {
  return date.getTime() > 0
    ? date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date unavailable";
}

function EarningDetailsModal({
  order,
  onClose,
}: {
  order: any | null;
  onClose: () => void;
}) {
  if (!order) return null;
  const amount = getOrderAmount(order).toFixed(2);
  const details = [
    ["Order ID", order.order_id || `#${order.id}`],
    ["Delivery date/time", formatDate(getOrderDate(order))],
    [
      "Pickup location",
      order.pickup_address || order.restaurant_address || "--",
    ],
    [
      "Delivery location",
      order.delivery_address || order.street_address || "--",
    ],
    ["Distance", order.distance ? `${order.distance} km` : "--"],
    ["Base delivery fee", `₹${amount}`],
    ["Per-km earning", "--"],
    ["Incentive", "₹0.00"],
    ["Bonus", "₹0.00"],
    ["Tip", "₹0.00"],
    ["Adjustments", "₹0.00"],
    ["Total earning", `₹${amount}`],
    ["Payment status", "Paid"],
  ];
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl max-h-[86%] p-6">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-gray-900 text-xl font-extrabold">
                Earning details
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                Delivered order breakdown
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 rounded-full p-2"
            >
              <Feather name="x" size={18} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {details.map(([label, value]) => (
              <View
                key={label}
                className="flex-row justify-between py-3 border-b border-gray-50"
              >
                <Text className="text-gray-500 text-xs flex-1">{label}</Text>
                <Text
                  className={`text-xs font-bold text-right max-w-[60%] ${label === "Total earning" ? "text-primary-brandGreen text-base" : "text-gray-900"}`}
                >
                  {value}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function getOrderAmount(order: any) {
  return Number(
    order.delivery_fee ||
      order.delivery_charge ||
      order.total_amount ||
      order.total ||
      order.amount ||
      0,
  );
}

function sumEarnings(orderList: any[]) {
  return orderList.reduce((sum, order) => sum + getOrderAmount(order), 0);
}

function getOrderDate(order: any) {
  return new Date(
    order.delivered_at ||
      order.updated_at ||
      order.created_at ||
      order.order_date ||
      0,
  );
}

function isSameDay(first: Date, second: Date) {
  return first.getTime() > 0 && first.toDateString() === second.toDateString();
}

function isWithinDays(order: any, days: number, currentDate: Date) {
  const orderDate = getOrderDate(order).getTime();
  return (
    orderDate > 0 &&
    currentDate.getTime() - orderDate <= days * 24 * 60 * 60 * 1000
  );
}

function formatHours(orderList: any[]) {
  const minutes = orderList.reduce(
    (sum, order) =>
      sum + Number(order.delivery_time_minutes || order.delivery_duration || 0),
    0,
  );
  return minutes > 0 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : "--";
}

function getChartData(orderList: any[], currentDate: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(currentDate);
    date.setHours(0, 0, 0, 0);
    date.setDate(currentDate.getDate() - (6 - index));
    const value = orderList
      .filter(
        (order) => getOrderDate(order).toDateString() === date.toDateString(),
      )
      .reduce((sum, order) => sum + getOrderAmount(order), 0);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      value,
    };
  });
}
