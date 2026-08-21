import { Image, Text, View } from "react-native";
import "../global.css";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-red-600 px-6">
      <Image
        source={require("../assets/images/logo.png")}
        className="h-24 w-24 rounded-2xl"
        resizeMode="contain"
      />
      <Text className="mt-6 text-2xl font-bold text-slate-900">
        Delivery Partner App
      </Text>
      <Text className="mt-2 text-base text-slate-600">
        Tailwind is connected.
      </Text>
    </View>
  );
}
