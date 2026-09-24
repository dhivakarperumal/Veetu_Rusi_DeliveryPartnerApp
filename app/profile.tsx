import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import { Colors } from "../src/constants/Colors";
import {
    getMyOrders,
    getProfileData,
    getStoredUser,
    logoutUser,
} from "./api";
import BottomBar from "./src/Buttombar/BottomBar";
import TopHeader from "./src/TopHeader/TopHeader";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profileStats, setProfileStats] = useState({
    orders: "—",
    rating: "—",
    trips: "—",
  });
  const [referralCode, setReferralCode] = useState("");
  const [partnerData, setPartnerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadProfile = async () => {
        const [profileResult, ordersResult, storedUserResult] =
          await Promise.allSettled([
          getProfileData(),
          getMyOrders("All"),
          getStoredUser(),
        ]);

        if (!isActive) return;

        const profileData =
          profileResult.status === "fulfilled" ? profileResult.value : null;
        const resolvedProfile =
          profileData?.profile ||
          profileData?.user ||
          profileData ||
          (storedUserResult.status === "fulfilled"
            ? storedUserResult.value
            : null);
        const storedUser = resolvedProfile || null;
        const response =
          ordersResult.status === "fulfilled" ? ordersResult.value : [];
        const orders = Array.isArray(response)
          ? response
          : response?.orders || [];
        const completedOrders = orders.filter(isCompletedOrder);
        const rating = getProfileRating(storedUser, orders);

        setUser(storedUser);
        setPartnerData(
          profileData?.partner ||
            profileData?.deliveryPartner ||
            storedUser?.partner ||
            null,
        );
        setReferralCode(
          profileData?.referral?.my_code ||
            profileData?.referral_code ||
            storedUser?.referral_code ||
            "",
        );
        setProfileStats({
          orders: String(orders.length),
          rating: rating === null ? "—" : rating.toFixed(1),
          trips: orders.length
            ? `${Math.round((completedOrders.length / orders.length) * 100)}%`
            : "—",
        });
        setLoading(false);
      };

      loadProfile();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/src/Auth/LoginScreen");
  };

  const handleEditProfile = () => {
    router.push({
      pathname: "/personal-info",
      params: { editMode: "true" },
    });
  };

  const firstLetter = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
      ? user.email.charAt(0).toUpperCase()
      : "U";

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const displayPhone = user?.phone || user?.mobile || "—";
  const partnerStatus =
    partnerData?.status || partnerData?.account_status || "Available";

  return (
    <SafeAreaView
      className="flex-1 bg-background-main"
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Fixed Header */}
      <TopHeader title="My Profile" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="items-center justify-center mt-20">
            <ActivityIndicator size="large" color={Colors.primary.darkGreen} />
          </View>
        ) : (
          <>
            {/* Profile Header Card */}
            <View className="mt-0 mx-0 mb-6 overflow-hidden border-b border-gray-100 bg-white shadow-sm">
              <View className="bg-primary-darkGreen px-5 pb-6 pt-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="h-16 w-16 items-center justify-center rounded-full border-4 border-primary-lightGreen bg-white/10">
                      <Text className="text-2xl font-extrabold text-white">
                        {firstLetter}
                      </Text>
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-xl font-extrabold text-white">
                        {displayName}
                      </Text>
                      <Text className="mt-1 text-xs font-medium text-white/75">
                        {displayPhone}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10"
                    onPress={handleEditProfile}
                    activeOpacity={0.8}
                  >
                    <Feather name="edit-2" size={16} color="white" />
                  </TouchableOpacity>
                </View>

                <View className="mt-5 flex-row items-center justify-between">
                  <View className="rounded-full bg-white/10 px-3 py-1.5">
                    <Text className="text-[10px] font-bold uppercase tracking-[1.2px] text-white/80">
                      Delivery Partner
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <Text className="ml-2 text-xs font-semibold text-white/80">
                      {partnerStatus}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-white px-4 pb-4 pt-3">
                <View className="flex-row justify-between">
                  <ProfileStatCard
                    label="Orders"
                    value={profileStats.orders}
                    tone="green"
                  />
                  <ProfileStatCard
                    label="Rating"
                    value={profileStats.rating}
                    tone="gold"
                  />
                  <ProfileStatCard
                    label="Trips"
                    value={profileStats.trips}
                    tone="blue"
                  />
                </View>

                {user?.email && (
                  <View className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <View className="flex-row items-center">
                      <Feather
                        name="mail"
                        size={16}
                        color={Colors.text.muted}
                      />
                      <Text className="ml-2 text-[11px] font-semibold uppercase tracking-[1.2px] text-gray-500">
                        Email
                      </Text>
                    </View>
                    <Text className="mt-2 text-sm font-semibold text-gray-800">
                      {user.email}
                    </Text>
                  </View>
                )}

                {referralCode && (
                  <View className="mt-4 flex-row items-center rounded-2xl border border-primary-lightGreen bg-primary-lightGreen/40 px-4 py-3">
                    <Feather
                      name="share-2"
                      size={18}
                      color={Colors.primary.brandGreen}
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-[11px] font-semibold uppercase tracking-[1.2px] text-gray-500">
                        Referral Code
                      </Text>
                      <Text className="mt-1 text-base font-extrabold tracking-widest text-primary-darkGreen">
                        {referralCode}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View className="px-4 pb-4">
              <SummarySection
                title="Personal Information"
                items={[
                  { label: "Mobile", value: user?.mobile || user?.phone || "—" },
                  { label: "Email", value: user?.email || "—" },
                  { label: "Gender", value: user?.gender || "—" },
                  { label: "DOB", value: user?.date_of_birth || "—" },
                  { label: "Address", value: user?.current_address || user?.permanent_address || "—" },
                ]}
              />

              <SummarySection
                title="Vehicle Details"
                items={[
                  { label: "Brand", value: user?.vehicle_brand || "—" },
                  { label: "Model", value: user?.vehicle_model || "—" },
                  { label: "Number", value: user?.vehicle_number || "—" },
                  { label: "Color", value: user?.vehicle_color || "—" },
                  { label: "License", value: user?.license_number || "—" },
                ]}
              />

              <SummarySection
                title="Document Details"
                items={[
                  { label: "KYC", value: user?.kyc_verification_status || "Pending" },
                  { label: "Aadhaar", value: user?.aadhaar_number || "—" },
                  { label: "PAN", value: user?.pan_number || "—" },
                  { label: "Status", value: user?.background_verification_status || "Pending" },
                ]}
              />

              <SummarySection
                title="Bank Details"
                items={[
                  { label: "Account Holder", value: user?.account_holder_name || "—" },
                  { label: "Bank", value: user?.bank_name || "—" },
                  { label: "Account", value: user?.bank_account_number ? `****${String(user.bank_account_number).slice(-4)}` : "—" },
                  { label: "IFSC", value: user?.ifsc_code || "—" },
                  { label: "UPI", value: user?.upi_id || "—" },
                ]}
              />
            </View>

            {/* Menu Options */}
            <View className="px-4 pb-24 space-y-3">
              <MenuItem
                icon="user"
                label="Personal Information"
                onPress={() => router.push("/personal-info")}
              />
              <MenuItem
                icon="car"
                iconFamily="Ionicons"
                label="Vehicle Information"
                onPress={() => router.push("/vehicle-info")}
              />
              <MenuItem
                icon="file-text"
                label="Documents"
                onPress={() => router.push("/documents")}
              />
              <MenuItem
                icon="bank-outline"
                iconFamily="MaterialCommunityIcons"
                label="Bank Details"
                onPress={() => router.push("/bank-details")}
              />
              <MenuItem icon="bell" label="Notifications" onPress={() => {}} />
              <MenuItem
                icon="clock"
                label="Help & Support"
                onPress={() => router.push("/helpsupport")}
              />

              <TouchableOpacity
                className="mt-4 flex-row items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-4 py-4"
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Feather name="log-out" size={20} color={Colors.status.error} />
                <Text className="ml-3 text-[15px] font-bold text-red-600">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <BottomBar activeTab="profile" />
    </SafeAreaView>
  );
}

function SummarySection({ title, items }: { title: string; items: Array<{ label: string; value: string }> }) {
  return (
    <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <Text className="mb-3 text-[11px] font-bold uppercase tracking-[1.2px] text-primary-darkGreen">
        {title}
      </Text>
      {items.map((item) => (
        <View key={item.label} className="mb-2.5 flex-row items-start justify-between">
          <Text className="mr-3 text-[12px] font-medium text-gray-500">{item.label}</Text>
          <Text className="flex-1 text-right text-[12px] font-semibold text-gray-800">
            {item.value || "—"}
          </Text>
        </View>
      ))}
    </View>
  );
}

function MenuItem({ icon, label, iconFamily = "Feather", onPress }: any) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm mb-3"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {iconFamily === "Feather" && (
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-lightGreen">
            <Feather name={icon} size={20} color={Colors.primary.darkGreen} />
          </View>
        )}
        {iconFamily === "Ionicons" && (
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-lightGreen">
            <Ionicons
              name={getIoniconName(icon)}
              size={20}
              color={Colors.primary.darkGreen}
            />
          </View>
        )}
        {iconFamily === "MaterialCommunityIcons" && (
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-lightGreen">
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={Colors.primary.darkGreen}
            />
          </View>
        )}
        <Text className="ml-4 text-gray-800 font-semibold text-[15px]">
          {label}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={Colors.text.muted} />
    </TouchableOpacity>
  );
}

function ProfileStatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  const palette: Record<string, { bg: string; text: string }> = {
    green: { bg: "#EBF7EB", text: Colors.primary.brandGreen },
    gold: { bg: "#FFF5DE", text: Colors.accent.golden },
    blue: { bg: "#EAF3F7", text: "#36758B" },
  };

  return (
    <View
      className="flex-1 items-center rounded-2xl px-3 py-3 border border-gray-100"
      style={{ backgroundColor: palette[tone]?.bg || "#F8FAFC" }}
    >
      <Text
        className="text-xl font-extrabold"
        style={{ color: palette[tone]?.text || Colors.primary.darkGreen }}
      >
        {value}
      </Text>
      <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[1px] text-gray-500">
        {label}
      </Text>
    </View>
  );
}

function isCompletedOrder(order: any) {
  const status = String(order?.status || "").toLowerCase();
  return ["delivered", "completed"].includes(status);
}

function getProfileRating(user: any, orders: any[]) {
  const userRating = getNumericValue(
    user?.rating ?? user?.average_rating ?? user?.avg_rating,
  );

  if (userRating !== null) {
    return userRating;
  }

  const orderRatings = orders
    .map((order) =>
      getNumericValue(
        order?.rating ??
          order?.review_rating ??
          order?.customer_rating ??
          order?.delivery_rating,
      ),
    )
    .filter((rating): rating is number => rating !== null);

  return orderRatings.length
    ? orderRatings.reduce((sum, rating) => sum + rating, 0) /
        orderRatings.length
    : null;
}

function getNumericValue(value: unknown) {
  const numericValue = Number(value);
  return value !== null && value !== undefined && Number.isFinite(numericValue)
    ? numericValue
    : null;
}

function getIoniconName(icon: string): any {
  const map: Record<string, string> = {
    user: "person-outline",
    car: "car-outline",
    bell: "notifications-outline",
    clock: "time-outline",
    "file-text": "document-text-outline",
    "bank-outline": "business-outline",
  };

  return map[icon] || `${icon}-outline`;
}
