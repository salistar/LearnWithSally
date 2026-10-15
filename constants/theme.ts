// Same tokens as global.css, for places where className is not supported
// (SafeAreaView, icon colors, animated / dynamic styles…).

export const colors = {
  purple: "#6c4ef5",
  deepPurple: "#5b3bf6",
  blue: "#4d88ff",
  green: "#21c16b",

  success: "#21c16b",
  warning: "#ffc800",
  streak: "#ff8a00",
  error: "#ff4d4f",
  info: "#4d88ff",

  ink: "#0d132b",
  muted: "#6b7280",
  line: "#e5e7eb",
  surface: "#f6f7fb",
  background: "#ffffff",
} as const;

export const fonts = {
  regular: "Poppins-Regular",
  medium: "Poppins-Medium",
  semiBold: "Poppins-SemiBold",
  bold: "Poppins-Bold",
} as const;
