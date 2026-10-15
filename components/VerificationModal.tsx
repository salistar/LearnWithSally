import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/constants/theme";

interface Props {
  visible: boolean;
  email: string;
  error?: string;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
}

const CODE_LENGTH = 6;

/** Bottom sheet with a 6-digit code, kept above the keyboard. */
export default function VerificationModal({ visible, email, error, onClose, onVerify, onResend }: Props) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) return;
    setCode("");
    setSubmitting(false);
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, [visible]);

  useEffect(() => {
    if (error) {
      setCode("");
      setSubmitting(false);
    }
  }, [error]);

  async function handleChange(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    if (digits.length === CODE_LENGTH && !submitting) {
      setSubmitting(true);
      try {
        await onVerify(digits);
      } finally {
        setSubmitting(false);
      }
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(13,19,43,0.4)" }} onPress={onClose} />
        <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 }}>
          <View className="self-center w-10 h-1 rounded-full bg-line mb-5" />
          <Text className="h3">Check your email</Text>
          <Text className="body-md text-muted mt-1">
            We sent a 6-digit code to <Text className="font-poppins-semibold text-ink">{email}</Text>
          </Text>

          {/* Visible boxes; a hidden TextInput receives the keyboard input */}
          <Pressable className="flex-row justify-between mt-6" onPress={() => inputRef.current?.focus()}>
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const active = i === code.length;
              return (
                <View
                  key={i}
                  className={`w-12 h-14 rounded-xl items-center justify-center border-2 ${
                    active ? "border-sally-purple" : "border-line"
                  } ${error ? "border-error" : ""}`}
                >
                  <Text className="font-poppins-semibold text-2xl text-ink">{code[i] ?? ""}</Text>
                </View>
              );
            })}
          </Pressable>
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={handleChange}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            style={{ position: "absolute", opacity: 0, height: 1, width: 1 }}
          />

          {error ? <Text className="body-sm text-error mt-3">{error}</Text> : null}

          <View className="flex-row items-center justify-between mt-6">
            <TouchableOpacity onPress={onResend} disabled={submitting}>
              <Text className="font-poppins-semibold text-sm text-sally-purple">Resend code</Text>
            </TouchableOpacity>
            {submitting ? <ActivityIndicator color={colors.purple} /> : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
