import Constants from "expo-constants";
import { Platform } from "react-native";

// Builds the URL of an Expo API route (app/api/*).
//
// In development, Expo Router resolves relative URLs like "/api/stream-token"
// against the Metro dev server. On a real device or in production, set
// EXPO_PUBLIC_API_URL to the public URL of your deployed server
// (e.g. https://learnwithsally.expo.app) so the phone can reach it.
const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export function apiUrl(path: `/api/${string}`): string {
  if (API_BASE) return `${API_BASE}${path}`;
  if (Platform.OS === "web") return path;
  const host = Constants.expoConfig?.hostUri;
  if (__DEV__ && host) return `http://${host}${path}`;
  throw new Error("The app server is not configured. Set EXPO_PUBLIC_API_URL before building Android.");
}

export async function apiFetch(
  path: `/api/${string}`,
  token: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);
  // React Native 0.81's AbortSignal polyfill has no static timeout() method.
  const controller = new AbortController();
  const timeout = init.signal ? undefined : setTimeout(() => controller.abort(), 30_000);
  try {
    return await fetch(apiUrl(path), {
      ...init,
      headers,
      signal: init.signal ?? controller.signal,
    });
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
}
