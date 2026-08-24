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

export default function PersonalInfo() {
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
            Personal Information
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
            <SectionTitle title="Basic Info" />
            <InfoCard label="Full Name" value={user?.name} icon="user" />
            <InfoCard label="Email" value={user?.email} icon="mail" />
            <InfoCard label="Mobile" value={user?.mobile} icon="phone" />
            <InfoCard
              label="WhatsApp Number"
              value={user?.whatsapp_number}
              icon="message-circle"
            />
            <InfoCard
              label="Alternate Mobile"
              value={user?.alt_mobile}
              icon="phone-call"
            />
            <InfoCard label="Gender" value={user?.gender} icon="users" />
            <InfoCard
              label="Date of Birth"
              value={user?.date_of_birth}
              icon="calendar"
            />
            <InfoCard label="Age" value={user?.age?.toString()} icon="clock" />
            <InfoCard
              label="Blood Group"
              value={user?.blood_group}
              icon="activity"
            />
            <InfoCard
              label="Marital Status"
              value={user?.marital_status}
              icon="heart"
            />
            <InfoCard
              label="Father / Husband Name"
              value={user?.father_husband_name}
              icon="user"
            />

            <SectionTitle title="Emergency Contact" />
            <InfoCard
              label="Contact Name"
              value={user?.emergency_contact_name}
              icon="user"
            />
            <InfoCard
              label="Relationship"
              value={user?.emergency_contact_relationship}
              icon="users"
            />
            <InfoCard
              label="Contact Mobile"
              value={user?.emergency_contact_mobile}
              icon="phone"
            />
            <InfoCard
              label="Emergency Contact"
              value={user?.emergency_contact}
              icon="alert-circle"
            />

            <SectionTitle title="Address" />
            <InfoCard
              label="Door Number"
              value={user?.door_number}
              icon="home"
            />
            <InfoCard
              label="Street Name"
              value={user?.street_name}
              icon="map"
            />
            <InfoCard label="Area" value={user?.area_name} icon="map-pin" />
            <InfoCard label="Landmark" value={user?.landmark} icon="flag" />
            <InfoCard label="City" value={user?.city} icon="map-pin" />
            <InfoCard label="District" value={user?.district} icon="map" />
            <InfoCard label="State" value={user?.state} icon="map" />
            <InfoCard label="Pincode" value={user?.pincode} icon="hash" />
            <InfoCard label="Country" value={user?.country} icon="globe" />
            <InfoCard
              label="Current Address"
              value={user?.current_address}
              icon="navigation"
            />
            <InfoCard
              label="Permanent Address"
              value={user?.permanent_address}
              icon="home"
            />

            <SectionTitle title="Account" />
            <InfoCard
              label="Partner Code"
              value={user?.delivery_partner_code}
              icon="award"
            />
            <InfoCard
              label="Account Status"
              value={user?.account_status}
              icon="shield"
            />
            <InfoCard
              label="Login Status"
              value={user?.login_status}
              icon="log-in"
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
