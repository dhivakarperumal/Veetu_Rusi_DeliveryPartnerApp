import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { getStoredUser } from "./api";

export default function Documents() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView
      className="flex-1 bg-background-main"
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View
        className="px-6 pb-5 z-50"
        style={{
          paddingTop: Math.max(insets.top + 8, 20),
          backgroundColor: Colors.primary.darkGreen,
          paddingBottom: 16,
        }}
      >
        <View className="flex-row items-center mt-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Documents & KYC</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary.darkGreen} />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 mt-6 pb-10">
            <SectionTitle title="Verification Status" />
            <DocCard
              label="KYC Verification"
              status={user?.kyc_verification_status || "Pending"}
              icon="check-circle"
            />
            <DocCard
              label="Background Verification"
              status={user?.background_verification_status || "Pending"}
              icon="search"
            />
            <DocCard
              label="Police Certificate"
              status={
                user?.police_verification_certificate ? "Uploaded" : "Pending"
              }
              icon="file-text"
            />

            <SectionTitle title="Identity Documents" />
            <DocCard
              label="Aadhaar Number"
              value={user?.aadhaar_number}
              status={
                user?.aadhaar_front_url && user?.aadhaar_back_url
                  ? "Uploaded"
                  : "Missing Image"
              }
              icon="credit-card"
            />
            <DocCard
              label="PAN Number"
              value={user?.pan_number}
              status={user?.pan_card_url ? "Uploaded" : "Missing Image"}
              icon="credit-card"
            />

            <SectionTitle title="Selfie Verification" />
            <DocCard
              label="Profile Photo"
              status={user?.profile_photo ? "Uploaded" : "Pending"}
              icon="user"
            />
            <DocCard
              label="Selfie Verification"
              status={user?.selfie_verification_url ? "Uploaded" : "Pending"}
              icon="camera"
            />
            <DocCard
              label="Selfie with Vehicle"
              status={user?.selfie_with_vehicle ? "Uploaded" : "Pending"}
              icon="truck"
            />
            <DocCard
              label="Selfie with Aadhaar"
              status={user?.selfie_with_aadhaar ? "Uploaded" : "Pending"}
              icon="user-check"
            />

            <SectionTitle title="Vehicle Documents" />
            <DocCard
              label="License Images"
              status={
                user?.license_front_image && user?.license_back_image
                  ? "Uploaded"
                  : "Pending"
              }
              icon="credit-card"
            />
            <DocCard
              label="RC Book Image"
              status={user?.rc_book_image ? "Uploaded" : "Pending"}
              icon="file-text"
            />
            <DocCard
              label="Insurance Image"
              status={user?.insurance_document_image ? "Uploaded" : "Pending"}
              icon="shield"
            />
            <DocCard
              label="Vehicle Photos"
              status={
                user?.vehicle_front_photo && user?.vehicle_back_photo
                  ? "Uploaded"
                  : "Pending"
              }
              icon="image"
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="text-primary-darkGreen font-bold text-xs uppercase tracking-widest mb-3 mt-5">
      {title}
    </Text>
  );
}

function DocCard({ label, value, status, icon }: any) {
  const isGood =
    status === "Verified" ||
    status === "Approved" ||
    status === "Uploaded" ||
    status === "Active";
  const isPending = status === "Pending";
  const isMissing =
    status === "Missing Image" ||
    status === "Not Uploaded" ||
    status === "Rejected";

  return (
    <View className="bg-white rounded-2xl px-5 py-4 mb-3 border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Feather name={icon} size={14} color={Colors.text.muted} />
            <Text className="text-gray-400 text-xs font-semibold ml-2">
              {label}
            </Text>
          </View>
          {value && (
            <Text className="text-black font-semibold text-sm mt-0.5">
              {value}
            </Text>
          )}
        </View>
        <View
          className={`px-3 py-1 rounded-full ${isGood ? "bg-primary-lightGreen" : isPending ? "bg-yellow-50" : "bg-red-50"}`}
        >
          <Text
            className={`text-xs font-bold ${isGood ? "text-primary-brandGreen" : isPending ? "text-yellow-600" : "text-red-500"}`}
          >
            {status}
          </Text>
        </View>
      </View>
    </View>
  );
}
