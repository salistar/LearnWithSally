import { useAuth, useSignIn, useSSO } from "@clerk/expo";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Platform } from "react-native";

import { SocialProvider } from "@/components/SocialButton";
import { track } from "@/lib/posthog";

WebBrowser.maybeCompleteAuthSession();

const STRATEGY = {
  google: "oauth_google",
  facebook: "oauth_facebook",
  apple: "oauth_apple",
} as const;

/** Google / Facebook / Apple sign-in via Clerk SSO. Providers must be enabled in the Clerk dashboard. */
export function useSocialAuth(kind: "sign_in" | "sign_up") {
  const { startSSOFlow } = useSSO();
  const { signIn } = useSignIn();
  const { isLoaded } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWith(provider: SocialProvider) {
    setError("");
    setLoading(true);
    try {
      if (!isLoaded) throw new Error("Sign-in is still loading. Please try again.");
      if (Platform.OS === "web") {
        const { error: ssoError } = await signIn.sso({
          strategy: STRATEGY[provider],
          redirectUrl: Linking.createURL("/"),
          redirectCallbackUrl: Linking.createURL("/sso-callback"),
        });
        if (ssoError) throw new Error(ssoError.message);
        return;
      }
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: STRATEGY[provider],
        redirectUrl: "learnwithsally://sso-callback",
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        track(kind === "sign_up" ? "sign_up_completed" : "sign_in_completed", { method: provider });
        router.replace("/");
      }
    } catch (err) {
      console.error("[auth] SSO failed", err);
      setError(`Couldn't continue with ${provider}. Is it enabled in Clerk?`);
    } finally {
      setLoading(false);
    }
  }

  return { signInWith, error, loading };
}
