import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Lucide } from "@react-native-vector-icons/lucide";
import { Song } from "../../types/music";

interface PopularCardProps {
    song: Song;
    isFavorite: boolean;
    onPress: () => void;
    onToggleFavorite: () => void;
}

export function PopularCard({ song, isFavorite, onPress, onToggleFavorite }: PopularCardProps) {
    return (
        <Pressable onPress={onPress} className="card-lg w-64 h-48 overflow-hidden mr-4">
            {song.artwork ? (
                <Image source={{ uri: song.artwork }} className="absolute inset-0 w-full h-full" contentFit="cover" />
            ) : (
                <View className="absolute inset-0 bg-background-elevated" />
            )}

            <View className="absolute bottom-0 left-0 right-0 bg-black/55 px-4 py-3">
                <Text numberOfLines={1} className="text-title text-text-primary mb-2">
                    {song.title}
                </Text>
                <View className="flex-row items-center gap-2">
                    <Pressable onPress={onPress} className="touch-target flex-row items-center gap-1 bg-accent px-3 py-1.5 rounded-pill">
                        <Lucide name="play" size={14} color="white" />
                        <Text className="text-caption-sm text-white">{song.play_count ?? 0}</Text>
                    </Pressable>
                    <Pressable onPress={onToggleFavorite} className="touch-target flex-row items-center gap-1 bg-white/15 px-3 py-1.5 rounded-pill">
                        <Lucide name="heart" size={14} color={isFavorite ? "#1DB954" : "white"} />
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
}