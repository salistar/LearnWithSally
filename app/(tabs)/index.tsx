import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { getLanguage } from "@/data/languages";
import { getCurrentLesson } from "@/lib/progress";
import { useLanguageStore } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";

type IconName = keyof typeof Ionicons.glyphMap;

function PlanItem({
  icon,
  tint,
  title,
  subtitle,
  done,
  onPress,
}: {
  icon: IconName;
  tint: string;
  title: string;
  subtitle: string;
  done?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-row items-center py-3">
      <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: tint }}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <View className="flex-1 ml-4">
        <Text className="h4">{title}</Text>
        <Text className="body-sm">{subtitle}</Text>
      </View>
      {done ? (
        <View className="w-7 h-7 rounded-full bg-sally-purple items-center justify-center">
          <Ionicons name="checkmark" size={17} color="#fff" />
        </View>
      ) : (
        <View className="w-7 h-7 rounded-full border-2 border-[#9ca3af]" />
      )}
    </TouchableOpacity>
  );
}

export default function Home() {
  const { user } = useUser();
  const code = useLanguageStore((s) => s.selectedLanguage);
  const completedLessonIds = useLearningStore((s) => s.completedLessonIds);
  const dailyGoal = useLearningStore((s) => s.dailyGoal);
  const xpToday = useLearningStore((s) => s.getXpToday());
  const streak = useLearningStore((s) => s.getStreak());

  const language = getLanguage(code);
  const current = code ? getCurrentLesson(code, completedLessonIds) : null;
  if (!language || !current) return null;

  const firstName = user?.firstName || user?.username || "there";
  const progress = Math.min(xpToday / dailyGoal, 1);
  const lessonNumber = current.lesson.order;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center mt-2 mb-5">
          <TouchableOpacity
            onPress={() => router.push("/language-select")}
            className="w-11 h-11 rounded-full bg-surface items-center justify-center"
            accessibilityLabel="Change language"
          >
            <Text style={{ fontSize: 26 }}>{language.flag}</Text>
          </TouchableOpacity>
          <Text className="h4 flex-1 ml-3" style={{ fontSize: 18 }} numberOfLines={1}>
            {language.hello}, {firstName}! 👋
          </Text>
          <Image source={images.streakFire} style={{ width: 26, height: 26 }} contentFit="contain" />
          <Text className="h4 ml-1 mr-4">{streak}</Text>
          <Ionicons name="notifications-outline" size={24} color={colors.ink} />
        </View>

        {/* Daily goal */}
        <View className="rounded-[20px] bg-[#FFF6EE] px-5 py-4 flex-row items-center">
          <View className="flex-1">
            <Text className="body-md">Daily goal</Text>
            <Text className="mt-1">
              <Text className="h2">{xpToday}</Text>
              <Text className="body-md text-muted"> / {dailyGoal} XP</Text>
            </Text>
            <View className="h-2.5 rounded-full bg-[#FBE3CF] mt-3 overflow-hidden">
              <View className="h-full rounded-full bg-streak" style={{ width: `${progress * 100}%` }} />
            </View>
          </View>
          <Image source={images.treasure} style={{ width: 92, height: 80, marginLeft: 12 }} contentFit="contain" />
        </View>

        {/* Continue learning */}
        <View className="flex-row rounded-[20px] bg-sally-purple mt-5 overflow-hidden" style={{ minHeight: 170 }}>
          <View className="flex-1 p-5 justify-between">
            <View>
              <Text className="body-md text-white/80">Continue learning</Text>
              <Text className="h2 text-white mt-1">{language.name}</Text>
              <Text className="body-md text-white/90">
                {current.unit.level} • Unit {current.unit.order} • Lesson {lessonNumber}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/lesson/[id]", params: { id: current.lesson.id } })}
              className="self-start bg-white rounded-xl px-6 py-2.5 mt-3"
              activeOpacity={0.85}
            >
              <Text className="font-poppins-semibold text-[15px] text-sally-purple">Continue</Text>
            </TouchableOpacity>
          </View>
          <Image source={images.palace} style={{ width: 140, alignSelf: "flex-end", height: 150 }} contentFit="contain" />
        </View>

        {/* Today's plan */}
        <View className="flex-row items-center justify-between mt-6 mb-1">
          <Text className="h4" style={{ fontSize: 18 }}>Today&apos;s plan</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/learn")}>
            <Text className="font-poppins-semibold text-[15px] text-sally-purple">View all</Text>
          </TouchableOpacity>
        </View>
        <PlanItem
          icon="book"
          tint={colors.purple}
          title="Lesson"
          subtitle={current.lesson.title}
          done={xpToday > 0}
          onPress={() => router.push({ pathname: "/lesson/[id]", params: { id: current.lesson.id } })}
        />
        <PlanItem
          icon="headset"
          tint={colors.blue}
          title="AI Conversation"
          subtitle="Talk with Sally"
          onPress={() => router.push("/(tabs)/ai-teacher")}
        />
        <PlanItem
          icon="chatbubbles"
          tint="#F26D6D"
          title="New words"
          subtitle={`${current.lesson.vocabulary.length} words`}
          onPress={() => router.push("/(tabs)/learn")}
        />

        {/* Next up */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: "/lesson/[id]", params: { id: current.lesson.id } })}
          className="flex-row items-center rounded-[20px] bg-[#F0F7E9] px-5 py-4 mt-4"
        >
          <View className="flex-1">
            <Text className="body-sm">Next up</Text>
            <Text className="h4" style={{ fontSize: 18 }}>AI Voice Lesson</Text>
            <Text className="body-sm">Practice speaking with Sally</Text>
          </View>
          <Image source={images.mascotLogo} style={{ width: 72, height: 72 }} contentFit="contain" />
          <View className="w-12 h-12 rounded-full bg-sally-green items-center justify-center ml-2">
            <Ionicons name="mic" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
