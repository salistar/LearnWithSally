import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getLesson } from "@/data/lessons";

/** Browser preview: native WebRTC must never be imported by the web renderer. */
export default function LessonPreview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = getLesson(id);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        <TouchableOpacity onPress={() => router.back()} className="btn-primary">
          <Text className="btn-primary__label">Back to lessons</Text>
        </TouchableOpacity>
        <Text className="h2">{lesson?.title ?? "Lesson not found"}</Text>
        <View className="card p-4">
          <Text className="body-lg">Practise with Sally on Android</Text>
          <Text className="body-sm mt-2">Install the Android app for live voice lessons. You can review the vocabulary here and use the Chat tab in your browser.</Text>
        </View>
        {lesson?.phrases.map(phrase => (
          <View key={phrase.text} className="card p-4">
            <Text className="h3">{phrase.text}</Text>
            <Text className="body-md">{phrase.translation}</Text>
            <Text className="body-sm">{phrase.pronunciation}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
