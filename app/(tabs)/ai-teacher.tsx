import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { getLanguage } from "@/data/languages";
import { getCurrentLesson } from "@/lib/progress";
import { useLanguageStore } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";

export default function AITeacher() {
  const code = useLanguageStore((s) => s.selectedLanguage);
  const completed = useLearningStore((s) => s.completedLessonIds);
  const language = getLanguage(code);
  const current = code ? getCurrentLesson(code, completed) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }} edges={["top"]}>
      <View className="flex-1 px-6 items-center justify-center">
        <Image source={images.mascotWelcome} style={{ width: 220, height: 220 }} contentFit="contain" />
        <Text className="h2 text-center mt-4">Talk with Sally</Text>
        <Text className="body-md text-muted text-center mt-2">
          Practise {language?.name ?? "your language"} out loud. Sally listens, corrects you and keeps it short and fun.
        </Text>
        {current ? (
          <TouchableOpacity
            className="btn-primary self-stretch mt-8"
            onPress={() => router.push({ pathname: "/lesson/[id]", params: { id: current.lesson.id } })}
          >
            <Text className="btn-primary__label">Start: {current.lesson.title}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
