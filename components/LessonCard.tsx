import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/constants/theme";
import { Lesson, LessonStatus } from "@/types/learning";

export default function LessonCard({ lesson, status, onPress }: { lesson: Lesson; status: LessonStatus; onPress: () => void }) {
  const inProgress = status === "in-progress";
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`flex-row items-center rounded-2xl px-5 py-4 mb-3 border-[1.5px] ${
        inProgress ? "bg-[#F7F5FF] border-sally-purple" : "bg-white border-[#eef0f4]"
      }`}
    >
      <View className="flex-1">
        <Text className={`body-sm ${inProgress ? "text-sally-purple" : ""}`}>Lesson {lesson.order}</Text>
        <Text className="h4 mt-0.5">{lesson.title}</Text>
        <Text className={`caption mt-0.5 ${inProgress ? "text-sally-purple" : ""}`}>
          {status === "completed" ? "Completed" : inProgress ? "In progress" : lesson.description}
        </Text>
      </View>
      {status === "completed" ? (
        <Ionicons name="checkmark-circle" size={28} color={colors.success} />
      ) : (
        <Text style={{ fontSize: 28 }}>{lesson.icon}</Text>
      )}
    </TouchableOpacity>
  );
}
