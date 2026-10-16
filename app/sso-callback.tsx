import { useAuth, useClerk } from "@clerk/expo";
import { Redirect, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from "react-native";

export default function SSOCallback() {
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();
  const finalizing = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isLoaded || isSignedIn || finalizing.current) return;
    // Native SSO is finalized by useSSO after WebBrowser returns its deep link.
    if (Platform.OS !== "web") return;
    finalizing.current = true;
    // Clerk handles OAuth verification, first-time sign-up transfer and session
    // activation. Reading status immediately after redirect misses that work.
    void clerk.handleRedirectCallback({
      signInUrl: "/sign-in",
      signUpUrl: "/sign-up",
      signInFallbackRedirectUrl: "/",
      signUpFallbackRedirectUrl: "/",
    }).catch(() => setError("We couldn't complete sign-in. Please try again."));
  }, [isLoaded, isSignedIn, clerk]);
  if (isSignedIn) return <Redirect href="/" />;
  return (
    <View className="flex-1 items-center justify-center bg-white p-6 gap-4">
      {error ? <>
        <Text className="body-md">{error}</Text>
        <TouchableOpacity className="btn-primary" onPress={() => router.replace("/(auth)/sign-in")}>
          <Text className="btn-primary__label">Back to sign in</Text>
        </TouchableOpacity>
      </> : <ActivityIndicator />}
    </View>
  );
}
