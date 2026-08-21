import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="src/Auth/LoginScreen" />
      <Stack.Screen name="home" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="order-details" />
      <Stack.Screen name="track-order" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
