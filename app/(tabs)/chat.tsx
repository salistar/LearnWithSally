import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";

// Placeholder tab — text chat with Sally is not part of this version.
export default function Chat() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }} edges={["top"]}>
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-20 h-20 rounded-full bg-surface items-center justify-center">
          <Ionicons name="chatbubble-ellipses-outline" size={36} color={colors.purple} />
        </View>
        <Text className="h3 mt-4">Chat is coming soon</Text>
        <Text className="body-md text-muted text-center mt-2">
          For now, practise speaking with Sally from the AI Teacher tab.
        </Text>
      </View>
    </SafeAreaView>
  );
}
