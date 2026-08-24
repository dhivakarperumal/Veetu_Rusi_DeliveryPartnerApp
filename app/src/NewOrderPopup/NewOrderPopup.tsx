import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  assignOrder,
  cancelOrder,
  getAvailableOrders,
  getStoredUser,
} from "../../api";
import { Colors } from "../../src/constants/Colors";

export default function NewOrderPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupOrder, setPopupOrder] = useState<any>(null);
  const [shownOrderIds, setShownOrderIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  // Reject Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const router = useRouter();
  const soundRef = useRef<Audio.Sound | null>(null);

  // Play notification sound
  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/notification.mp3"), // Make sure to add a sound file or ignore if not present.  We'll use a generic approach.
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.log("Error playing sound", e);
    }
  };

  const fetchPendingOrders = async () => {
    if (showPopup || showRejectModal) return; // Don't fetch if currently showing a popup

    try {
      const response = await getAvailableOrders();
      const allOrders = Array.isArray(response)
        ? response
        : response?.orders || [];

      const pendingOrders = allOrders.filter(
        (o: any) => o.status === "Searching Delivery Partner",
      );

      // Find the first order that hasn't been shown yet
      const nextOrder = pendingOrders.find(
        (o: any) => !shownOrderIds.has(o.id),
      );

      if (nextOrder) {
        setPopupOrder(nextOrder);
        setShowPopup(true);
        // playSound(); // Uncomment if sound file is added
      }
    } catch (error) {
      console.log("Error fetching available orders:", error);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 9000);
    return () => clearInterval(interval);
  }, [shownOrderIds, showPopup, showRejectModal]);

  const handleSkipOrder = () => {
    setShowPopup(false);
    setShowRejectModal(true);
  };

  const handleNextOrder = () => {
    if (popupOrder) {
      setShownOrderIds((prev) => new Set(prev).add(popupOrder.id));
    }
    setShowPopup(false);
  };

  const handleAcceptOrder = async () => {
    if (!popupOrder) return;
    setLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to accept orders.",
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      // Reverse geocoding (Nominatim or Expo's reverseGeocodeAsync)
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const user = await getStoredUser();

      const payload = {
        delivery_partner: user?.id || user?.user_id, // Adjust based on your user object
        status: "Delivery Partner Assigned",
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        location_name:
          reverseGeocode.length > 0
            ? `${reverseGeocode[0].city}, ${reverseGeocode[0].region}`
            : "Unknown Location",
      };

      await assignOrder(popupOrder.id, payload);

      setShownOrderIds((prev) => new Set(prev).add(popupOrder.id));
      setShowPopup(false);
      Alert.alert("Success", "Order accepted successfully!");
      router.push("/orders");
    } catch (error: any) {
      console.error("Accept Error:", error);
      Alert.alert("Error", error?.message || "Failed to accept order.");
    } finally {
      setLoading(false);
    }
  };

  const submitReject = async () => {
    if (!popupOrder) return;
    if (!rejectReason) {
      Alert.alert("Validation", "Please provide a reason for skipping.");
      return;
    }

    setRejecting(true);
    try {
      await cancelOrder(popupOrder.id, rejectReason, rejectNotes);
      setShownOrderIds((prev) => new Set(prev).add(popupOrder.id));
      setShowRejectModal(false);
      setRejectReason("");
      setRejectNotes("");
    } catch (error: any) {
      console.error("Reject Error:", error);
      Alert.alert("Error", error?.message || "Failed to skip order.");
    } finally {
      setRejecting(false);
    }
  };

  if (!showPopup && !showRejectModal) return null;

  return (
    <>
      <Modal visible={showPopup} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/70 px-4">
          <View className="bg-white rounded-3xl w-full shadow-2xl overflow-hidden">
            {/* Header Section */}
            <View className="bg-gradient-to-b from-primary-lightGreen to-white pt-8 pb-6 px-6 items-center">
              <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-4 shadow-lg border-4 border-primary-lightGreen">
                <Feather
                  name="bell"
                  size={32}
                  color={Colors.primary.brandGreen}
                />
              </View>
              <Text className="text-2xl font-extrabold text-primary-darkGreen text-center">
                New Order Available!
              </Text>
              <Text className="text-sm text-gray-600 mt-2 text-center font-medium">
                A new delivery order is waiting for you.
              </Text>
            </View>

            {/* Order Details Card */}
            {popupOrder && (
              <View className="mx-6 mt-6 mb-6">
                <View className="bg-gradient-to-br from-primary-lightGreen/40 to-primary-lightGreen/20 rounded-2xl p-5 border border-primary-lightGreen/50">
                  {/* Order Header */}
                  <View className="flex-row justify-between items-start mb-4 pb-4 border-b border-primary-lightGreen/30">
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-primary-darkGreen/70 uppercase tracking-widest mb-1">
                        Order ID
                      </Text>
                      <Text className="text-lg font-extrabold text-primary-darkGreen">
                        #{popupOrder.order_id || popupOrder.id}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs font-bold text-accent-golden uppercase tracking-widest mb-1">
                        Amount
                      </Text>
                      <Text className="text-xl font-extrabold text-accent-golden">
                        ₹{popupOrder.total_amount}
                      </Text>
                    </View>
                  </View>

                  {/* Location Details */}
                  <View className="space-y-3">
                    {/* Pickup Location */}
                    <View className="flex-row items-start">
                      <View className="w-6 h-6 rounded-full bg-primary-brandGreen items-center justify-center flex-shrink-0 mt-0.5">
                        <Feather name="map-pin" size={12} color="white" />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                          Pickup Point
                        </Text>
                        <Text className="text-sm font-semibold text-gray-800 leading-snug">
                          {popupOrder.pickup_address ||
                            popupOrder.restaurant_address ||
                            "Restaurant Address"}
                        </Text>
                      </View>
                    </View>

                    {/* Visual Divider */}
                    <View className="flex-row items-center my-1">
                      <View className="flex-1 h-px bg-primary-lightGreen/50" />
                      <View className="mx-2 w-1 h-1 rounded-full bg-primary-brandGreen" />
                      <View className="flex-1 h-px bg-primary-lightGreen/50" />
                    </View>

                    {/* Dropoff Location */}
                    <View className="flex-row items-start">
                      <View className="w-6 h-6 rounded-full bg-status-error items-center justify-center flex-shrink-0 mt-0.5">
                        <Feather name="map-pin" size={12} color="white" />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                          Dropoff Point
                        </Text>
                        <Text className="text-sm font-semibold text-gray-800 leading-snug">
                          {popupOrder.delivery_address ||
                            popupOrder.street_address ||
                            "Customer Address"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="px-6 pb-6 space-y-3">
              {/* Accept Button - Primary CTA */}
              <TouchableOpacity
                onPress={handleAcceptOrder}
                disabled={loading}
                className={`rounded-2xl py-4 items-center justify-center flex-row ${
                  loading ? "bg-primary-darkGreen/70" : "bg-primary-brandGreen"
                } shadow-lg`}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Feather name="check-circle" size={20} color="white" />
                    <Text className="text-white font-extrabold text-base ml-2">
                      Accept Order
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Secondary Actions */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleSkipOrder}
                  disabled={loading}
                  className="flex-1 bg-status-errorLight border-2 border-status-error rounded-2xl py-3.5 items-center justify-center"
                >
                  <Text className="text-status-error font-extrabold text-sm">
                    Skip Order
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNextOrder}
                  disabled={loading}
                  className="flex-1 bg-gray-100 border-2 border-gray-300 rounded-2xl py-3.5 items-center justify-center"
                >
                  <Text className="text-gray-700 font-extrabold text-sm">
                    Next Order
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Modal */}
      <Modal visible={showRejectModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/70 px-4">
          <View className="bg-white rounded-3xl w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <View className="bg-gradient-to-b from-status-errorLight to-white pt-6 pb-4 px-6 border-b border-status-error/20">
              <View className="flex-row items-center mb-2">
                <Feather
                  name="alert-circle"
                  size={24}
                  color={Colors.status.error}
                />
                <Text className="text-xl font-extrabold text-gray-900 ml-3">
                  Skip Order
                </Text>
              </View>
              <Text className="text-sm text-gray-600 font-medium">
                Please let us know why you're skipping this order.
              </Text>
            </View>

            {/* Content */}
            <View className="p-6">
              {/* Reason Field */}
              <View className="mb-5">
                <Text className="text-xs font-extrabold text-gray-700 uppercase tracking-widest mb-2 flex-row">
                  Reason <Text className="text-status-error">*</Text>
                </Text>
                <TextInput
                  className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 font-medium"
                  placeholder="e.g., Too far, Vehicle issue"
                  placeholderTextColor="#999"
                  value={rejectReason}
                  onChangeText={setRejectReason}
                />
              </View>

              {/* Additional Notes Field */}
              <View className="mb-6">
                <Text className="text-xs font-extrabold text-gray-700 uppercase tracking-widest mb-2">
                  Additional Notes (Optional)
                </Text>
                <TextInput
                  className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 font-medium"
                  placeholder="Share any additional details..."
                  placeholderTextColor="#999"
                  value={rejectNotes}
                  onChangeText={setRejectNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowRejectModal(false)}
                  disabled={rejecting}
                  className="flex-1 bg-gray-100 border-2 border-gray-300 rounded-2xl py-3.5 items-center justify-center"
                >
                  <Text className="text-gray-700 font-extrabold text-sm">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submitReject}
                  disabled={rejecting}
                  className={`flex-1 rounded-2xl py-3.5 items-center justify-center ${
                    rejecting ? "bg-status-error/70" : "bg-status-error"
                  }`}
                >
                  {rejecting ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-extrabold text-sm">
                      Submit
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
