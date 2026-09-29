import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import { Colors } from "../src/constants/Colors";
import { getDeliveryAttendance, markDeliveryAttendance } from "./api";
import BottomBar from "./src/Buttombar/BottomBar";
import TopHeader from "./src/TopHeader/TopHeader";

type AttendanceRecord = {
  id: string | number;
  attendance_date?: string | null;
  check_in_at?: string | null;
  check_out_at?: string | null;
  check_in_address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  accuracy?: number | string | null;
};

type AttendanceState = {
  today: string;
  currentSession: AttendanceRecord | null;
  records: AttendanceRecord[];
};

const ITEMS_PER_PAGE = 10;
const EMPTY_ATTENDANCE: AttendanceState = {
  today: "",
  currentSession: null,
  records: [],
};

function dateKey(value?: string | null) {
  return String(value || "").slice(0, 10);
}

function formatDate(value?: string | null) {
  const key = dateKey(value);
  if (!key) return "Date unavailable";
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) return "Date unavailable";
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

function hasCoordinates(record: AttendanceRecord) {
  return (
    record.latitude !== null &&
    record.latitude !== undefined &&
    record.longitude !== null &&
    record.longitude !== undefined &&
    Number.isFinite(Number(record.latitude)) &&
    Number.isFinite(Number(record.longitude))
  );
}

function getErrorMessage(error: any, action: "check_in" | "check_out") {
  const status = error?.response?.status;
  if (status === 409) {
    return action === "check_in"
      ? "You are already checked in. Refreshing your attendance."
      : "There is no active session to check out.";
  }
  if (status === 403) return "Your account is not allowed to update attendance.";
  if (status === 404) return "Delivery partner profile was not found.";
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to update attendance. Please try again."
  );
}

export default function Attendance() {
  const [attendance, setAttendance] = useState(EMPTY_ATTENDANCE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [currentPage, setCurrentPage] = useState(1);

  const loadAttendance = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const data = await getDeliveryAttendance();
      setAttendance({
        today: data?.today || "",
        currentSession: data?.currentSession || null,
        records: Array.isArray(data?.records) ? data.records : [],
      });
    } catch (loadError: any) {
      setError(
        loadError?.response?.data?.message ||
          "Unable to load attendance. Check your connection and retry.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAttendance();
      const interval = setInterval(() => void loadAttendance(true), 15000);
      return () => clearInterval(interval);
    }, [loadAttendance]),
  );

  const today = dateKey(attendance.today) || dateKey(new Date().toISOString());
  const currentMonth = today.slice(0, 7);
  const completedCount = attendance.records.filter(
    (record) => record.check_out_at,
  ).length;
  const monthCount = attendance.records.filter((record) =>
    dateKey(record.attendance_date).startsWith(currentMonth),
  ).length;

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return attendance.records.filter((record) => {
      const recordDate = dateKey(record.attendance_date);
      if (dateFilter === "today" && recordDate !== today) return false;
      if (dateFilter === "month" && !recordDate.startsWith(currentMonth)) {
        return false;
      }
      if (dateFilter === "custom" && customDate && recordDate !== customDate) {
        return false;
      }
      if (!query) return true;
      const status = record.check_out_at ? "completed" : "active";
      return [
        formatDate(record.attendance_date),
        formatTime(record.check_in_at),
        formatTime(record.check_out_at),
        status,
        record.check_in_address || "",
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [attendance.records, currentMonth, customDate, dateFilter, search, today]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const markAttendance = async () => {
    const action = attendance.currentSession ? "check_out" : "check_in";
    setMarking(true);
    setError("");
    try {
      let location = {};
      if (action === "check_in") {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") {
          throw new Error("Allow location access to check in.");
        }
        if (!(await Location.hasServicesEnabledAsync())) {
          throw new Error("Turn on device location services and try again.");
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
      await loadAttendance(true);
    } catch (markError: any) {
      setError(getErrorMessage(markError, action));
      if (markError?.response?.status === 409) {
        await loadAttendance(true);
      }
    } finally {
      setMarking(false);
    }
  };

  const openMap = async (record: AttendanceRecord) => {
    if (!hasCoordinates(record)) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${record.latitude},${record.longitude}`;
    try {
      await Linking.openURL(url);
    } catch {
      setError("Unable to open the map on this device.");
    }
  };

  const setFilter = (filter: string) => {
    setDateFilter(filter);
    setCurrentPage(1);
  };

  const onRefresh = () => {
    setRefreshing(true);
    void loadAttendance(true);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background-main"
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <TopHeader title="Attendance" showBack />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.darkGreen}
          />
        }
      >
        <View className="px-5 pt-5">
          <View className="mb-5 flex-row items-end justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Delivery sessions
              </Text>
              <Text className="mt-1 text-2xl font-extrabold text-gray-900">
                Attendance
              </Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={attendance.currentSession ? "Check out" : "Check in"}
              disabled={marking || loading}
              onPress={markAttendance}
              activeOpacity={0.85}
              className={`min-h-12 flex-row items-center justify-center rounded-xl px-4 ${attendance.currentSession ? "bg-red-600" : "bg-primary-brandGreen"} ${marking || loading ? "opacity-60" : ""}`}
            >
              {marking ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Feather
                  name={attendance.currentSession ? "log-out" : "log-in"}
                  size={16}
                  color="white"
                />
              )}
              <Text className="ml-2 text-xs font-extrabold uppercase tracking-wider text-white">
                {marking
                  ? "Updating"
                  : attendance.currentSession
                    ? "Check out"
                    : "Check in"}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            className={`mb-5 flex-row items-center rounded-2xl border px-4 py-4 ${attendance.currentSession ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"}`}
          >
            <View
              className={`h-3 w-3 rounded-full ${attendance.currentSession ? "bg-emerald-500" : "bg-gray-300"}`}
            />
            <View className="ml-3 flex-1">
              <Text
                className={`text-sm font-extrabold ${attendance.currentSession ? "text-emerald-900" : "text-gray-800"}`}
              >
                {attendance.currentSession ? "You are checked in" : "You are checked out"}
              </Text>
              <Text className="mt-1 text-xs text-gray-500">
                {attendance.currentSession
                  ? `Started at ${formatTime(attendance.currentSession.check_in_at)}`
                  : "Check in with your current location to start a session."}
              </Text>
            </View>
            <Feather
              name={attendance.currentSession ? "check-circle" : "clock"}
              size={20}
              color={attendance.currentSession ? Colors.primary.brandGreen : "#9CA3AF"}
            />
          </View>

          {error ? (
            <View className="mb-4 flex-row items-start rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <Feather name="alert-circle" size={16} color={Colors.status.error} />
              <Text className="ml-2 flex-1 text-xs font-medium leading-5 text-red-700">
                {error}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Dismiss message"
                onPress={() => setError("")}
                className="ml-2 p-1"
              >
                <Feather name="x" size={16} color={Colors.status.error} />
              </TouchableOpacity>
            </View>
          ) : null}

          <View className="mb-6 flex-row flex-wrap justify-between gap-y-3">
            <SummaryTile label="Total sessions" value={attendance.records.length} icon="calendar" />
            <SummaryTile label="Active" value={attendance.currentSession ? 1 : 0} icon="activity" tone="green" />
            <SummaryTile label="Completed" value={completedCount} icon="check-circle" tone="gold" />
            <SummaryTile label="This month" value={monthCount} icon="calendar" tone="red" />
          </View>

          <View className="mb-4 flex-row items-center rounded-xl border border-gray-200 bg-white px-3">
            <Feather name="search" size={17} color="#8B9288" />
            <TextInput
              value={search}
              onChangeText={(value) => {
                setSearch(value);
                setCurrentPage(1);
              }}
              placeholder="Search date, time, address or status"
              placeholderTextColor="#9CA3AF"
              className="h-12 flex-1 px-3 text-sm text-gray-800"
              returnKeyType="search"
            />
            {search ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={() => setSearch("")}
                className="p-2"
              >
                <Feather name="x-circle" size={16} color="#8B9288" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-1"
            >
              <View className="flex-row items-center">
                <FilterChip label="All" active={dateFilter === "all"} onPress={() => setFilter("all")} />
                <FilterChip label="Today" active={dateFilter === "today"} onPress={() => setFilter("today")} />
                <FilterChip label="This month" active={dateFilter === "month"} onPress={() => setFilter("month")} />
              </View>
            </ScrollView>
            <View className="ml-2 flex-row rounded-lg border border-gray-200 bg-white p-1">
              <ViewModeButton
                icon="grid"
                selected={viewMode === "cards"}
                label="Card view"
                onPress={() => setViewMode("cards")}
              />
              <ViewModeButton
                icon="list"
                selected={viewMode === "list"}
                label="List view"
                onPress={() => setViewMode("list")}
              />
            </View>
          </View>

          <View className="mb-5 flex-row items-center rounded-xl border border-gray-200 bg-white px-3">
            <Feather name="calendar" size={15} color="#7A8177" />
            <TextInput
              value={customDate}
              onChangeText={(value) => {
                const nextDate = value.slice(0, 10);
                setCustomDate(nextDate);
                setDateFilter(nextDate ? "custom" : "all");
                setCurrentPage(1);
              }}
              placeholder="Filter a date: YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              className="h-11 flex-1 px-3 text-sm text-gray-800"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
            {customDate ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Clear date filter"
                onPress={() => {
                  setCustomDate("");
                  setFilter("all");
                }}
                className="p-2"
              >
                <Feather name="x-circle" size={16} color="#8B9288" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-extrabold text-gray-900">
              Session history
            </Text>
            <Text className="text-xs font-semibold text-gray-500">
              {filteredRecords.length} {filteredRecords.length === 1 ? "session" : "sessions"}
            </Text>
          </View>

          {loading ? (
            <View className="items-center rounded-2xl border border-gray-100 bg-white py-12">
              <ActivityIndicator size="large" color={Colors.primary.brandGreen} />
              <Text className="mt-3 text-xs font-medium text-gray-500">
                Loading attendance
              </Text>
            </View>
          ) : filteredRecords.length === 0 ? (
            <View className="items-center rounded-2xl border border-gray-100 bg-white px-6 py-12">
              <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-primary-lightGreen">
                <Feather name="calendar" size={24} color={Colors.primary.brandGreen} />
              </View>
              <Text className="text-sm font-extrabold text-gray-800">
                No sessions found
              </Text>
              <Text className="mt-2 text-center text-xs leading-5 text-gray-500">
                {search || customDate
                  ? "Try another search or date filter."
                  : "Your attendance sessions will appear here."}
              </Text>
              {error ? (
                <TouchableOpacity
                  onPress={() => void loadAttendance()}
                  className="mt-4 rounded-lg bg-primary-darkGreen px-4 py-2.5"
                >
                  <Text className="text-xs font-bold text-white">Retry</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View className={viewMode === "cards" ? "gap-y-3" : "rounded-2xl border border-gray-100 bg-white px-4"}>
              {paginatedRecords.map((record) => (
                <AttendanceRecordCard
                  key={record.id}
                  record={record}
                  compact={viewMode === "list"}
                  onOpenMap={() => void openMap(record)}
                />
              ))}
            </View>
          )}

          {!loading && filteredRecords.length > 0 ? (
            <View className="mb-5 mt-5 flex-row items-center justify-between">
              <Text className="flex-1 text-[11px] font-semibold text-gray-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredRecords.length)} of {filteredRecords.length}
              </Text>
              <View className="flex-row items-center">
                <PageButton
                  icon="chevron-left"
                  disabled={currentPage <= 1}
                  label="Previous page"
                  onPress={() => setCurrentPage((page) => Math.max(1, page - 1))}
                />
                <Text className="mx-3 text-xs font-bold text-gray-600">
                  {currentPage} / {totalPages}
                </Text>
                <PageButton
                  icon="chevron-right"
                  disabled={currentPage >= totalPages}
                  label="Next page"
                  onPress={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                />
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <BottomBar activeTab="profile" />
    </SafeAreaView>
  );
}

function SummaryTile({
  label,
  value,
  icon,
  tone = "blue",
}: {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Feather>["name"];
  tone?: "blue" | "green" | "gold" | "red";
}) {
  const colors = {
    blue: { icon: "#2563EB", background: "bg-blue-50", value: "text-gray-900" },
    green: { icon: "#217032", background: "bg-primary-lightGreen", value: "text-primary-darkGreen" },
    gold: { icon: "#B7791F", background: "bg-amber-50", value: "text-gray-900" },
    red: { icon: "#DC2626", background: "bg-red-50", value: "text-gray-900" },
  }[tone];

  return (
    <View className="w-[48.5%] rounded-2xl border border-gray-100 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 pr-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          {label}
        </Text>
        <View className={`h-8 w-8 items-center justify-center rounded-lg ${colors.background}`}>
          <Feather name={icon} size={15} color={colors.icon} />
        </View>
      </View>
      <Text className={`mt-3 text-2xl font-extrabold ${colors.value}`}>{value}</Text>
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`mr-2 rounded-lg px-3 py-2.5 ${active ? "bg-primary-darkGreen" : "border border-gray-200 bg-white"}`}
    >
      <Text className={`text-[11px] font-bold ${active ? "text-white" : "text-gray-600"}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ViewModeButton({
  icon,
  selected,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`h-8 w-9 items-center justify-center rounded-md ${selected ? "bg-primary-lightGreen" : ""}`}
    >
      <Feather
        name={icon}
        size={15}
        color={selected ? Colors.primary.darkGreen : "#8B9288"}
      />
    </TouchableOpacity>
  );
}

function AttendanceRecordCard({
  record,
  compact,
  onOpenMap,
}: {
  record: AttendanceRecord;
  compact: boolean;
  onOpenMap: () => void;
}) {
  const completed = Boolean(record.check_out_at);
  const address = record.check_in_address ||
    (hasCoordinates(record)
      ? `${Number(record.latitude).toFixed(5)}, ${Number(record.longitude).toFixed(5)}`
      : "Location not available");

  return (
    <View
      className={`rounded-2xl border border-gray-100 bg-white ${compact ? "border-0 border-b border-gray-100 px-0 py-4" : "p-4"}`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-primary-brandGreen">
            Attendance session
          </Text>
          <Text className="mt-1 text-sm font-extrabold text-gray-900">
            {formatDate(record.attendance_date)}
          </Text>
        </View>
        <View
          className={`rounded-full px-2.5 py-1 ${completed ? "bg-gray-100" : "bg-emerald-50"}`}
        >
          <Text
            className={`text-[9px] font-extrabold uppercase tracking-wider ${completed ? "text-gray-600" : "text-emerald-700"}`}
          >
            {completed ? "Completed" : "Active"}
          </Text>
        </View>
      </View>

      <View className={`mt-4 flex-row ${compact ? "" : "gap-3"}`}>
        <TimeCell label="Check in" value={formatTime(record.check_in_at)} compact={compact} />
        <TimeCell label="Check out" value={formatTime(record.check_out_at)} compact={compact} />
      </View>

      <View className="mt-3 flex-row items-start border-t border-gray-100 pt-3">
        <Feather name="map-pin" size={14} color="#6B7280" style={{ marginTop: 2 }} />
        <Text className="ml-2 flex-1 text-xs leading-5 text-gray-600">{address}</Text>
        {hasCoordinates(record) ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open check-in location in maps"
            onPress={onOpenMap}
            className="ml-2 flex-row items-center rounded-lg bg-primary-lightGreen px-2.5 py-2"
          >
            <Feather name="navigation" size={13} color={Colors.primary.darkGreen} />
            <Text className="ml-1 text-[10px] font-bold text-primary-darkGreen">
              Map
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {record.accuracy !== null && record.accuracy !== undefined ? (
        <Text className="ml-5 mt-1 text-[10px] text-gray-400">
          Location accuracy: {Math.round(Number(record.accuracy))} m
        </Text>
      ) : null}
    </View>
  );
}

function TimeCell({
  label,
  value,
  compact,
}: {
  label: string;
  value: string;
  compact: boolean;
}) {
  return (
    <View className={`flex-1 ${compact ? "py-1" : "rounded-xl bg-gray-50 p-3"}`}>
      <Text className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </Text>
      <Text className="mt-1 text-sm font-bold text-gray-800">{value}</Text>
    </View>
  );
}

function PageButton({
  icon,
  disabled,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  disabled: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      className={`h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white ${disabled ? "opacity-40" : ""}`}
    >
      <Feather name={icon} size={16} color={Colors.primary.darkGreen} />
    </TouchableOpacity>
  );
}