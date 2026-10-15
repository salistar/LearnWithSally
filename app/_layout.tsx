import "../global.css";

import { ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { PostHogProvider } from "posthog-react-native";
import { useEffect } from "react";

import { posthog } from "@/lib/posthog";
import { useLanguageStore } from "@/store/languageStore";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — copy .env.example to .env and fill it in.");
}

SplashScreen.preventAutoHideAsync();

/** Links PostHog events to the Clerk user once signed in (step 18). */
function AnalyticsIdentity() {
  const { isLoaded, isSignedIn, user } = useUser();
  const selectedLanguage = useLanguageStore((s) => s.selectedLanguage);
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      posthog.identify(user.id, { preferred_language: selectedLanguage });
    } else {
      posthog.reset();
    }
  }, [isLoaded, isSignedIn, user, selectedLanguage]);

  useEffect(() => {
    posthog.screen(pathname);
  }, [pathname]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <PostHogProvider client={posthog} autocapture={{ captureScreens: false, captureTouches: false }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <AnalyticsIdentity />
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#ffffff" } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="language-select" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="lesson/[id]" options={{ gestureEnabled: false }} />
        </Stack>
      </ClerkProvider>
    </PostHogProvider>
  );
}
