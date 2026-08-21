import React, { useState, useEffect, useRef } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from "react-native";
import { getAvailableOrders, assignOrder, cancelOrder, getStoredUser } from "../../api";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
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
        require("../../assets/notification.mp3") // Make sure to add a sound file or ignore if not present.  We'll use a generic approach.
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
      const allOrders = Array.isArray(response) ? response : response?.orders || [];
      
      const pendingOrders = allOrders.filter(
        (o: any) => o.status === "Searching Delivery Partner"
      );

      // Find the first order that hasn't been shown yet
      const nextOrder = pendingOrders.find((o: any) => !shownOrderIds.has(o.id));

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
        Alert.alert("Permission Denied", "Location permission is required to accept orders.");
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
        location_name: reverseGeocode.length > 0 ? `${reverseGeocode[0].city}, ${reverseGeocode[0].region}` : "Unknown Location"
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
        <View className="flex-1 justify-center items-center bg-black/60 p-5">
          <View className="bg-white rounded-3xl w-full p-6 shadow-xl border border-gray-100">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-primary-lightGreen items-center justify-center mb-3">
                <Feather name="bell" size={28} color={Colors.primary.darkGreen} />
              </View>
              <Text className="text-xl font-extrabold text-black">New Order Available!</Text>
              <Text className="text-sm text-gray-500 mt-1 text-center">
                A new delivery order is waiting for you.
              </Text>
            </View>

            {popupOrder && (
              <View className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="font-extrabold text-black">Order #{popupOrder.order_id || popupOrder.id}</Text>
                  <Text className="font-extrabold text-primary-darkGreen text-lg">
                    ₹{popupOrder.total_amount}
                  </Text>
                </View>
                
                <View className="mt-2 space-y-2">
                   <View className="flex-row items-start">
                     <Feather name="map-pin" size={14} color={Colors.primary.darkGreen} style={{ marginTop: 2 }} />
                     <View className="ml-2 flex-1">
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pickup</Text>
                        <Text className="text-sm font-semibold text-gray-700">{popupOrder.pickup_address || popupOrder.restaurant_address || "Restaurant Address"}</Text>
                     </View>
                   </View>
                   <View className="flex-row items-start mt-2">
                     <Feather name="map-pin" size={14} color="#dc2626" style={{ marginTop: 2 }} />
                     <View className="ml-2 flex-1">
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dropoff</Text>
                        <Text className="text-sm font-semibold text-gray-700">{popupOrder.delivery_address || popupOrder.street_address || "Customer Address"}</Text>
                     </View>
                   </View>
                </View>
              </View>
            )}

            <View className="space-y-3">
              <TouchableOpacity
                onPress={handleAcceptOrder}
                disabled={loading}
                className="bg-primary-darkGreen rounded-2xl py-4 items-center flex-row justify-center"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Feather name="check" size={18} color="white" />
                    <Text className="text-white font-extrabold text-sm ml-2">Accept Order</Text>
                  </>
                )}
              </TouchableOpacity>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleSkipOrder}
                  disabled={loading}
                  className="flex-1 bg-red-50 border border-red-200 rounded-2xl py-4 items-center"
                >
                  <Text className="text-red-600 font-bold text-sm">Skip Order</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNextOrder}
                  disabled={loading}
                  className="flex-1 bg-gray-100 border border-gray-200 rounded-2xl py-4 items-center"
                >
                  <Text className="text-gray-700 font-bold text-sm">Next Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Modal */}
      <Modal visible={showRejectModal} transparent animationType="fade">
         <View className="flex-1 justify-center items-center bg-black/60 p-5">
           <View className="bg-white rounded-3xl w-full p-6">
             <Text className="text-lg font-extrabold text-black mb-1">Skip Order</Text>
             <Text className="text-sm text-gray-500 mb-4">Please provide a reason for skipping this order.</Text>
             
             <Text className="text-xs font-bold text-gray-700 mb-1">Reason *</Text>
             <TextInput
               className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm text-black"
               placeholder="e.g. Too far, Vehicle issue"
               value={rejectReason}
               onChangeText={setRejectReason}
             />

             <Text className="text-xs font-bold text-gray-700 mb-1">Additional Notes (Optional)</Text>
             <TextInput
               className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5 text-sm text-black"
               placeholder="Any details..."
               value={rejectNotes}
               onChangeText={setRejectNotes}
               multiline
               numberOfLines={3}
               textAlignVertical="top"
             />

             <View className="flex-row gap-3">
               <TouchableOpacity
                 onPress={() => setShowRejectModal(false)}
                 disabled={rejecting}
                 className="flex-1 bg-gray-100 rounded-2xl py-3.5 items-center"
               >
                 <Text className="text-gray-700 font-bold text-sm">Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 onPress={submitReject}
                 disabled={rejecting}
                 className="flex-1 bg-red-600 rounded-2xl py-3.5 items-center"
               >
                 {rejecting ? (
                   <ActivityIndicator color="white" />
                 ) : (
                   <Text className="text-white font-bold text-sm">Submit</Text>
                 )}
               </TouchableOpacity>
             </View>
           </View>
         </View>
      </Modal>
    </>
  );
}
