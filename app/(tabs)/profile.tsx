import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { getLanguage } from "@/data/languages";
import { useLanguageStore } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <View className="flex-1 card items-center py-4">
      <Text className="h3">{value}</Text>
      <Text className="caption mt-1">{label}</Text>
    </View>
  );
}

function Row({ icon, label, onPress, danger }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center py-4 border-b border-[#eef0f4]">
      <Ionicons name={icon} size={22} color={danger ? colors.error : colors.ink} />
      <Text className={`body-lg flex-1 ml-4 ${danger ? "text-error" : ""}`}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </TouchableOpacity>
  );
}

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const code = useLanguageStore((s) => s.selectedLanguage);
  const clearLanguage = useLanguageStore((s) => s.clearSelectedLanguage);
  const completed = useLearningStore((s) => s.completedLessonIds.length);
  const streak = useLearningStore((s) => s.getStreak());
  const xpToday = useLearningStore((s) => s.getXpToday());
  const resetProgress = useLearningStore((s) => s.resetProgress);
  const language = getLanguage(code);

  async function handleSignOut() {
    await signOut();
    router.replace("/onboarding");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="items-center">
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={{ width: 88, height: 88, borderRadius: 44 }} />
          ) : (
            <Image source={images.mascotLogo} style={{ width: 88, height: 88 }} contentFit="contain" />
          )}
          <Text className="h3 mt-3">{user?.fullName || user?.primaryEmailAddress?.emailAddress || "Learner"}</Text>
          <Text className="body-sm">
            Learning {language?.flag} {language?.name}
          </Text>
        </View>

        <View className="flex-row gap-3 mt-6">
          <Stat value={streak} label="Day streak" />
          <Stat value={xpToday} label="XP today" />
          <Stat value={completed} label="Lessons done" />
        </View>

        <View className="mt-6">
          <Row icon="language-outline" label="Change language" onPress={() => router.push("/language-select")} />
          <Row icon="log-out-outline" label="Sign out" onPress={handleSignOut} danger />
        </View>

        {/* Dev-only tools to re-test the entry flow (step 08) */}
        {__DEV__ ? (
          <View className="mt-8">
            <Text className="caption mb-2">DEVELOPER TOOLS</Text>
            <Row
              icon="refresh-outline"
              label="Reset language (re-test selection)"
              onPress={() => {
                clearLanguage();
                router.replace("/");
              }}
            />
            <Row
              icon="trash-outline"
              label="Reset local progress"
              onPress={() =>
                Alert.alert("Reset progress?", "XP, streak and completed lessons will be cleared.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Reset", style: "destructive", onPress: resetProgress },
                ])
              }
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
