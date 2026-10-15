import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LessonCard from "@/components/LessonCard";
import { images } from "@/constants/images";
import { getLanguage } from "@/data/languages";
import { getLessonsForUnit } from "@/data/lessons";
import { getUnitsForLanguage } from "@/data/units";
import { useLanguageStore } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";

type Tab = "lessons" | "practice";

export default function Learn() {
  const code = useLanguageStore((s) => s.selectedLanguage);
  const completed = useLearningStore((s) => s.completedLessonIds);
  const started = useLearningStore((s) => s.startedLessonIds);
  const [tab, setTab] = useState<Tab>("lessons");

  const language = getLanguage(code);
  const units = code ? getUnitsForLanguage(code) : [];

  if (!language || units.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text className="h3 text-center">No lessons yet</Text>
        <Text className="body-md text-muted text-center mt-2">Content for this language is coming soon.</Text>
        <TouchableOpacity className="btn-primary px-8 mt-6" onPress={() => router.push("/language-select")}>
          <Text className="btn-primary__label">Choose another language</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusOf = (id: string) =>
    completed.includes(id) ? "completed" : started.includes(id) ? "in-progress" : "not-started";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {units.map((unit) => {
          const lessons = getLessonsForUnit(unit.id);
          const done = lessons.filter((l) => completed.includes(l.id)).length;
          return (
            <View key={unit.id}>
              {/* Unit hero */}
              <View className="px-5 pt-3">
                <Text className="h3">
                  {language.flag} {unit.title}
                </Text>
                <Text className="body-sm">
                  {unit.level} • Unit {unit.order} • {done} / {lessons.length} lessons
                </Text>
              </View>
              <View className="mx-5 mt-3 rounded-3xl bg-[#EEF4FF] flex-row items-end overflow-hidden" style={{ height: 160 }}>
                <Image source={images.mascotWelcome} style={{ width: 150, height: 150 }} contentFit="contain" />
                <View className="flex-1 pb-5 pr-4">
                  <Text className="body-md">{unit.description}</Text>
                </View>
              </View>

              {/* Lessons / Practice switch */}
              <View className="flex-row mx-5 mt-4 mb-4 bg-surface rounded-2xl p-1">
                {(["lessons", "practice"] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setTab(t)}
                    className={`flex-1 py-3 rounded-xl items-center ${tab === t ? "bg-white" : ""}`}
                  >
                    <Text className={`font-poppins-semibold text-[15px] ${tab === t ? "text-sally-purple" : "text-muted"}`}>
                      {t === "lessons" ? "Lessons" : "Practice"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="px-5">
                {tab === "lessons"
                  ? lessons.map((lesson) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        status={statusOf(lesson.id)}
                        onPress={() => router.push({ pathname: "/lesson/[id]", params: { id: lesson.id } })}
                      />
                    ))
                  : lessons.map((lesson) => (
                      <View key={lesson.id} className="card px-5 py-4 mb-3">
                        <Text className="h4 mb-2">
                          {lesson.icon} {lesson.title}
                        </Text>
                        {lesson.vocabulary.map((word) => (
                          <View key={word.word} className="flex-row justify-between py-1">
                            <Text className="body-md font-poppins-medium flex-1">{word.word}</Text>
                            <Text className="body-sm flex-1 text-right">{word.translation}</Text>
                          </View>
                        ))}
                      </View>
                    ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
