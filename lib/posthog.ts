import Constants from "expo-constants";
import PostHog from "posthog-react-native";

// Single PostHog instance for the whole app. If the token is missing the
// client is created disabled, so the app keeps working without analytics.
const token = Constants.expoConfig?.extra?.posthogProjectToken as string | undefined;
const host = Constants.expoConfig?.extra?.posthogHost as string | undefined;

export const isPostHogEnabled = !!token && !token.startsWith("phc_xxx");

if (!isPostHogEnabled && __DEV__) {
  console.warn("[posthog] POSTHOG_PROJECT_TOKEN not set — analytics disabled.");
}

export const posthog = new PostHog(token || "disabled", {
  host,
  disabled: !isPostHogEnabled,
  captureAppLifecycleEvents: true,
});

// Business events tracked by the app (see docs/GUIDE.md, step 18).
// Never put keys, audio or transcript text in these properties.
export type AnalyticsEvent =
  | "language_selected"
  | "lesson_started"
  | "lesson_abandoned"
  | "lesson_completed"
  | "sign_up_completed"
  | "sign_in_completed";

export function track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean | null>) {
  posthog.capture(event, properties);
}
