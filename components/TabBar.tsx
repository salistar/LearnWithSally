import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: Record<string, { label: string; icon: IconName; activeIcon: IconName }> = {
  index: { label: "Home", icon: "home-outline", activeIcon: "home" },
  learn: { label: "Learn", icon: "book-outline", activeIcon: "book" },
  "ai-teacher": { label: "AI Teacher", icon: "happy-outline", activeIcon: "happy" },
  chat: { label: "Chat", icon: "chatbubble-outline", activeIcon: "chatbubble" },
  profile: { label: "Profile", icon: "person-outline", activeIcon: "person" },
};

const CIRCLE = 52;

/** Custom bottom bar: the active tab is an icon inside a purple circle that slides between tabs. */
export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const tabWidth = width / state.routes.length;
  const x = useSharedValue(0);

  useEffect(() => {
    if (tabWidth > 0) x.value = withSpring(state.index * tabWidth + (tabWidth - CIRCLE) / 2, { damping: 18, stiffness: 180 });
  }, [state.index, tabWidth, x]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.row} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && <Animated.View pointerEvents="none" style={[styles.circle, indicatorStyle]} />}
        {state.routes.map((route, index) => {
          const config = TABS[route.name];
          if (!config) return null;
          const focused = state.index === index;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={config.label}
              style={styles.tab}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
            >
              {focused ? (
                <View style={styles.iconOnly}>
                  <Ionicons name={config.activeIcon} size={24} color="#fff" />
                </View>
              ) : (
                <>
                  <Ionicons name={config.icon} size={23} color={colors.muted} />
                  <Text style={styles.label} numberOfLines={1}>{config.label}</Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 8,
    shadowColor: "#0d132b",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  row: { flexDirection: "row", alignItems: "center", height: CIRCLE },
  tab: { flex: 1, height: CIRCLE, alignItems: "center", justifyContent: "center" },
  iconOnly: { width: CIRCLE, height: CIRCLE, alignItems: "center", justifyContent: "center" },
  circle: {
    position: "absolute",
    left: 0,
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: colors.purple,
  },
  label: { fontFamily: "Poppins-Medium", fontSize: 11, color: colors.muted, marginTop: 2 },
});
