import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  // Already signed in → let the entry router decide where to go.
  if (isSignedIn) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
