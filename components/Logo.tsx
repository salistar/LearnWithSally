import { Image } from "expo-image";
import { Text, View } from "react-native";

import { images } from "@/constants/images";

export default function Logo({ size = 44 }: { size?: number }) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      <Image source={images.mascotLogo} style={{ width: size, height: size }} contentFit="contain" />
      <Text className="font-poppins-semibold text-ink" style={{ fontSize: size * 0.62 }}>
        learn with <Text className="text-sally-purple">sally</Text>
      </Text>
    </View>
  );
}
