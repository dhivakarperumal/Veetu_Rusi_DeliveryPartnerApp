import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import "../global.css";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-100 px-6">
      <Text className="text-2xl font-bold text-slate-900">Delivery Partner App</Text>
      <Text className="mt-2 text-base text-slate-600">Tailwind is connected.</Text>
      <StatusBar style="auto" />
    </View>
  );
}
