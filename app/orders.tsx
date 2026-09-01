import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import { getMyOrders, updateOrderStatus } from "./api";
import BottomBar from "./src/Buttombar/BottomBar";
import TopHeader from "./src/TopHeader/TopHeader";

/* ─── Status colours (exact match from web admin) ─────────────────────── */
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
  /* ── Delivery Partner statuses (from user's STATUS_STYLE) ── */
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
  Delivered: { bg: "#d1fae5", text: "#000000", border: "#10b981" },
  Cancelled: { bg: "#450a0a", text: "#fca5a5", border: "#991b1b" },
};

/* Statuses a delivery partner is allowed to set */
const DELIVERY_STATUSES = [
  "Delivery Partner Assigned",
  "Picked Up",
  "Start Ride",
  "Reached Location",
  "Waiting for Customer",
  "Out for Delivery",
  "Delivered",
];

const STATUS_ICONS: Record<string, string> = {
  "Delivery Partner Assigned": "🛵",
  "Picked Up": "📦",
  "Start Ride": "🚀",
  "Reached Location": "📍",
  "Waiting for Customer": "⏳",
  "Out for Delivery": "🚚",
  Delivered: "✅",
};

const IN_PROGRESS_STATUSES = [
  "Accepted",
  "Preparing",
  "Food Ready",
  "Packing",
  "Delivery Partner Assigned",
  "Picked Up",
  "Start Ride",
  "Reached Location",
  "Waiting for Customer",
  "Out for Delivery",
];

const fmt = (n: any) =>
  `₹${parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ─── Update Status Modal ──────────────────────────────────────────────── */
function UpdateStatusModal({
  order,
  visible,
  onClose,
  onSaved,
}: {
  order: any;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedStatus || selectedStatus === order?.status) return;
    if (!DELIVERY_STATUSES.includes(selectedStatus)) {
      Alert.alert("Not allowed", "You can only update to a delivery status.");
      return;
    }
    setSaving(true);
    try {
      await updateOrderStatus(order?.id || order?.order_id, selectedStatus);
      onSaved();
      onClose();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to update order status.");
    } finally {
      setSaving(false);
    }
  };

  const allowedStatuses = DELIVERY_STATUSES.filter((s, i, arr) => {
    const currentIdx = arr.indexOf(order?.status);
    return currentIdx === -1 || i >= currentIdx;
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/60"
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        className="bg-white rounded-t-3xl px-6 pt-6 pb-10"
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      >
        {/* Handle */}
        <View className="w-10 h-1 rounded-full bg-gray-200 self-center mb-5" />

        {/* Order Info */}
        <View className="flex-row justify-between items-start mb-5">
          <View>
            <Text className="text-gray-400 text-xs font-semibold">Order</Text>
            <Text className="text-black font-extrabold text-base">
              {order?.order_id || `#${order?.id}`}
            </Text>
          </View>
          <View>
            <Text className="text-gray-400 text-xs font-semibold text-right">
              Amount
            </Text>
            <Text className="text-black font-extrabold text-base text-right">
              {fmt(order?.total_amount)}
            </Text>
          </View>
        </View>

        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
          Update Status
        </Text>

        <ScrollView
          style={{ maxHeight: 320 }}
          showsVerticalScrollIndicator={false}
        >
          {allowedStatuses.map((s) => {
            const isSelected = selectedStatus === s;
            const isCurrent = order?.status === s;
            const currentStyle = STATUS_STYLE[order?.status || "New Order"];
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setSelectedStatus(s)}
                activeOpacity={0.75}
                className={`flex-row items-center justify-between px-5 py-4 rounded-2xl border-2 mb-2 ${
                  isSelected
                    ? "border-primary-darkGreen bg-primary-lightGreen"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-xl mr-3">{STATUS_ICONS[s]}</Text>
                  <Text
                    className={`font-bold text-sm ${isSelected ? "text-primary-darkGreen" : "text-gray-700"}`}
                  >
                    {s}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  {isCurrent && !isSelected && (
                    <View
                      className="px-2 py-0.5 rounded-full mr-2 border"
                      style={{
                        backgroundColor: currentStyle.bg,
                        borderColor: currentStyle.border,
                      }}
                    >
                      <Text
                        className="text-[9px] font-black uppercase"
                        style={{ color: currentStyle.text }}
                      >
                        Current
                      </Text>
                    </View>
                  )}
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      isSelected
                        ? "bg-primary-darkGreen border-primary-darkGreen"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <Feather name="check" size={12} color="white" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          onPress={handleSave}
          disabled={
            saving || !selectedStatus || selectedStatus === order?.status
          }
          className="mt-5 bg-primary-darkGreen py-4 rounded-2xl items-center"
          style={{
            opacity:
              saving || !selectedStatus || selectedStatus === order?.status
                ? 0.5
                : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-extrabold text-sm">
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

/* ─── Filter tabs with their exact colors ───────────────────────────────── */
const FILTER_TABS = [
  {
    label: "All",
    status: "All",
    bg: "#1e293b",
    text: "#94a3b8",
    border: "#334155",
  },
  {
    label: "Assigned",
    status: "Delivery Partner Assigned",
    bg: "#083344",
    text: "#67e8f9",
    border: "#155e75",
  },
  {
    label: "Picked Up",
    status: "Picked Up",
    bg: "#082f49",
    text: "#7dd3fc",
    border: "#075985",
  },
  {
    label: "Start Ride",
    status: "Start Ride",
    bg: "#172554",
    text: "#93c5fd",
    border: "#1e40af",
  },
  {
    label: "Reached",
    status: "Reached Location",
    bg: "#4a044e",
    text: "#f0abfc",
    border: "#86198f",
  },
  {
    label: "Waiting",
    status: "Waiting for Customer",
    bg: "#451a03",
    text: "#fcd34d",
    border: "#92400e",
  },
  {
    label: "Out for Delivery",
    status: "Out for Delivery",
    bg: "#1e1b4b",
    text: "#a5b4fc",
    border: "#3730a3",
  },
  {
    label: "Delivered",
    status: "Delivered",
    bg: "#022c22",
    text: "#6ee7b7",
    border: "#065f46",
  },
];

/* ─── Main Orders Screen ───────────────────────────────────────────────── */
export default function Orders() {
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [editingOrder, setEditingOrder] = useState<any>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setError("");
      const data = await getMyOrders();
      const list = Array.isArray(data) ? data : data?.orders || [];
      setOrders(list);
    } catch (err: any) {
      setError(err?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = activeStatus === "All" || o.status === activeStatus;
    const searchLower = searchQuery.toLowerCase();
    const id = String(o.id || o.order_id || "");
    const customer = String(o.customer_name || "").toLowerCase();
    const phone = String(o.customer_phone || "").toLowerCase();
    const matchesSearch =
      !searchLower ||
      id.includes(searchLower) ||
      customer.includes(searchLower) ||
      phone.includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  return (
    <SafeAreaView
      className="flex-1 bg-background-main"
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <TopHeader title="My Orders" />

      {/* Update Status Modal */}
      {editingOrder && (
        <UpdateStatusModal
          order={editingOrder}
          visible={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={fetchOrders}
        />
      )}

      {/* Search Bar */}
      <View className="px-6 pt-4 pb-2">
        <View
          className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm"
          style={{ elevation: 2 }}
        >
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            className="flex-1 ml-3 text-sm text-gray-800 font-semibold"
            placeholder="Search by Order ID, Name, or Phone..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              activeOpacity={0.7}
            >
              <Feather name="x-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Scrollable Status Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 4,
          alignItems: "center",
        }}
        className="mb-3"
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeStatus === tab.status;
          const count =
            tab.status === "All"
              ? orders.length
              : orders.filter((o) => o.status === tab.status).length;
          return (
            <TouchableOpacity
              key={tab.status}
              onPress={() => setActiveStatus(tab.status)}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 999,
                borderWidth: 1.5,
                backgroundColor: isActive ? tab.bg : "#F8FAFC",
                borderColor: isActive ? tab.border : "#E2E8F0",
                marginRight: 8,
                alignSelf: "center",
              }}
            >
              <Text
                style={{
                  color: isActive ? tab.text : "#64748B",
                  fontWeight: "800",
                  fontSize: 11,
                  letterSpacing: 0.3,
                }}
              >
                {tab.label}
                {count > 0 ? ` (${count})` : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary.darkGreen} />
          <Text className="text-gray-400 mt-3 text-sm">Loading orders…</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Feather name="wifi-off" size={48} color="#CBD5E1" />
          <Text className="text-gray-400 mt-4 text-sm font-semibold text-center">
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchOrders}
            className="mt-5 bg-primary-darkGreen px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-bold text-sm">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary.darkGreen}
            />
          }
        >
          <View className="px-6 pb-24">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, i) => (
                <OrderCard
                  key={order.id || order.order_id || i}
                  order={order}
                  onEdit={() => setEditingOrder(order)}
                />
              ))
            ) : (
              <View className="items-center mt-16">
                <Feather name="inbox" size={52} color="#CBD5E1" />
                <Text className="text-gray-400 mt-4 font-semibold text-sm">
                  No orders
                  {activeStatus !== "All" ? ` for "${activeStatus}"` : ""}.
                </Text>
                <Text className="text-gray-300 mt-1 text-xs">
                  Pull down to refresh
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <BottomBar activeTab="orders" />
    </SafeAreaView>
  );
}

/* ─── Order Card ───────────────────────────────────────────────────────── */
function OrderCard({ order, onEdit }: { order: any; onEdit: () => void }) {
  const router = useRouter();
  const status = order.status || "";
  const style = STATUS_STYLE[status] || STATUS_STYLE["New Order"];

  const orderId = order.order_id || `#${order.id}` || "—";
  const customer = order.customer_name || "Customer";
  const phone = order.customer_phone || "";
  const time = order.ordered_at
    ? new Date(order.ordered_at).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
  const price = fmt(order.total_amount);
  const address =
    [order.street_address, order.city, order.district, order.state]
      .filter(Boolean)
      .join(", ") ||
    order.delivery_address ||
    "—";
  const payment = order.payment_method || "COD";

  const canUpdate =
    DELIVERY_STATUSES.includes(status) &&
    status !== "Delivered" &&
    status !== "Cancelled";

  const handleViewDetails = () => {
    router.push({
      pathname: "/order-details",
      params: {
        orderId: String(order.id || order.order_id || ""),
        status: String(order.status || "New Order"),
        amount: String(order.total_amount || "0"),
        pickup: String(
          order.pickup_address ||
            order.restaurant_address ||
            "Restaurant address",
        ),
        drop: String(
          order.delivery_address || order.street_address || "Customer address",
        ),
        payment: String(order.payment_method || "COD"),
        customer: String(order.customer_name || "Customer"),
      },
    });
  };

  return (
    <View className="mb-3.5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm shadow-green-900/10">
      <View
        className="flex-row items-center justify-between px-[18px] py-[14px]"
        style={{ backgroundColor: Colors.primary.darkGreen }}
      >
        <View className="flex-row items-center">
          <View className="mr-2.5 h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <Feather name="shopping-bag" size={16} color="white" />
          </View>
          <View>
            <Text className="text-[13px] font-black text-white">{orderId}</Text>
            <Text className="mt-0.5 text-[10px] text-white/70">
              {customer} · {time}
            </Text>
          </View>
        </View>

        <View className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5">
          <Text className="text-center text-[15px] font-black text-white">
            {price}
          </Text>
          <Text className="text-center text-[9px] text-white/60">
            {payment}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-end px-[10px] py-3">
        <View
          className="flex-row items-center rounded-full border px-3 py-1.5"
          style={{
            backgroundColor: style.bg + "20",
            borderColor: style.border,
          }}
        >
          <View
            className="mr-2 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "#000000" }}
          />
          <Text
            className="text-[11px] font-extrabold uppercase tracking-[1px]"
            style={{ color: "#000000" }}
          >
            {status}
          </Text>
        </View>
      </View>

      <View className="px-[18px] pb-1 pt-4">
        <View className="mb-4 flex-row items-start">
          <View className="mr-2.5 w-6 items-center">
            <View className="mt-0.5 h-3 w-3 rounded-full bg-red-500" />
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-[9px] font-extrabold uppercase tracking-[1px] text-slate-400">
              Delivery Address
            </Text>
            <Text className="text-[13px] font-semibold leading-5 text-slate-800">
              {address}
            </Text>
            {phone ? (
              <View className="mt-1 flex-row items-center">
                <Feather name="phone" size={10} color="#64748B" />
                <Text className="ml-1 text-[11px] font-semibold text-slate-500">
                  {phone}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View className="px-[18px] pb-4">
        {status !== "Delivered" && status !== "Cancelled" ? (
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              onPress={handleViewDetails}
              activeOpacity={0.85}
              className="flex-1 flex-row items-center justify-center rounded-2xl border border-[#1E4D3B] bg-[#F0FDF4] px-3 py-3"
            >
              <Feather name="eye" size={14} color={Colors.primary.darkGreen} />
              <Text className="ml-2 text-[13px] font-extrabold text-[#1E4D3B]">
                View Or
              </Text>
            </TouchableOpacity>

            {canUpdate && (
              <TouchableOpacity
                onPress={onEdit}
                activeOpacity={0.85}
                className="flex-1 flex-row items-center justify-center rounded-2xl border px-3 py-3"
                style={{
                  backgroundColor: style.bg,
                  borderColor: style.border,
                }}
              >
                <Feather name="refresh-cw" size={14} color={style.text} />
                <Text
                  className="ml-2 text-[13px] font-extrabold"
                  style={{ color: style.text }}
                >
                  Update
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/track-order",
                  params: { orderId: order.id },
                })
              }
              activeOpacity={0.85}
              className={`flex-row items-center justify-center rounded-2xl bg-[#1E4D3B] px-3 py-3 ${
                canUpdate ? "flex-[0.8]" : "flex-1"
              }`}
            >
              <Feather name="navigation" size={14} color="white" />
              <Text className="ml-2 text-[13px] font-extrabold text-white">
                Track
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );
}
