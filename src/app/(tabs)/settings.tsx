import { View, Text, Switch } from "react-native";
import { useState } from "react";
import { Moon, Bell, Info, Trash2 } from "lucide-react-native";

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Text className="text-title-lg text-text-primary mb-6">Settings</Text>

      <View className="space-y-4">
        <View className="flex-row items-center justify-between p-4 bg-background-elevated rounded-card border border-border">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-md bg-accent/20 flex items-center justify-center">
              <Moon size={20} color="#1DB954" />
            </View>
            <View>
              <Text className="text-body text-text-primary">Dark Mode</Text>
              <Text className="text-caption text-text-muted">Always dark (Sonic is dark-first)</Text>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#333", true: "#1DB954" }}
            thumbColor="#fff"
            disabled
          />
        </View>

        <View className="flex-row items-center justify-between p-4 bg-background-elevated rounded-card border border-border">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-md bg-background-card flex items-center justify-center">
              <Bell size={20} color="#6B7280" />
            </View>
            <View>
              <Text className="text-body text-text-primary">Notifications</Text>
              <Text className="text-caption text-text-muted">Playback controls in notification center</Text>
            </View>
          </View>
          <Switch
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: "#333", true: "#1DB954" }}
            thumbColor="#fff"
            disabled
          />
        </View>

        <View className="flex-row items-center justify-between p-4 bg-background-elevated rounded-card border border-border">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-md bg-background-card flex items-center justify-center">
              <Info size={20} color="#6B7280" />
            </View>
            <View>
              <Text className="text-body text-text-primary">About Sonic</Text>
              <Text className="text-caption text-text-muted">Version 1.0.0 • Privacy-first music player</Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center justify-between p-4 bg-background-elevated rounded-card border border-border">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-md bg-red-500/20 flex items-center justify-center">
              <Trash2 size={20} color="#EF4444" />
            </View>
            <View>
              <Text className="text-body text-text-primary">Clear All Data</Text>
              <Text className="text-caption text-text-muted">Delete all songs, playlists, and cache</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}