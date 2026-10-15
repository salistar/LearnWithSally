// Builds the URL of an Expo API route (app/api/*).
//
// In development, Expo Router resolves relative URLs like "/api/stream-token"
// against the Metro dev server. On a real device or in production, set
// EXPO_PUBLIC_API_URL to the public URL of your deployed server
// (e.g. https://learnwithsally.expo.app) so the phone can reach it.
const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export function apiUrl(path: `/api/${string}`): string {
  return `${API_BASE}${path}`;
}

export async function apiFetch(
  path: `/api/${string}`,
  token: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(apiUrl(path), {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}
