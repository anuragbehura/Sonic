import { View, Text, Pressable, Modal, TextInput } from "react-native";
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Shuffle, Repeat, Moon, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { usePlayerStore } from "../store/playerStore";
import { Image } from "expo-image";
import Slider from "@react-native-community/slider";
import { useState, useEffect } from "react";

export default function PlayerScreen() {
    const router = useRouter();
    const currentSong = usePlayerStore((s) => s.currentSong);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const currentTime = usePlayerStore((s) => s.currentTime);
    const duration = usePlayerStore((s) => s.duration);
    const play = usePlayerStore((s) => s.play);
    const pause = usePlayerStore((s) => s.pause);
    const next = usePlayerStore((s) => s.next);
    const previous = usePlayerStore((s) => s.previous);
    const seekTo = usePlayerStore((s) => s.seekTo);
    const isShuffle = usePlayerStore((s) => s.isShuffle);
    const repeatMode = usePlayerStore((s) => s.repeatMode);
    const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
    const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);
    const sleepTimerEnd = usePlayerStore((s) => s.sleepTimerEnd);
    const setSleepTimer = usePlayerStore((s) => s.setSleepTimer);
    const clearSleepTimer = usePlayerStore((s) => s.clearSleepTimer);

    const [showSleepModal, setShowSleepModal] = useState(false);
    const [sleepMinutes, setSleepMinutes] = useState("");
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(interval);
    }, []);

    if (!currentSong) return null;

    const progress = duration > 0 ? currentTime / duration : 0;
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const formatSleepRemaining = (endTime: number) => {
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000 / 60));
        return `${remaining}m`;
    };

    const handleSetSleepTimer = () => {
        const minutes = parseInt(sleepMinutes, 10);
        if (isNaN(minutes) || minutes <= 0) return;
        setSleepTimer(minutes);
        setSleepMinutes("");
        setShowSleepModal(false);
    };

    const handleQuickSleep = (minutes: number) => {
        setSleepTimer(minutes);
        setShowSleepModal(false);
    };

    return (
        <View className="flex-1 bg-background px-6 pt-16">
            <View className="flex-row justify-between items-start">
                <Pressable onPress={() => router.back()} className="p-2 touch-target">
                    <ChevronDown size={28} color="white" />
                </Pressable>
                <Pressable onPress={() => setShowSleepModal(true)} className="p-2 touch-target">
                    <Moon
                        size={24}
                        color={sleepTimerEnd ? "#1DB954" : "#9CA3AF"}
                    />
                </Pressable>
            </View>

            <View className="mt-20 items-center">
                {currentSong.artwork ? (
                    <Image
                        source={{ uri: currentSong.artwork }}
                        className="w-72 h-72 rounded-card bg-background-card"
                        contentFit="cover"
                    />
                ) : (
                    <View className="w-72 h-72 rounded-card bg-background-card" />
                )}

                <View className="mt-8 w-full px-4">
                    <Text className="text-title-lg text-text-primary text-center">{currentSong.title}</Text>
                    <Text className="text-body text-text-secondary text-center mt-1">{currentSong.artist}</Text>
                    {currentSong.album && (
                        <Text className="text-caption text-text-muted text-center mt-0.5">{currentSong.album}</Text>
                    )}
                </View>

                <View className="mt-8 w-full px-4">
                    <View className="flex-row items-center justify-between text-caption-sm text-text-muted mb-2">
                        <Text>{formatTime(currentTime)}</Text>
                        <Text>{formatTime(duration)}</Text>
                    </View>
                    <Slider
                        value={progress}
                        onValueChange={(value) => seekTo(value * duration)}
                        minimumValue={0}
                        maximumValue={1}
                        minimumTrackTintColor="#1DB954"
                        maximumTrackTintColor="#333"
                        thumbTintColor="#1DB954"
                        style={{ height: 4 }}
                    />
                </View>

                <View className="mt-6 flex-row items-center justify-center gap-8">
                    <Pressable onPress={toggleShuffle} className="p-2 touch-target">
                        <Shuffle
                            size={24}
                            color={isShuffle ? "#1DB954" : "#9CA3AF"}
                        />
                    </Pressable>
                    <Pressable onPress={previous} className="p-3 touch-target">
                        <SkipBack size={32} color="white" />
                    </Pressable>
                    <Pressable onPress={isPlaying ? pause : play} className="bg-accent rounded-pill p-4 touch-target-lg">
                        {isPlaying ? <Pause size={32} color="black" /> : <Play size={32} color="black" />}
                    </Pressable>
                    <Pressable onPress={next} className="p-3 touch-target">
                        <SkipForward size={32} color="white" />
                    </Pressable>
                    <Pressable onPress={toggleRepeat} className="p-2 touch-target">
                        <Repeat
                            size={24}
                            color={repeatMode !== "off" ? "#1DB954" : "#9CA3AF"}
                        />
                    </Pressable>
                </View>

                {sleepTimerEnd && (
                    <View className="mt-6 flex-row items-center justify-center gap-2 bg-accent/10 border border-accent/30 rounded-pill px-4 py-2">
                        <Moon size={16} color="#1DB954" />
                        <Text className="text-caption text-accent font-medium">
                            Sleep timer: {formatSleepRemaining(sleepTimerEnd)}
                        </Text>
                        <Pressable onPress={clearSleepTimer} className="p-1">
                            <X size={14} color="#9CA3AF" />
                        </Pressable>
                    </View>
                )}
            </View>

            <Modal visible={showSleepModal} animationType="slide" transparent={true}>
                <View className="flex-1 bg-black/50 flex items-center justify-center">
                    <View className="w-full max-w-md bg-background-elevated rounded-card-lg p-6 m-4">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-title text-text-primary">Sleep Timer</Text>
                            <Pressable onPress={() => setShowSleepModal(false)} className="p-2">
                                <X size={24} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <View className="flex-row gap-2 mb-4">
                            {[15, 30, 45, 60].map((m) => (
                                <Pressable
                                    key={m}
                                    onPress={() => handleQuickSleep(m)}
                                    className="flex-1 bg-background rounded-card py-3 items-center border border-border"
                                >
                                    <Text className="text-body text-text-primary">{m} min</Text>
                                </Pressable>
                            ))}
                        </View>

                        <View className="mb-4">
                            <TextInput
                                value={sleepMinutes}
                                onChangeText={setSleepMinutes}
                                placeholder="Custom minutes"
                                keyboardType="numeric"
                                className="w-full bg-background rounded-card px-4 py-3 text-text-primary border border-border text-center"
                                autoFocus
                                onSubmitEditing={handleSetSleepTimer}
                            />
                        </View>

                        <View className="flex-row gap-2">
                            <Pressable onPress={() => setShowSleepModal(false)} className="flex-1 bg-background-elevated rounded-card py-3 items-center border border-border">
                                <Text className="text-body text-text-primary">Cancel</Text>
                            </Pressable>
                            <Pressable onPress={handleSetSleepTimer} className="flex-1 bg-accent rounded-card py-3 items-center">
                                <Text className="text-body font-bold text-black">Set Timer</Text>
                            </Pressable>
                        </View>

                        {sleepTimerEnd && (
                            <Pressable onPress={clearSleepTimer} className="w-full mt-3 bg-red-500/20 border border-red-500/30 rounded-card py-3 items-center">
                                <Text className="text-body text-red-400">Cancel Sleep Timer</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}