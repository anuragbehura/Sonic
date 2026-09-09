import { View, Text, Pressable } from "react-native";
import { Play, Pause } from "lucide-react-native";
import { usePlayerStore } from "../../store/playerStore";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

export function MiniPlayer() {
    const currentSong = usePlayerStore((s) => s.currentSong);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const currentTime = usePlayerStore((s) => s.currentTime);
    const duration = usePlayerStore((s) => s.duration);
    const play = usePlayerStore((s) => s.play);
    const pause = usePlayerStore((s) => s.pause);
    const router = useRouter();

    if (!currentSong) return null;

    const progress = duration > 0 ? currentTime / duration : 0;

    return (
        <View className="absolute bottom-0 left-0 right-0 bg-background-card">
            <View className="h-0.5 bg-accent w-full" style={{ width: `${progress * 100}%` }} />
            <Pressable onPress={() => router.push("/player")} className="h-touch flex-row items-center px-3 gap-3">
                {currentSong.artwork ? (
                    <Image source={{ uri: currentSong.artwork }} className="w-10 h-10 rounded-md bg-background-elevated" contentFit="cover" />
                ) : (
                    <View className="w-10 h-10 rounded-md bg-background-elevated" />
                )}
                <View className="flex-1 min-w-0">
                    <Text className="text-title text-text-primary truncate">{currentSong.title}</Text>
                    <Text className="text-caption-sm text-text-secondary truncate">{currentSong.artist}</Text>
                </View>
                <Pressable onPress={isPlaying ? pause : play} className="p-2 touch-target">
                    {isPlaying ? <Pause size={22} color="white" /> : <Play size={22} color="white" />}
                </Pressable>
            </Pressable>
        </View>
    );
}