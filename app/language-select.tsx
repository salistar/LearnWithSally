import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { LANGUAGES } from "@/data/languages";
import { track } from "@/lib/posthog";
import { useLanguageStore } from "@/store/languageStore";
import { Language, LanguageCode } from "@/types/learning";

function LanguageRow({ language, selected, onPress }: { language: Language; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`flex-row items-center px-4 py-3.5 mb-2.5 rounded-2xl border-[1.5px] ${
        selected ? "bg-[#F4F1FF] border-sally-purple" : "bg-white border-[#eef0f4]"
      }`}
    >
      <View className="w-12 h-12 rounded-full bg-surface items-center justify-center">
        <Text style={{ fontSize: 28 }}>{language.flag}</Text>
      </View>
      <View className="flex-1 ml-4">
        <Text className="h4">{language.name}</Text>
        <Text className="body-sm">{language.learners} learners</Text>
      </View>
      {selected ? (
        <View className="w-7 h-7 rounded-full bg-sally-purple items-center justify-center">
          <Ionicons name="checkmark" size={18} color="#fff" />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      )}
    </TouchableOpacity>
  );
}

export default function LanguageSelect() {
  const savedLanguage = useLanguageStore((s) => s.selectedLanguage);
  const setSelectedLanguage = useLanguageStore((s) => s.setSelectedLanguage);
  const [selected, setSelected] = useState<LanguageCode | null>(savedLanguage);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter((l) => l.name.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q));
  }, [query]);

  function confirm() {
    if (!selected) return;
    setSelectedLanguage(selected);
    track("language_selected", { language: selected, previous_language: savedLanguage });
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View className="flex-row items-center px-5 pt-2 pb-3">
        {router.canGoBack() ? (
          <TouchableOpacity onPress={() => router.back()} className="w-10" accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={26} color={colors.ink} />
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}
        <Text className="h4 flex-1 text-center" style={{ fontSize: 18 }}>Choose a language</Text>
        <View className="w-10" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(l) => l.code}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View className="flex-row items-center bg-surface rounded-2xl px-4 py-1 border border-[#eef0f4]">
              <Ionicons name="search" size={20} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search languages"
                placeholderTextColor={colors.muted}
                style={{ flex: 1, marginLeft: 10, paddingVertical: 10, fontFamily: "Poppins-Regular", fontSize: 15, color: colors.ink }}
              />
            </View>
            <Text className="h4 mt-5 mb-3">Popular</Text>
          </>
        }
        renderItem={({ item }) => (
          <LanguageRow language={item} selected={item.code === selected} onPress={() => setSelected(item.code)} />
        )}
        ListEmptyComponent={<Text className="body-md text-muted text-center mt-6">No language matches “{query}”.</Text>}
        ListFooterComponent={
          <Image source={images.earth} style={{ width: "100%", height: 150, marginTop: 8 }} contentFit="contain" />
        }
      />

      <View className="px-5 pb-4 pt-2">
        <TouchableOpacity
          className="btn-primary"
          style={{ opacity: selected ? 1 : 0.5 }}
          disabled={!selected}
          onPress={confirm}
          activeOpacity={0.85}
        >
          <Text className="btn-primary__label">{selected ? "Continue" : "Pick a language"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
