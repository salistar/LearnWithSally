import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Logo from "@/components/Logo";
import { images } from "@/constants/images";

function Bubble({ text, className, textClassName }: { text: string; className: string; textClassName?: string }) {
  return (
    <View className={`absolute rounded-2xl px-4 py-2.5 ${className}`}>
      <Text className={`font-poppins-medium text-lg ${textClassName ?? "text-ink"}`}>{text}</Text>
    </View>
  );
}

export default function Onboarding() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View className="flex-1 px-6">
        <View className="mt-4">
          <Logo />
        </View>

        <Text className="h1 mt-8" style={{ fontSize: 34, lineHeight: 42 }}>
          Your AI language{"\n"}
          <Text className="text-sally-purple">teacher</Text>.
        </Text>
        <Text className="body-lg text-muted mt-3">
          Real conversations, personalized lessons, anytime, anywhere.
        </Text>

        {/* Illustration */}
        <View className="flex-1 mt-4" style={{ minHeight: 260 }}>
          <Image source={images.mascotWelcome} style={{ flex: 1, marginTop: 56 }} contentFit="contain" />
          <Bubble text="Hello!" className="top-6 left-0 bg-[#EEF4FF]" />
          <Bubble text="¡Hola!" className="top-0 right-4 bg-[#F1EEFF]" textClassName="text-sally-deep-purple" />
          <Bubble text="你好!" className="top-24 right-0 bg-[#FFF1EE]" textClassName="text-error" />
        </View>

        <TouchableOpacity
          className="btn-primary mb-6 mt-4"
          activeOpacity={0.85}
          onPress={() => router.push("/(auth)/sign-up")}
          accessibilityRole="button"
        >
          <Text className="btn-primary__label flex-1 text-center">Get Started</Text>
          <Ionicons name="chevron-forward" size={22} color="#fff" style={{ position: "absolute", right: 20 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
