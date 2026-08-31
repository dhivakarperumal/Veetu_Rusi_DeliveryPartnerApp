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

export default function BankDetails() {
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
          <Text className="text-white font-bold text-lg">
            Bank Details & Wallet
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary.darkGreen} />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 mt-6 pb-10">
            {/* Wallet Balance Card */}
            <View className="bg-primary-darkGreen rounded-3xl px-6 py-6 mb-6 shadow-md items-center">
              <Text className="text-white/70 text-xs font-semibold mb-1">
                Wallet Balance
              </Text>
              <Text className="text-white font-extrabold text-3xl">
                ₹{user?.wallet_balance || "0.00"}
              </Text>
            </View>

            <SectionTitle title="Bank Account" />
            {/* Bank Card */}
            <View className="bg-white rounded-3xl px-6 py-6 mb-4 shadow-sm border border-gray-100">
              <Text className="text-gray-400 text-xs font-semibold mb-1">
                Account Holder Name
              </Text>
              <Text className="text-black font-bold text-lg mb-4">
                {user?.account_holder_name || "—"}
              </Text>

              <Text className="text-gray-400 text-xs font-semibold mb-1">
                Account Number
              </Text>
              <Text className="text-black font-bold text-base tracking-widest mb-4">
                {user?.bank_account_number
                  ? `**** **** ${String(user.bank_account_number).slice(-4)}`
                  : "—"}
              </Text>

              <View className="flex-row">
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs font-semibold mb-1">
                    Bank Name
                  </Text>
                  <Text className="text-black font-semibold text-sm">
                    {user?.bank_name || "—"}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs font-semibold mb-1">
                    IFSC Code
                  </Text>
                  <Text className="text-black font-semibold text-sm">
                    {user?.ifsc_code || "—"}
                  </Text>
                </View>
              </View>
            </View>

            <InfoCard
              label="Branch Name"
              value={user?.branch_name}
              icon="map-pin"
            />
            <InfoCard label="UPI ID" value={user?.upi_id} icon="smartphone" />

            <SectionTitle title="Earnings Summary" />
            <View className="flex-row mb-3">
              <View className="flex-1 mr-1.5 bg-white p-4 rounded-2xl border border-gray-100">
                <Text className="text-gray-400 text-xs font-semibold mb-1">
                  Daily
                </Text>
                <Text className="text-black font-bold text-sm">
                  ₹{user?.daily_earnings || "0.00"}
                </Text>
              </View>
              <View className="flex-1 ml-1.5 bg-white p-4 rounded-2xl border border-gray-100">
                <Text className="text-gray-400 text-xs font-semibold mb-1">
                  Weekly
                </Text>
                <Text className="text-black font-bold text-sm">
                  ₹{user?.weekly_earnings || "0.00"}
                </Text>
              </View>
            </View>
            <View className="flex-row mb-3">
              <View className="flex-1 mr-1.5 bg-white p-4 rounded-2xl border border-gray-100">
                <Text className="text-gray-400 text-xs font-semibold mb-1">
                  Monthly
                </Text>
                <Text className="text-black font-bold text-sm">
                  ₹{user?.monthly_earnings || "0.00"}
                </Text>
              </View>
              <View className="flex-1 ml-1.5 bg-white p-4 rounded-2xl border border-gray-100">
                <Text className="text-gray-400 text-xs font-semibold mb-1">
                  Total
                </Text>
                <Text className="text-black font-bold text-sm">
                  ₹{user?.total_earnings || "0.00"}
                </Text>
              </View>
            </View>
            <View className="flex-row mb-3">
              <View className="flex-1 mr-1.5 bg-white p-4 rounded-2xl border border-gray-100">
                <Text className="text-gray-400 text-xs font-semibold mb-1">
                  Pending
                </Text>
                <Text className="text-orange-500 font-bold text-sm">
                  ₹{user?.pending_earnings || "0.00"}
                </Text>
              </View>
              <View className="flex-1 ml-1.5 bg-white p-4 rounded-2xl border border-gray-100">
                <Text className="text-gray-400 text-xs font-semibold mb-1">
                  Incentive/Bonus
                </Text>
                <Text className="text-green-600 font-bold text-sm">
                  ₹
                  {(
                    parseFloat(user?.incentive_amount || 0) +
                    parseFloat(user?.bonus_amount || 0)
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
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

function InfoCard({ label, value, icon }: any) {
  return (
    <View className="bg-white rounded-2xl px-5 py-4 mb-3 border border-gray-100 shadow-sm">
      <View className="flex-row items-center mb-1">
        <Feather name={icon} size={13} color={Colors.text.muted} />
        <Text className="text-gray-400 text-xs font-semibold ml-2">
          {label}
        </Text>
      </View>
      <Text className="text-black font-semibold text-sm mt-0.5">
        {value || "—"}
      </Text>
    </View>
  );
}
