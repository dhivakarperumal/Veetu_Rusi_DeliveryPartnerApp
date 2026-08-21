import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

export default function LoginScreen() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView
      className="flex-1 bg-background-main"
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Banner with Logo */}
          <View className="bg-[#FDF8EF] items-center justify-center pt-10 pb-8 px-8 rounded-b-[48px] overflow-hidden">
            {/* Scooter + Logo Row */}
            <View className="flex-row items-center justify-center w-full">
              <Image
                source={require("../../../assets/images/logo.png")}
                className="w-28 h-28"
                resizeMode="contain"
              />
              <View className="ml-2 items-center">
                <Text
                  className="text-accent-darkBrown font-extrabold text-3xl"
                  style={{ fontStyle: "italic" }}
                >
                  Veetu Rusi
                </Text>
                <Text className="text-accent-darkBrown text-xs mt-0.5">
                  வீட்டு ருசி
                </Text>
                <Text className="text-gray-500 text-[10px] mt-1">
                  Traditional Taste, Homely Feel
                </Text>
              </View>
            </View>
          </View>

          {/* Form Section */}
          <View className="flex-1 px-6 pt-8">
            <Text className="text-black font-extrabold text-2xl">
              Welcome Back
            </Text>
            <Text className="text-gray-500 text-sm mt-1 mb-8">
              Login to continue
            </Text>

            {/* Mobile Number */}
            <Text className="text-gray-700 font-semibold text-xs mb-2">
              Mobile Number
            </Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3 mb-5">
              <Text className="text-black font-bold text-sm mr-2">+91</Text>
              <View className="w-px h-5 bg-gray-200 mr-3" />
              <TextInput
                className="flex-1 text-black text-sm"
                placeholder="98765 43210"
                placeholderTextColor="#BDBDBD"
                keyboardType="phone-pad"
                maxLength={10}
                value={mobile}
                onChangeText={setMobile}
              />
            </View>

            {/* Password */}
            <Text className="text-gray-700 font-semibold text-xs mb-2">
              Password
            </Text>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3 mb-2">
              <TextInput
                className="flex-1 text-black text-sm"
                placeholder="Enter password"
                placeholderTextColor="#BDBDBD"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={18}
                  color={Colors.text.muted}
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="self-end mb-8">
              <Text className="text-accent-orange font-semibold text-xs">
                Forgot?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className="bg-primary-darkGreen w-full py-4 rounded-2xl items-center shadow-md mb-6"
              onPress={() => router.replace("/")}
            >
              <Text className="text-white font-bold text-base">Login</Text>
            </TouchableOpacity>

            {/* Or continue with */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="text-gray-400 text-xs mx-4">
                or continue with
              </Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Social Login */}
            <View className="flex-row justify-center space-x-5 mb-8">
              <TouchableOpacity className="w-14 h-14 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm">
                {/* Google Icon */}
                <Text
                  className="text-base font-bold"
                  style={{ color: "#EA4335" }}
                >
                  G
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-14 h-14 bg-[#25D366] border border-gray-100 rounded-full items-center justify-center shadow-sm ml-5">
                {/* WhatsApp Icon */}
                <Feather name="message-circle" size={22} color="white" />
              </TouchableOpacity>
            </View>

            {/* Register */}
            <View className="flex-row justify-center pb-8">
              <Text className="text-gray-500 text-sm">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity>
                <Text className="text-accent-orange font-bold text-sm">
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
