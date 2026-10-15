import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { getLanguage } from "@/data/languages";
import { apiFetch } from "@/lib/api";
import { ChatEntry, useChatStore } from "@/store/chatStore";
import { useLanguageStore } from "@/store/languageStore";

const EMPTY: ChatEntry[] = [];

export default function Chat() {
  const { getToken } = useAuth();
  const code = useLanguageStore((s) => s.selectedLanguage);
  const messages = useChatStore((s) => (code ? s.conversations[code] : undefined) ?? EMPTY);
  const add = useChatStore((s) => s.add);
  const clear = useChatStore((s) => s.clear);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<FlatList<ChatEntry>>(null);

  const language = getLanguage(code);
  if (!code || !language) return null;

  async function send() {
    const text = input.trim();
    if (!text || sending || !code) return;
    setInput("");
    setError("");
    const userEntry: ChatEntry = { id: `${Date.now()}-u`, role: "user", content: text };
    add(code, userEntry);
    setSending(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      const history = [...messages, userEntry].map(({ role, content }) => ({ role, content }));
      const res = await apiFetch("/api/chat", token, {
        method: "POST",
        body: JSON.stringify({ language: code, messages: history }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error ?? `HTTP ${res.status}`);
      add(code, { id: `${Date.now()}-a`, role: "assistant", content: data.reply });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Message not sent");
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-2 pb-3 border-b border-[#eef0f4]">
          <Image source={images.mascotLogo} style={{ width: 40, height: 40 }} contentFit="contain" />
          <View className="flex-1 ml-3">
            <Text className="h4">Chat with Sally</Text>
            <Text className="caption">
              {language.flag} Practising {language.name}
            </Text>
          </View>
          {messages.length > 0 ? (
            <TouchableOpacity onPress={() => clear(code)} accessibilityLabel="Clear conversation">
              <Ionicons name="trash-outline" size={22} color={colors.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6">
              <Image source={images.mascotWelcome} style={{ width: 150, height: 150 }} contentFit="contain" />
              <Text className="h4 text-center mt-3">Say {language.hello} to Sally!</Text>
              <Text className="body-sm text-center mt-1">
                Write in {language.name} or English. Sally corrects you gently and keeps the conversation going.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              className={`max-w-[85%] rounded-2xl px-4 py-3 mb-2 ${
                item.role === "user" ? "self-end bg-sally-purple" : "self-start bg-surface"
              }`}
            >
              <Text className={`body-md ${item.role === "user" ? "text-white" : ""}`}>{item.content}</Text>
            </View>
          )}
          ListFooterComponent={
            <>
              {sending ? (
                <View className="self-start bg-surface rounded-2xl px-4 py-3">
                  <ActivityIndicator color={colors.purple} size="small" />
                </View>
              ) : null}
              {error ? <Text className="body-sm text-error mt-2">{error}</Text> : null}
            </>
          }
        />

        {/* Composer */}
        <View className="flex-row items-end px-4 py-3 border-t border-[#eef0f4]">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={`Write to Sally…`}
            placeholderTextColor={colors.muted}
            multiline
            maxLength={1000}
            style={{
              flex: 1,
              maxHeight: 110,
              backgroundColor: colors.surface,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: 10,
              fontFamily: "Poppins-Regular",
              fontSize: 15,
              color: colors.ink,
            }}
          />
          <TouchableOpacity
            onPress={send}
            disabled={!input.trim() || sending}
            accessibilityLabel="Send"
            className="w-11 h-11 rounded-full bg-sally-purple items-center justify-center ml-2"
            style={{ opacity: !input.trim() || sending ? 0.5 : 1 }}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
