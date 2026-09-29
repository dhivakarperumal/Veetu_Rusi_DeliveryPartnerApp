import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../src/constants/Colors";
import { getDeliveryAttendance } from "../../api";

type AttendancePromptProps = {
  onMarkAttendance: () => void;
};

export default function AttendancePrompt({
  onMarkAttendance,
}: AttendancePromptProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    getDeliveryAttendance()
      .then((attendance) => {
        if (isCurrent && !attendance?.currentSession) {
          setVisible(true);
        }
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-5">
        <View className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
          <View className="items-center px-6 pb-5 pt-7">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-lightGreen">
              <Feather
                name="clock"
                size={29}
                color={Colors.primary.brandGreen}
              />
            </View>
            <Text className="mt-4 text-center text-xl font-extrabold text-gray-900">
              Attendance not marked
            </Text>
            <Text className="mt-2 text-center text-sm font-medium leading-5 text-gray-600">
              You are signed in, but not checked in. Mark attendance to start
              receiving delivery orders.
            </Text>
          </View>

          <View className="flex-row gap-3 border-t border-gray-100 px-5 py-4">
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setVisible(false)}
              activeOpacity={0.8}
              className="h-12 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-gray-50"
            >
              <Text className="text-sm font-bold text-gray-600">Later</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                setVisible(false);
                onMarkAttendance();
              }}
              activeOpacity={0.8}
              className="h-12 flex-1 flex-row items-center justify-center rounded-xl bg-primary-darkGreen"
            >
              <Feather name="check-circle" size={16} color="white" />
              <Text className="ml-2 text-sm font-extrabold text-white">
                Mark attendance
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}