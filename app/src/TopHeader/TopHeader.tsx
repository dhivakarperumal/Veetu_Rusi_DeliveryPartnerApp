import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Image,
    Linking,
    Modal,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../../src/constants/Colors";
import {
    getDeliveryAttendance,
    getMyOrders,
    getStoredUser,
    logoutUser,
    markDeliveryAttendance,
} from "../../api";
import { useCustomAlert } from "../CustomAlert/CustomAlert";

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
  const [currentSession, setCurrentSession] = useState<any | null>(null);
  const [attendanceLoaded, setAttendanceLoaded] = useState(false);
  const [attendanceError, setAttendanceError] = useState(false);
  const [attendanceChanging, setAttendanceChanging] = useState(false);
  const isMountedRef = useRef(true);
  const { showAlert, alert } = useCustomAlert();

  const refreshAttendance = useCallback(async () => {
    try {
      const data = await getDeliveryAttendance();
      if (!isMountedRef.current) return false;
      setCurrentSession(data?.currentSession || null);
      setAttendanceLoaded(true);
      setAttendanceError(false);
      return true;
    } catch {
      if (isMountedRef.current) {
        setAttendanceLoaded(true);
        setAttendanceError(true);
      }
      return false;
    }
  }, []);

  // Load logged-in user from storage
  useEffect(() => {
    isMountedRef.current = true;

    const loadUser = async () => {
      const user = await getStoredUser();
      if (!isMountedRef.current) return;

      if (user?.name) {
        setUserName(user.name);
      } else if (user?.email) {
        setUserName(user.email.split("@")[0]);
      }
    };

    void loadUser();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const timeoutId = setTimeout(() => void refreshAttendance(), 0);
    const interval = setInterval(() => void refreshAttendance(), 15000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [refreshAttendance]);

  const loadAssignedOrders = async () => {
    setLoadingNotifications(true);
    try {
      const response = await getMyOrders("All");
      const orders = Array.isArray(response)
        ? response
        : response?.orders || [];

      if (!isMountedRef.current) return;

      setAssignedOrders(
        orders.filter((order: any) => isToday(order) && isAssignedOrder(order)),
      );
    } catch {
      if (isMountedRef.current) {
        setAssignedOrders([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingNotifications(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    const startLoad = () => {
      void loadAssignedOrders();
    };
    const timeoutId = setTimeout(startLoad, 0);
    const interval = setInterval(startLoad, 15000);
    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
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

  const updateAttendance = async () => {
    const action = currentSession ? "check_out" : "check_in";
    setAttendanceChanging(true);
    try {
      let location = {};
      if (action === "check_in") {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") {
          const buttons: {
            text: string;
            style?: "default" | "cancel" | "destructive";
            onPress?: () => void;
          }[] = [{ text: "Cancel", style: "cancel" }];
          if (!permission.canAskAgain) {
            buttons.push({
              text: "Open Settings",
              style: "default",
              onPress: () => void Linking.openSettings(),
            });
          }
          showAlert(
            "Location permission needed",
            "Allow location access to check in and receive delivery orders.",
            buttons,
            "warning",
          );
          return;
        }

        if (!(await Location.hasServicesEnabledAsync())) {
          if (Platform.OS === "android") {
            try {
              await Location.enableNetworkProviderAsync();
            } catch {
              throw new Error("Location must be turned on before you can check in.");
            }
          } else if (Platform.OS === "ios") {
            showAlert(
              "Location is turned off",
              "Turn on Location Services in device settings, then return and try again.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Open Settings",
                  onPress: () => void Linking.openSettings(),
                },
              ],
              "warning",
            );
            return;
          } else {
            throw new Error("Turn on device location services and try again.");
          }
        }

        if (!(await Location.hasServicesEnabledAsync())) {
          throw new Error("Location is still off. Turn it on and try again.");
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? undefined,
        };
      }

      await markDeliveryAttendance(action, location);
      await refreshAttendance();
      showAlert(
        "Attendance updated",
        action === "check_in"
          ? "You are online and ready to receive delivery orders."
          : "You are offline. Your attendance session has ended.",
        [{ text: "Done" }],
        "success",
      );
    } catch (error: any) {
      if (error?.response?.status === 409) {
        await refreshAttendance();
      }
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update attendance. Please try again.";
      showAlert("Attendance not updated", message, [{ text: "OK" }], "error");
    } finally {
      setAttendanceChanging(false);
    }
  };

  const confirmAttendanceChange = () => {
    if (!attendanceLoaded || attendanceError) {
      void refreshAttendance();
      return;
    }

    const checkingOut = Boolean(currentSession);
    showAlert(
      checkingOut ? "Go offline?" : "Go online?",
      checkingOut
        ? "Check out and end your current delivery session?"
        : "Check in with your current location and start receiving delivery orders?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: checkingOut ? "Check out" : "Check in",
          style: checkingOut ? "destructive" : "default",
          onPress: () => void updateAttendance(),
        },
      ],
      checkingOut ? "warning" : "info",
    );
  };

  const attendanceStatusLabel = !attendanceLoaded
    ? "Checking status"
    : attendanceError
      ? "Status unavailable"
      : currentSession
        ? `Online since ${formatTime(currentSession.check_in_at)}`
        : "Offline · not receiving orders";

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
      <View className="mt-3 flex-row items-center justify-between rounded-xl border border-white/10 bg-white/10 px-3 py-2.5">
        <View className="min-w-0 flex-1 flex-row items-center pr-2">
          <View
            className={`h-2.5 w-2.5 rounded-full ${currentSession ? "bg-emerald-400" : "bg-gray-400"}`}
          />
          <Text
            numberOfLines={1}
            className={`ml-2 flex-1 text-[10px] font-bold ${currentSession ? "text-emerald-100" : "text-white/75"}`}
          >
            {attendanceStatusLabel}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            attendanceError
              ? "Retry attendance status"
              : currentSession
                ? "Check out and go offline"
                : "Check in and go online"
          }
          disabled={!attendanceLoaded || attendanceChanging}
          onPress={attendanceError ? () => void refreshAttendance() : confirmAttendanceChange}
          activeOpacity={0.8}
          className={`min-h-9 flex-row items-center justify-center rounded-lg px-3 ${attendanceError ? "bg-white/15" : currentSession ? "bg-red-500/20" : "bg-emerald-500/20"} ${!attendanceLoaded || attendanceChanging ? "opacity-50" : ""}`}
        >
          {attendanceChanging ? (
            <Feather name="loader" size={14} color="white" />
          ) : (
            <Feather
              name={attendanceError ? "refresh-cw" : currentSession ? "log-out" : "log-in"}
              size={14}
              color="white"
            />
          )}
          <Text className="ml-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
            {attendanceError
              ? "Retry"
              : attendanceChanging
                ? "Updating"
                : currentSession
                  ? "Go offline"
                  : "Go online"}
          </Text>
        </TouchableOpacity>
      </View>
      {alert}
    </View>
  );
}

function formatTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
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
