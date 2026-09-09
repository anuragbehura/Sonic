import { Tabs } from "expo-router";
import { Music, Search, ListMusic, Settings } from "lucide-react-native";

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
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Library",
          tabBarIcon: ({ focused }) => <Music size={24} color={focused ? "#1DB954" : "#6B7280"} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => <Search size={24} color={focused ? "#1DB954" : "#6B7280"} />,
        }}
      />
      <Tabs.Screen
        name="playlists"
        options={{
          title: "Playlists",
          tabBarIcon: ({ focused }) => <ListMusic size={24} color={focused ? "#1DB954" : "#6B7280"} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => <Settings size={24} color={focused ? "#1DB954" : "#6B7280"} />,
        }}
      />
    </Tabs>
  );
}