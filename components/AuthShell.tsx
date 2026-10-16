import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { colors } from "@/constants/theme";

/** Shared layout for sign-up / sign-in (mockup 03). */
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24, width: "100%", maxWidth: 560, alignSelf: "center" }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/onboarding"))}
            className="mt-2 w-10 h-10 justify-center"
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={26} color={colors.ink} />
          </TouchableOpacity>
          <Text className="h1 mt-3" style={{ fontSize: 28, lineHeight: 36 }}>{title}</Text>
          <Text className="body-lg text-muted mt-1">{subtitle}</Text>
          <View className="items-center mt-2">
            <Image source={images.mascotAuth} style={{ width: 180, height: 130 }} contentFit="contain" />
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <View className="flex-row items-center my-5">
      <View className="flex-1 h-px bg-line" />
      <Text className="body-sm mx-4">{label}</Text>
      <View className="flex-1 h-px bg-line" />
    </View>
  );
}
