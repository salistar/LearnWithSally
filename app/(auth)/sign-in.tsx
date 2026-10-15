import { useSignIn } from "@clerk/expo";
import { type Href, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";

import AuthShell, { Divider } from "@/components/AuthShell";
import SocialButton from "@/components/SocialButton";
import VerificationModal from "@/components/VerificationModal";
import { colors } from "@/constants/theme";
import { track } from "@/lib/posthog";
import { useSocialAuth } from "@/lib/useSocialAuth";

// Passwordless sign-in: email → 6-digit code (step 04/05).
export default function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn();
  const social = useSocialAuth("sign_in");

  const [email, setEmail] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState("");

  const loading = fetchStatus === "fetching";
  const canSubmit = email.includes("@") && !loading;

  async function handleSendCode() {
    setError("");
    const { error: createError } = await signIn.create({ identifier: email.trim() });
    if (createError) {
      setError(createError.message || "We couldn't find an account with this email.");
      return;
    }
    const { error: sendError } = await signIn.emailCode.sendCode({ emailAddress: email.trim() });
    if (sendError) {
      setError(sendError.message || "We couldn't send your code.");
      return;
    }
    setCodeError("");
    setShowCode(true);
  }

  async function handleVerify(code: string) {
    setCodeError("");
    const { error: verifyError } = await signIn.emailCode.verifyCode({ code });
    if (verifyError) {
      setCodeError("That code is not valid. Try again.");
      return;
    }
    if (signIn.status === "complete") {
      track("sign_in_completed", { method: "email_code" });
      setShowCode(false);
      await signIn.finalize({
        navigate: ({ decorateUrl }) => router.replace(decorateUrl("/") as Href),
      });
    } else {
      setCodeError("Your account needs another step. Check the Clerk dashboard settings.");
    }
  }

  async function handleResend() {
    setCodeError("");
    await signIn.emailCode.sendCode({ emailAddress: email.trim() });
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue learning 👋">
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

      {error ? <Text className="body-sm text-error mt-3">{error}</Text> : null}

      <TouchableOpacity
        className="btn-primary mt-5"
        style={{ opacity: canSubmit ? 1 : 0.5 }}
        disabled={!canSubmit}
        onPress={handleSendCode}
        activeOpacity={0.85}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="btn-primary__label">Send me a code</Text>}
      </TouchableOpacity>

      <Divider label="or continue with" />
      <SocialButton provider="google" onPress={() => social.signInWith("google")} disabled={social.loading} />
      <SocialButton provider="facebook" onPress={() => social.signInWith("facebook")} disabled={social.loading} />
      <SocialButton provider="apple" onPress={() => social.signInWith("apple")} disabled={social.loading} />
      {social.error ? <Text className="body-sm text-error">{social.error}</Text> : null}

      <View className="flex-row justify-center mt-6">
        <Text className="body-md text-muted">New here? </Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/sign-up")}>
          <Text className="body-md font-poppins-semibold text-sally-purple">Create an account</Text>
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
