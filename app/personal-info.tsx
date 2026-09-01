import { Feather } from "@expo/vector-icons";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
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
  const params = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(params.editMode === "true");
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    getStoredUser().then((u) => {
      setUser(u);
      setEditData(u);
      setLoading(false);
    });
  }, []);

  const handleEditAll = () => {
    setIsEditMode(true);
    setEditData({ ...user });
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditData({ ...user });
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditData({
      ...editData,
      [field]: value,
    });
  };

  const handleSaveAll = () => {
    setUser(editData);
    setIsEditMode(false);
    Alert.alert("Success", "All information updated successfully");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background-main"
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View
        className="px-6 pb-5 z-50 flex-row items-center justify-between"
        style={{
          paddingTop: Math.max(insets.top + 8, 20),
          backgroundColor: Colors.primary.darkGreen,
          paddingBottom: 16,
        }}
      >
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">
            Personal Information
          </Text>
        </View>
        {!isEditMode && (
          <TouchableOpacity
            onPress={handleEditAll}
            className="bg-white/20 px-4 py-2 rounded-full flex-row items-center"
          >
            <Feather name="edit" size={14} color="white" />
            <Text className="text-white text-xs font-bold ml-2">Edit All</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary.darkGreen} />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 mt-6 pb-10">
            {isEditMode ? (
              <>
                <SectionTitle title="Basic Info" />
                <EditField
                  label="Full Name"
                  value={editData?.name}
                  onChange={(v) => handleFieldChange("name", v)}
                />
                <EditField
                  label="Email"
                  value={editData?.email}
                  onChange={(v) => handleFieldChange("email", v)}
                />
                <EditField
                  label="Mobile"
                  value={editData?.mobile}
                  onChange={(v) => handleFieldChange("mobile", v)}
                />
                <EditField
                  label="WhatsApp Number"
                  value={editData?.whatsapp_number}
                  onChange={(v) => handleFieldChange("whatsapp_number", v)}
                />
                <EditField
                  label="Alternate Mobile"
                  value={editData?.alt_mobile}
                  onChange={(v) => handleFieldChange("alt_mobile", v)}
                />
                <EditField
                  label="Gender"
                  value={editData?.gender}
                  onChange={(v) => handleFieldChange("gender", v)}
                />
                <EditField
                  label="Date of Birth"
                  value={editData?.date_of_birth}
                  onChange={(v) => handleFieldChange("date_of_birth", v)}
                />
                <EditField
                  label="Age"
                  value={editData?.age?.toString()}
                  onChange={(v) => handleFieldChange("age", v)}
                />
                <EditField
                  label="Blood Group"
                  value={editData?.blood_group}
                  onChange={(v) => handleFieldChange("blood_group", v)}
                />
                <EditField
                  label="Marital Status"
                  value={editData?.marital_status}
                  onChange={(v) => handleFieldChange("marital_status", v)}
                />
                <EditField
                  label="Father / Husband Name"
                  value={editData?.father_husband_name}
                  onChange={(v) => handleFieldChange("father_husband_name", v)}
                />

                <SectionTitle title="Emergency Contact" />
                <EditField
                  label="Contact Name"
                  value={editData?.emergency_contact_name}
                  onChange={(v) =>
                    handleFieldChange("emergency_contact_name", v)
                  }
                />
                <EditField
                  label="Relationship"
                  value={editData?.emergency_contact_relationship}
                  onChange={(v) =>
                    handleFieldChange("emergency_contact_relationship", v)
                  }
                />
                <EditField
                  label="Contact Mobile"
                  value={editData?.emergency_contact_mobile}
                  onChange={(v) =>
                    handleFieldChange("emergency_contact_mobile", v)
                  }
                />
                <EditField
                  label="Emergency Contact"
                  value={editData?.emergency_contact}
                  onChange={(v) => handleFieldChange("emergency_contact", v)}
                />

                <SectionTitle title="Address" />
                <EditField
                  label="Door Number"
                  value={editData?.door_number}
                  onChange={(v) => handleFieldChange("door_number", v)}
                />
                <EditField
                  label="Street Name"
                  value={editData?.street_name}
                  onChange={(v) => handleFieldChange("street_name", v)}
                />
                <EditField
                  label="Area"
                  value={editData?.area_name}
                  onChange={(v) => handleFieldChange("area_name", v)}
                />
                <EditField
                  label="Landmark"
                  value={editData?.landmark}
                  onChange={(v) => handleFieldChange("landmark", v)}
                />
                <EditField
                  label="City"
                  value={editData?.city}
                  onChange={(v) => handleFieldChange("city", v)}
                />
                <EditField
                  label="District"
                  value={editData?.district}
                  onChange={(v) => handleFieldChange("district", v)}
                />
                <EditField
                  label="State"
                  value={editData?.state}
                  onChange={(v) => handleFieldChange("state", v)}
                />
                <EditField
                  label="Pincode"
                  value={editData?.pincode}
                  onChange={(v) => handleFieldChange("pincode", v)}
                />
                <EditField
                  label="Country"
                  value={editData?.country}
                  onChange={(v) => handleFieldChange("country", v)}
                />
                <EditField
                  label="Current Address"
                  value={editData?.current_address}
                  onChange={(v) => handleFieldChange("current_address", v)}
                />
                <EditField
                  label="Permanent Address"
                  value={editData?.permanent_address}
                  onChange={(v) => handleFieldChange("permanent_address", v)}
                />

                <SectionTitle title="Account" />
                <EditField
                  label="Partner Code"
                  value={editData?.delivery_partner_code}
                  onChange={(v) =>
                    handleFieldChange("delivery_partner_code", v)
                  }
                />
                <EditField
                  label="Account Status"
                  value={editData?.account_status}
                  onChange={(v) => handleFieldChange("account_status", v)}
                />
                <EditField
                  label="Login Status"
                  value={editData?.login_status}
                  onChange={(v) => handleFieldChange("login_status", v)}
                />

                {/* Action Buttons */}
                <View className="flex-row gap-3 mt-6">
                  <TouchableOpacity
                    onPress={handleCancel}
                    className="flex-1 py-4 rounded-2xl border border-gray-200 bg-gray-50"
                  >
                    <Text className="text-gray-700 font-extrabold text-sm text-center">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveAll}
                    className="flex-1 py-4 rounded-2xl bg-primary-darkGreen"
                  >
                    <Text className="text-white font-extrabold text-sm text-center">
                      Save All Changes
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
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
                <InfoCard
                  label="Age"
                  value={user?.age?.toString()}
                  icon="clock"
                />
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
              </>
            )}
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

function EditField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <View className="mb-3">
      <Text className="text-gray-600 text-xs font-semibold mb-2">{label}</Text>
      <TextInput
        className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 font-semibold"
        placeholder={`Enter ${label}`}
        value={value || ""}
        onChangeText={onChange}
        placeholderTextColor="#94A3B8"
      />
    </View>
  );
}
