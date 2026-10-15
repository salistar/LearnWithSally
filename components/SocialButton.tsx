import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export type SocialProvider = "google" | "facebook" | "apple";

const CONFIG: Record<SocialProvider, { label: string; icon: React.ReactNode }> = {
  google: { label: "Continue with Google", icon: <AntDesign name="google" size={22} color="#EA4335" /> },
  facebook: { label: "Continue with Facebook", icon: <FontAwesome name="facebook-official" size={24} color="#1877F2" /> },
  apple: { label: "Continue with Apple", icon: <AntDesign name="apple" size={24} color="#0d132b" /> },
};

export default function SocialButton({
  provider,
  onPress,
  disabled,
}: {
  provider: SocialProvider;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { label, icon } = CONFIG[provider];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      className="card flex-row items-center py-4 px-6 mb-3"
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <View className="w-8 items-center">{icon}</View>
      <Text className="font-poppins-medium text-[15px] text-ink ml-6">{label}</Text>
    </TouchableOpacity>
  );
}
