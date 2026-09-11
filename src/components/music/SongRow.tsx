import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Lucide } from "@react-native-vector-icons/lucide";
import { Song } from "../../types/music";

interface SongRowProps {
    song: Song;
    isActive: boolean;
    isPlaying: boolean;
    onPress: () => void;
    onMenuPress?: () => void;
}

export function SongRow({ song, isActive, isPlaying, onPress, onMenuPress }: SongRowProps) {
    return (
        <Pressable onPress={onPress} className="flex-row items-center gap-4 px-4 py-3">
            {song.artwork ? (
                <Image source={{ uri: song.artwork }} className="w-12 h-12 rounded-card bg-background-elevated" contentFit="cover" />
            ) : (
                <View className="w-12 h-12 rounded-card bg-background-elevated" />
            )}

            <View className="flex-1 min-w-0">
                <Text numberOfLines={1} className={`text-body ${isActive ? "text-accent" : "text-text-primary"}`}>
                    {song.title}
                </Text>
                <Text numberOfLines={1} className="text-caption text-text-secondary">
                    {song.play_count ? `${song.play_count} Played` : "Not played yet"}
                </Text>
            </View>

            {isActive && isPlaying ? (
                <Text className="text-body text-accent">▶</Text>
            ) : (
                <Pressable onPress={onMenuPress} hitSlop={10} className="p-1">
                    <Lucide name="more-vertical" size={20} color="#6B7280" />
                </Pressable>
            )}
        </Pressable>
    );
}