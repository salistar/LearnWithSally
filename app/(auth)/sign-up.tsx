import { useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { type Href, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";

import AuthShell, { Divider } from "@/components/AuthShell";
import SocialButton from "@/components/SocialButton";
import VerificationModal from "@/components/VerificationModal";
import { colors } from "@/constants/theme";
import { track } from "@/lib/posthog";
import { useSocialAuth } from "@/lib/useSocialAuth";

export default function SignUpScreen() {
  const { signUp, fetchStatus } = useSignUp();
  const social = useSocialAuth("sign_up");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState("");

  const loading = fetchStatus === "fetching";
  const canSubmit = email.includes("@") && password.length >= 8 && !loading;

  async function handleSignUp() {
    setError("");
    const { error: createError } = await signUp.password({ emailAddress: email.trim(), password });
    if (createError) {
      setError(createError.message || "We couldn't create your account.");
      return;
    }
    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      setError(sendError.message || "We couldn't send your verification code.");
      return;
    }
    setCodeError("");
    setShowCode(true);
  }

  async function handleVerify(code: string) {
    setCodeError("");
    const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });
    if (verifyError) {
      setCodeError("That code is not valid. Try again.");
      return;
    }
    if (signUp.status === "complete") {
      track("sign_up_completed", { method: "email" });
      setShowCode(false);
      await signUp.finalize({
        navigate: ({ decorateUrl }) => router.replace(decorateUrl("/") as Href),
      });
    } else {
      setCodeError("Your account needs another step. Check the Clerk dashboard settings.");
    }
  }

  async function handleResend() {
    setCodeError("");
    await signUp.verifications.sendEmailCode();
  }

  return (
    <AuthShell title="Create your account" subtitle="Start your language journey today ✨">
      <View className="field">
        <Text className="field__label">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={{ fontFamily: "Poppins-Regular", fontSize: 16, color: colors.ink, paddingVertical: 4 }}
        />
      </View>

      <View className="field mt-3 flex-row items-center">
        <View className="flex-1">
          <Text className="field__label">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            style={{ fontFamily: "Poppins-Regular", fontSize: 16, color: colors.ink, paddingVertical: 4 }}
          />
        </View>
        <TouchableOpacity onPress={() => setShowPassword((s) => !s)} accessibilityLabel="Show password">
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.muted} />
        </TouchableOpacity>
      </View>

      {error ? <Text className="body-sm text-error mt-3">{error}</Text> : null}

      <TouchableOpacity
        className="btn-primary mt-5"
        style={{ opacity: canSubmit ? 1 : 0.5 }}
        disabled={!canSubmit}
        onPress={handleSignUp}
        activeOpacity={0.85}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="btn-primary__label">Sign Up</Text>}
      </TouchableOpacity>

      {/* Required by Clerk bot protection on sign-up */}
      <View nativeID="clerk-captcha" />

      <Divider label="or continue with" />
      <SocialButton provider="google" onPress={() => social.signInWith("google")} disabled={social.loading} />
      <SocialButton provider="facebook" onPress={() => social.signInWith("facebook")} disabled={social.loading} />
      <SocialButton provider="apple" onPress={() => social.signInWith("apple")} disabled={social.loading} />
      {social.error ? <Text className="body-sm text-error">{social.error}</Text> : null}

      <View className="flex-row justify-center mt-6">
        <Text className="body-md text-muted">Already have an account? </Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/sign-in")}>
          <Text className="body-md font-poppins-semibold text-sally-purple">Log in</Text>
        </TouchableOpacity>
      </View>

      <VerificationModal
        visible={showCode}
        email={email}
        error={codeError}
        onClose={() => setShowCode(false)}
        onVerify={handleVerify}
        onResend={handleResend}
      />
    </AuthShell>
  );
}
