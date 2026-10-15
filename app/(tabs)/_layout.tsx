import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";

import TabBar from "@/components/TabBar";
import { useLanguageStore } from "@/store/languageStore";

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const selectedLanguage = useLanguageStore((s) => s.selectedLanguage);

  // Private area: signed-out users go back to onboarding.
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/onboarding" />;
  if (!selectedLanguage) return <Redirect href="/language-select" />;

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="ai-teacher" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
