import { Feather } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../../src/constants/Colors";

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

type AlertType = "success" | "error" | "warning" | "info";

type CustomAlertProps = {
  visible: boolean;
  title: string;
  message: string;
  type: AlertType;
  buttons: AlertButton[];
  onClose: () => void;
};

const ALERT_THEME: Record<
  AlertType,
  { icon: keyof typeof Feather.glyphMap; color: string; background: string }
> = {
  success: {
    icon: "check-circle",
    color: Colors.primary.brandGreen,
    background: Colors.primary.lightGreen,
  },
  error: {
    icon: "x-circle",
    color: Colors.status.error,
    background: Colors.status.errorLight,
  },
  warning: {
    icon: "alert-triangle",
    color: Colors.accent.golden,
    background: "#FFF5DE",
  },
  info: {
    icon: "info",
    color: Colors.primary.darkGreen,
    background: "#EAF3F7",
  },
};

export function useCustomAlert() {
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: AlertType;
    buttons: AlertButton[];
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
    buttons: [],
  });

  const hideAlert = useCallback(() => {
    setAlertState((current) => ({ ...current, visible: false }));
  }, []);

  const showAlert = useCallback(
    (
      title: string,
      message: string,
      buttons: AlertButton[] = [{ text: "OK" }],
      type: AlertType = getAlertType(title),
    ) => {
      setAlertState({
        visible: true,
        title,
        message,
        type,
        buttons,
      });
    },
    [],
  );

  return {
    showAlert,
    hideAlert,
    alertVisible: alertState.visible,
    alert: (
      <CustomAlert
        {...alertState}
        onClose={hideAlert}
      />
    ),
  };
}

function CustomAlert({
  visible,
  title,
  message,
  type,
  buttons,
  onClose,
}: CustomAlertProps) {
  const theme = ALERT_THEME[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full overflow-hidden rounded-3xl bg-white shadow-2xl">
          <View className="items-center px-6 pb-5 pt-7">
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.background }}
            >
              <Feather name={theme.icon} size={30} color={theme.color} />
            </View>
            <Text className="mt-4 text-center text-xl font-extrabold text-gray-900">
              {title}
            </Text>
            <Text className="mt-2 text-center text-sm font-medium leading-5 text-gray-600">
              {message}
            </Text>
          </View>

          <View className="flex-row gap-3 border-t border-gray-100 px-6 py-5">
            {buttons.map((button, index) => {
              const isDestructive = button.style === "destructive";
              const isCancel = button.style === "cancel";
              const isPrimary = !isDestructive && !isCancel;

              return (
                <TouchableOpacity
                  key={`${button.text}-${index}`}
                  className={`h-12 flex-1 items-center justify-center rounded-2xl border-2 ${
                    isDestructive
                      ? "border-status-error bg-status-errorLight"
                      : isCancel
                        ? "border-gray-200 bg-gray-100"
                        : "border-primary-brandGreen bg-primary-brandGreen"
                  }`}
                  onPress={() => {
                    onClose();
                    button.onPress?.();
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`text-sm font-extrabold ${
                      isPrimary
                        ? "text-white"
                        : isDestructive
                          ? "text-status-error"
                          : "text-gray-700"
                    }`}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function getAlertType(title: string): AlertType {
  const normalizedTitle = title.toLowerCase();
  if (normalizedTitle.includes("success")) return "success";
  if (normalizedTitle.includes("error") || normalizedTitle.includes("unable")) {
    return "error";
  }
  if (
    normalizedTitle.includes("warning") ||
    normalizedTitle.includes("not allowed") ||
    normalizedTitle.includes("permission") ||
    normalizedTitle.includes("validation")
  ) {
    return "warning";
  }
  return "info";
}
