import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { colors } from "@/constants/theme";
import { useLanguageStore } from "@/store/languageStore";

// Entry router (step 08):
//   signed out                → onboarding
//   signed in, no language    → language-select
//   signed in, language saved → home tabs
export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const selectedLanguage = useLanguageStore((s) => s.selectedLanguage);
  const [hydrated, setHydrated] = useState(useLanguageStore.persist.hasHydrated());

  // Wait for AsyncStorage so we don't flash the wrong screen.
  useEffect(() => {
    if (hydrated) return;
    return useLanguageStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  if (!isLoaded || !hydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href="/onboarding" />;
  if (!selectedLanguage) return <Redirect href="/language-select" />;
  return <Redirect href="/(tabs)" />;
}
