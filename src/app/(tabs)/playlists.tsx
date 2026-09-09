import { View, Text, Pressable, TextInput, Alert } from "react-native";
import { useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { Plus, Trash2, Edit, Music } from "lucide-react-native";
import { getAllPlaylists, createPlaylist, deletePlaylist, getPlaylistSongs } from "@/database/playlists";
import { usePlayerStore } from "@/store/playerStore";
import { useRouter } from "expo-router";

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState<{ id: string; name: string }[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const router = useRouter();
  const setQueue = usePlayerStore((s) => s.setQueue);

  const loadPlaylists = async () => setPlaylists(await getAllPlaylists());

  useEffect(() => { loadPlaylists(); }, []);

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName("");
    setShowCreate(false);
    await loadPlaylists();
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete playlist?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deletePlaylist(id); await loadPlaylists(); } },
    ]);
  };

  const handleEditPress = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    // Note: updatePlaylistName not implemented yet, would need to add to database
    setEditingId(null);
    await loadPlaylists();
  };

  const handleOpenPlaylist = async (playlist: { id: string; name: string }) => {
    const songs = await getPlaylistSongs(playlist.id);
    if (songs.length > 0) {
      setQueue(songs, 0);
      router.push("/player");
    }
  };

  const renderPlaylist = ({ item }: { item: { id: string; name: string } }) => (
    <Pressable onPress={() => handleOpenPlaylist(item)} className="flex-row items-center gap-4 px-4 py-3 touch-target bg-background-elevated/50">
      <View className="w-12 h-12 rounded-md bg-background-elevated flex items-center justify-center">
        <Music size={24} color="#6B7280" />
      </View>
      <View className="flex-1">
        {editingId === item.id ? (
          <TextInput
            value={editName}
            onChangeText={setEditName}
            className="text-body text-text-primary"
            autoFocus
            onBlur={() => handleSaveEdit(item.id)}
            onSubmitEditing={() => handleSaveEdit(item.id)}
          />
        ) : (
          <Text className="text-body text-text-primary">{item.name}</Text>
        )}
      </View>
      {editingId === item.id ? null : (
        <View className="flex-row items-center gap-2">
          <Pressable onPress={() => handleEditPress(item.id, item.name)} className="p-2 touch-target">
            <Edit size={20} color="#6B7280" />
          </Pressable>
          <Pressable onPress={() => handleDelete(item.id)} className="p-2 touch-target">
            <Trash2 size={20} color="#6B7280" />
          </Pressable>
        </View>
      )}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
        <Text className="text-display text-text-primary">Playlists</Text>
        <Pressable onPress={() => setShowCreate(true)} className="p-2 touch-target bg-background-elevated rounded-pill">
          <Plus size={22} color="white" />
        </Pressable>
      </View>
      {showCreate && (
        <View className="px-4 py-4 bg-background-elevated border-b border-border">
          <TextInput
            value={newPlaylistName}
            onChangeText={setNewPlaylistName}
            placeholder="Playlist name"
            className="text-body text-text-primary bg-background rounded-card px-4 py-3 mb-3"
            autoFocus
            onSubmitEditing={handleCreate}
          />
          <View className="flex-row gap-2">
            <Pressable onPress={handleCreate} className="flex-1 bg-accent rounded-pill py-3 items-center">
              <Text className="text-body font-bold text-black">Create</Text>
            </Pressable>
            <Pressable onPress={() => { setShowCreate(false); setNewPlaylistName(""); }} className="flex-1 bg-background-elevated rounded-pill py-3 items-center border border-border">
              <Text className="text-body text-text-primary">Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
      <FlashList
        data={playlists}
        renderItem={renderPlaylist}
        keyExtractor={(item) => item.id}
        estimatedItemSize={72}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}