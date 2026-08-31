import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Image,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../../src/constants/Colors";
import { getMyOrders, getStoredUser, logoutUser } from "../../api";

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
  const [assignedOrders, setAssignedOrders] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

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

  const loadAssignedOrders = async () => {
    setLoadingNotifications(true);
    try {
      const response = await getMyOrders("All");
      const orders = Array.isArray(response)
        ? response
        : response?.orders || [];
      setAssignedOrders(
        orders.filter((order: any) => isToday(order) && isAssignedOrder(order)),
      );
    } catch (error) {
      console.log("Error loading assigned order notifications:", error);
      setAssignedOrders([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadAssignedOrders();
    const interval = setInterval(loadAssignedOrders, 15000);
    return () => clearInterval(interval);
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
      className="px-6 pb-4 z-50"
      style={{
        paddingTop: Math.max(insets.top + 8, 20),
        backgroundColor: Colors.primary.darkGreen,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center justify-between mt-1">
        <View className="flex-row items-center">
          <View className="w-11 h-11 rounded-2xl bg-white items-center justify-center mr-3 overflow-hidden border border-white/40">
            <Image
              source={require("../../../assets/images/logo.png")}
              className="w-10 h-10"
              resizeMode="contain"
            />
          </View>
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
              <Text className="text-white font-bold text-lg">
                {userName} 👋
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center">
          {/* Notifications */}
          <View>
            <TouchableOpacity
              onPress={() => {
                setShowNotifMenu(true);
                loadAssignedOrders();
              }}
            >
              <Feather name="bell" size={24} color="white" />
              {assignedOrders.length > 0 && (
                <View className="absolute -top-1 -right-2 min-w-4 h-4 px-1 bg-red-500 rounded-full border-2 border-primary-darkGreen items-center justify-center">
                  <Text className="text-white text-[9px] font-bold">
                    {assignedOrders.length > 9 ? "9+" : assignedOrders.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Notifications Dropdown */}
            <Modal visible={showNotifMenu} transparent animationType="fade">
              <Pressable
                className="flex-1"
                onPress={() => setShowNotifMenu(false)}
              >
                <View className="absolute top-[80px] right-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64">
                  <Text className="font-bold text-black mb-2">
                    Notifications
                  </Text>
                  {loadingNotifications ? (
                    <Text className="text-xs text-gray-500 py-3">
                      Loading assigned orders...
                    </Text>
                  ) : assignedOrders.length === 0 ? (
                    <Text className="text-xs text-gray-500 py-3">
                      No assigned orders today.
                    </Text>
                  ) : (
                    assignedOrders.map((order) => (
                      <TouchableOpacity
                        key={getOrderId(order)}
                        className="py-2 border-b border-gray-50"
                        onPress={() => {
                          setShowNotifMenu(false);
                          router.push({
                            pathname: "/order-details",
                            params: {
                              orderId: String(getOrderId(order)),
                              status: String(
                                order.status ||
                                  order.order_status ||
                                  "Delivery Partner Assigned",
                              ),
                            },
                          });
                        }}
                      >
                        <Text className="text-sm font-medium text-black">
                          Order #{getOrderId(order)} assigned
                        </Text>
                        <Text className="text-xs text-gray-500 mt-1">
                          {order.delivery_address ||
                            order.street_address ||
                            "Open order details"}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
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
              <Text className="text-primary-darkGreen font-bold text-lg">
                {firstLetter}
              </Text>
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
                    <Text className="font-bold text-black text-sm">
                      {userName}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-0.5">
                      Delivery Partner
                    </Text>
                  </View>

                  <TouchableOpacity
                    className="flex-row items-center p-3 border-b border-gray-50"
                    onPress={handleProfile}
                  >
                    <Feather
                      name="user"
                      size={18}
                      color={Colors.primary.darkGreen}
                    />
                    <Text className="ml-3 font-semibold text-black">
                      Profile
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row items-center p-3"
                    onPress={handleLogout}
                  >
                    <Feather
                      name="log-out"
                      size={18}
                      color={Colors.status.error}
                    />
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

function getOrderId(order: any) {
  return order.id ?? order.order_id;
}

function isAssignedOrder(order: any) {
  const status = String(order.status || order.order_status || "")
    .toLowerCase()
    .replace(/[-_]+/g, " ");
  return status === "delivery partner assigned";
}

function isToday(order: any) {
  const value =
    order.assigned_at ||
    order.assignedAt ||
    order.updated_at ||
    order.created_at ||
    order.order_date ||
    order.createdAt;
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}
