import { View, Text, Switch, Pressable, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Lucide } from "@react-native-vector-icons/lucide";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearAllData } from "../../database/clearData";
import { useToastStore } from "../../store/toastStore";

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [clearing, setClearing] = useState(false);

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Data?",
      "This permanently deletes all songs, playlists, cover art, and playback history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: async () => {
            setClearing(true);
            try {
              await clearAllData();
              useToastStore.getState().show("All data cleared");
            } catch (e) {
              console.error("[Settings] clearAllData failed:", e);
              useToastStore.getState().show("Failed to clear data");
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background px-4 py-6">
      <Text className="text-title-lg text-text-primary mb-6">Settings</Text>

      <View className="space-y-4">
        {/* ... Dark Mode / Notifications / About cards unchanged ... */}

        <Pressable
          onPress={handleClearAll}
          disabled={clearing}
          className={`flex-row items-center justify-between p-4 bg-background-elevated rounded-card border border-border ${clearing ? "opacity-50" : ""
            }`}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-md bg-red-500/20 flex items-center justify-center">
              {clearing ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Lucide name="trash-2" size={20} color="#EF4444" />
              )}
            </View>
            <View>
              <Text className="text-body text-text-primary">Clear All Data</Text>
              <Text className="text-caption text-text-muted">
                {clearing ? "Clearing…" : "Delete all songs, playlists, and cache"}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}