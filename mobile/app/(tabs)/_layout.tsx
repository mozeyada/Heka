import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { Tabs } from "expo-router";

import { colors, glass } from "../../src/theme/tokens";

const tabBarOptions = {
  activeTint: colors.brand[600],
  inactiveTint: colors.neutral[400],
  background: "transparent",
  indicator: colors.brand[500],
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tabBarOptions.activeTint,
        tabBarInactiveTintColor: tabBarOptions.inactiveTint,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: Platform.select({
            ios: "transparent",
            android: "rgba(255, 255, 255, 0.95)", // Fallback for Android if BlurView is buggy on some versions
          }),
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.3)", // Glass edge
          height: Platform.OS === "ios" ? 85 : 70,
          paddingVertical: 10,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={glass.intensity}
              tint={glass.tint as "light" | "dark" | "default"}
              style={StyleSheet.absoluteFill}
            />
          ) : undefined,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: -5,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="arguments"
        options={{
          title: "Arguments",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flag-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="checkins"
        options={{
          title: "Check-ins",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
