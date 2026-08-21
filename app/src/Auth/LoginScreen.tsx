import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { getStoredToken, loginWithIdentifier } from "../../api";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = await getStoredToken();
      if (token) {
        router.replace("/home");
        return;
      }
      setCheckingSession(false);
    };
    restoreSession();
  }, [router]);

  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!cleanPass) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await loginWithIdentifier(cleanEmail, cleanPass);
      if (response?.token) {
        router.replace("/home");
      } else {
        throw new Error(response?.message || "Login failed. Please try again.");
      }
    } catch (err: any) {
      const msg =
        err?.message || err instanceof Error
          ? err.message
          : "Invalid email or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View className="flex-1 bg-background-main items-center justify-center">
        <ActivityIndicator size="large" color="#304B26" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background-main"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo */}
          <View className="w-[180px] h-[100px] mb-3 items-center justify-center">
            <Image
              source={require("../../../assets/images/logo.png")}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
            />
          </View>

          {/* Greeting */}
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold text-primary-darkGreen mb-1.5">
              Welcome Back!
            </Text>
            <Text className="text-sm text-gray-500 text-center leading-5">
              Login to access your delivery dashboard{"\n"}and start earning today.
            </Text>
          </View>

          {/* Login Card */}
          <View className="w-full bg-white rounded-3xl p-6 shadow-sm mb-6">
            {/* Card Header */}
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 rounded-xl bg-primary-lightGreen items-center justify-center mr-3">
                <MaterialCommunityIcons name="bike-fast" size={26} color="#304B26" />
              </View>
              <View>
                <Text className="text-lg font-bold text-primary-darkGreen mb-0.5">
                  Delivery Partner Login
                </Text>
                <Text className="text-xs text-gray-500">Please sign in to continue</Text>
              </View>
            </View>

            {/* Error Message */}
            {!!error && (
              <View className="flex-row items-center mb-4 bg-status-errorLight p-2.5 rounded-xl">
                <Ionicons name="alert-circle-outline" size={14} color="#D32F2F" />
                <Text className="text-[13px] text-status-error ml-1.5 flex-1">
                  {error}
                </Text>
              </View>
            )}

            {/* Email */}
            <View className="mb-4">
              <Text className="text-[13px] font-semibold text-gray-700 mb-1.5 ml-0.5">
                Email Address
              </Text>
              <View
                className={`flex-row items-center border rounded-xl h-[52px] px-3 bg-[#FAFAFA] ${
                  error ? "border-status-error bg-status-errorLight" : "border-gray-200"
                }`}
              >
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (error) setError("");
                  }}
                  placeholder="Enter your email address"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{ flex: 1, fontSize: 15, color: "#1A1A1A", height: "100%", paddingVertical: 0, marginLeft: 8 }}
                  maxLength={100}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
            </View>

            {/* Password */}
            <View className="mb-4">
              <Text className="text-[13px] font-semibold text-gray-700 mb-1.5 ml-0.5">
                Password
              </Text>
              <View
                className={`flex-row items-center border rounded-xl h-[52px] px-3 bg-[#FAFAFA] ${
                  error ? "border-status-error bg-status-errorLight" : "border-gray-200"
                }`}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (error) setError("");
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPass}
                  style={{ flex: 1, fontSize: 15, color: "#1A1A1A", height: "100%", paddingVertical: 0, marginLeft: 8 }}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} className="p-1">
                  <Ionicons
                    name={showPass ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="self-end mb-5" activeOpacity={0.7}>
              <Text className="text-[13px] text-accent-orange font-semibold">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className={`flex-row items-center justify-center bg-primary-darkGreen rounded-xl h-[52px] shadow-sm ${
                loading ? "opacity-70" : ""
              }`}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="bike-fast"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-base font-bold text-white">Login</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-5">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-3 text-[13px] text-gray-400">or login with</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* WhatsApp Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center border border-gray-200 rounded-xl h-[52px] bg-white"
              activeOpacity={0.8}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text className="text-[15px] font-semibold text-gray-700 ml-2">
                Login with WhatsApp
              </Text>
            </TouchableOpacity>

            {/* Secure Note */}
            <View className="flex-row items-center justify-center mt-4">
              <Ionicons name="shield-checkmark" size={14} color="#22C55E" />
              <Text className="text-xs text-gray-400 ml-1.5">
                Secure login for Delivery Partners only
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View className="w-full items-center mt-2">
            <View className="flex-row items-center justify-between w-full mb-5 px-2.5">
              <MaterialCommunityIcons name="bike" size={36} color="#304B26" style={{ opacity: 0.5 }} />
              <View className="flex-1 items-center px-4">
                <Text className="text-[15px] font-bold text-primary-darkGreen mb-1 text-center">
                  Deliver fast. Earn more.
                </Text>
                <Text className="text-xs text-gray-400 text-center leading-4">
                  Manage your orders and earnings{"\n"}all in one place.
                </Text>
              </View>
              <MaterialCommunityIcons name="map-marker-path" size={36} color="#304B26" style={{ opacity: 0.5 }} />
            </View>

            <Text className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Text className="text-accent-orange font-bold">Contact Admin</Text>
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
