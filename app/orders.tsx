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
  Delivered: { bg: "#022c22", text: "#6ee7b7", border: "#065f46" },
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
                    <View className="bg-gray-200 px-2 py-0.5 rounded-full mr-2">
                      <Text className="text-gray-500 text-[9px] font-black uppercase">
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

  const filteredOrders =
    activeStatus === "All"
      ? orders
      : orders.filter((o) => o.status === activeStatus);

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
        className="mt-3 mb-3"
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

  return (
    <View className="bg-white rounded-3xl shadow-sm border border-gray-50 mb-4 overflow-hidden">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-5 pb-4 border-b border-gray-50">
        <View>
          <Text className="font-extrabold text-black text-sm">{orderId}</Text>
          <Text className="text-gray-400 text-xs mt-0.5">{time}</Text>
        </View>
        <View
          className="px-3 py-1.5 rounded-full border"
          style={{ backgroundColor: style.bg, borderColor: style.border }}
        >
          <Text
            style={{ color: style.text }}
            className="font-extrabold text-[9px] uppercase tracking-widest"
          >
            {status}
          </Text>
        </View>
      </View>

      {/* Customer */}
      <View className="px-5 py-4 border-b border-gray-50">
        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-2xl bg-gray-100 items-center justify-center mr-3">
            <Text className="text-gray-600 font-extrabold text-sm">
              {customer.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text className="text-black font-bold text-sm">{customer}</Text>
            {phone ? (
              <Text className="text-gray-400 text-xs mt-0.5">{phone}</Text>
            ) : null}
          </View>
        </View>

        {address !== "—" && (
          <View className="flex-row items-start mt-3 bg-gray-50 rounded-2xl px-4 py-3">
            <Feather
              name="map-pin"
              size={13}
              color={Colors.primary.darkGreen}
              style={{ marginTop: 2 }}
            />
            <Text className="text-gray-600 text-xs ml-2 flex-1 leading-5">
              {address}
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View className="px-5 pt-3 pb-5">
        {/* Price row */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-black font-extrabold text-2xl">{price}</Text>
            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              {payment}
            </Text>
          </View>
          {/* Delivered badge */}
          {status === "Delivered" && (
            <View className="flex-row items-center bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <Feather name="check-circle" size={13} color="#059669" />
              <Text className="text-emerald-700 font-bold text-xs ml-1.5">
                Delivered
              </Text>
            </View>
          )}
          {status === "Cancelled" && (
            <View className="flex-row items-center bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
              <Feather name="x-circle" size={13} color="#dc2626" />
              <Text className="text-red-600 font-bold text-xs ml-1.5">
                Cancelled
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons Row */}
        {status !== "Delivered" && status !== "Cancelled" && (
          <View className="flex-row" style={{ gap: 10 }}>
            {/* Update Status Button */}
            {DELIVERY_STATUSES.includes(status) && (
              <TouchableOpacity
                onPress={onEdit}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: style.bg,
                  borderColor: style.border,
                  borderWidth: 1.5,
                  paddingVertical: 13,
                  borderRadius: 16,
                  gap: 7,
                }}
              >
                <Feather name="refresh-cw" size={14} color={style.text} />
                <Text
                  style={{
                    color: style.text,
                    fontWeight: "800",
                    fontSize: 12,
                    letterSpacing: 0.3,
                  }}
                >
                  Update Status
                </Text>
              </TouchableOpacity>
            )}

            {/* Track Button */}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/track-order",
                  params: { orderId: order.id },
                })
              }
              activeOpacity={0.85}
              style={{
                flex: DELIVERY_STATUSES.includes(status) ? 0.6 : 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: Colors.primary.darkGreen,
                paddingVertical: 13,
                borderRadius: 16,
                gap: 7,
              }}
            >
              <Feather name="navigation" size={14} color="white" />
              <Text
                style={{
                  color: "white",
                  fontWeight: "800",
                  fontSize: 12,
                  letterSpacing: 0.3,
                }}
              >
                Track
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
