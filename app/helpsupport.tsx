import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Colors } from './src/constants/Colors';
import '../global.css';

export default function HelpSupport() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const faqs = [
    { q: "How do I accept an order?", a: "Go to the Orders tab, tap on a new order card, and press 'Accept Order'." },
    { q: "How do I track my earnings?", a: "Visit the Earnings tab to see daily, weekly breakdowns and your payout history." },
    { q: "What do I do if I can't find the customer?", a: "Use the 'Contact Customer' button on the Track Order screen to call them directly." },
    { q: "How long does payout take?", a: "Payouts are processed weekly every Monday directly to your registered bank account." },
    { q: "How do I update my vehicle details?", a: "Go to Profile → Vehicle Information to view your registered vehicle details." },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-main" edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-6 pb-5 z-50" style={{ paddingTop: Math.max(insets.top + 8, 20), backgroundColor: Colors.primary.darkGreen, paddingBottom: 16 }}>
        <View className="flex-row items-center mt-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Help & Support</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 mt-6 pb-10">

          <Text className="text-black font-bold text-sm mb-3">Contact Us</Text>
          <View className="flex-row mb-6">
            <TouchableOpacity
              className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 items-center shadow-sm"
              onPress={() => Linking.openURL('tel:+919999999999')}
            >
              <View className="w-12 h-12 rounded-full bg-primary-lightGreen items-center justify-center mb-2">
                <Feather name="phone" size={22} color={Colors.primary.darkGreen} />
              </View>
              <Text className="text-black font-bold text-xs">Call Support</Text>
              <Text className="text-gray-400 text-[10px] mt-0.5">24/7 Available</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 items-center shadow-sm mx-3"
              onPress={() => Linking.openURL('mailto:support@veetirusi.com')}
            >
              <View className="w-12 h-12 rounded-full bg-primary-lightGreen items-center justify-center mb-2">
                <Feather name="mail" size={22} color={Colors.primary.darkGreen} />
              </View>
              <Text className="text-black font-bold text-xs">Email Us</Text>
              <Text className="text-gray-400 text-[10px] mt-0.5">Reply in 24h</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 items-center shadow-sm"
              onPress={() => Linking.openURL('https://wa.me/919999999999')}
            >
              <View className="w-12 h-12 rounded-full bg-green-50 items-center justify-center mb-2">
                <Feather name="message-circle" size={22} color="#25D366" />
              </View>
              <Text className="text-black font-bold text-xs">WhatsApp</Text>
              <Text className="text-gray-400 text-[10px] mt-0.5">Quick Reply</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-black font-bold text-sm mb-3">Frequently Asked Questions</Text>
          {faqs.map((faq, i) => (
            <FAQCard key={i} question={faq.q} answer={faq.a} />
          ))}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FAQCard({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl px-5 py-4 mb-3 border border-gray-100 shadow-sm"
      onPress={() => setOpen(!open)}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-black font-semibold text-sm flex-1 pr-3">{question}</Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={18} color={Colors.text.muted} />
      </View>
      {open && (
        <Text className="text-gray-500 text-xs mt-3 leading-5">{answer}</Text>
      )}
    </TouchableOpacity>
  );
}
