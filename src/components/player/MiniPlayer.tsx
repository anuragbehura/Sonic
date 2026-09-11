import { View, Text, Pressable } from "react-native";
import { Lucide } from "@react-native-vector-icons/lucide";
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

    const progress =
        duration > 0
            ? currentTime / duration
            : 0;

    return (
        <View className="bg-background-card border-t border-border">

            {/* Progress Bar */}
            <View className="h-0.5 bg-background-elevated w-full">
                <View
                    className="h-full bg-accent"
                    style={{
                        width: `${progress * 100}%`,
                    }}
                />
            </View>

            <Pressable
                onPress={() => router.push("/player")}
                className="h-touch flex-row items-center px-3 gap-3"
            >
                {/* Artwork */}
                {currentSong.artwork ? (
                    <Image
                        source={{
                            uri: currentSong.artwork,
                        }}
                        className="w-10 h-10 rounded-md bg-background-elevated"
                        contentFit="cover"
                    />
                ) : (
                    <View className="w-10 h-10 rounded-md bg-background-elevated" />
                )}

                {/* Song Info */}
                <View className="flex-1 min-w-0">
                    <Text
                        className="text-title text-text-primary"
                        numberOfLines={1}
                    >
                        {currentSong.title}
                    </Text>

                    <Text
                        className="text-caption-sm text-text-secondary"
                        numberOfLines={1}
                    >
                        {currentSong.artist}
                    </Text>
                </View>

                {/* Play/Pause */}
                <Pressable
                    onPress={(event) => {
                        event.stopPropagation();

                        if (isPlaying) {
                            pause();
                        } else {
                            play();
                        }
                    }}
                    className="p-2 touch-target"
                >
                    {isPlaying ? (
                        <Lucide
                            name="pause"
                            size={22}
                            color="white"
                        />
                    ) : (
                        <Lucide
                            name="play"
                            size={22}
                            color="white"
                        />
                    )}
                </Pressable>
            </Pressable>
        </View>
    );
}