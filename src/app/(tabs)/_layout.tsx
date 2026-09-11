import { Tabs } from "expo-router";
import { Lucide } from "@react-native-vector-icons/lucide";
import { TabBarWithMiniPlayer } from "@/components/player/TabBarWithMiniPlayer";
import { SafeAreaView } from "react-native-safe-area-context";
import { cssInterop } from "nativewind";

cssInterop(SafeAreaView, { className: "style" });

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "#0A0A0A", borderTopWidth: 0 },
        tabBarActiveTintColor: "#1DB954",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        headerShown: false,
      }}
      tabBar={(props) => <TabBarWithMiniPlayer {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Library",
          tabBarIcon: ({ focused }) => <Lucide name="music" size={24} color={focused ? "#1DB954" : "#6B7280"} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => <Lucide name="search" size={24} color={focused ? "#1DB954" : "#6B7280"} />,
        }}
      />
      <Tabs.Screen
        name="playlists"
        options={{
          title: "Playlists",
          tabBarIcon: ({ focused }) => <Lucide name="list-music" size={24} color={focused ? "#1DB954" : "#6B7280"} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => <Lucide name="settings" size={24} color={focused ? "#1DB954" : "#6B7280"} />,
        }}
      />
    </Tabs>
  );
}