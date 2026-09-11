import { View, Text, Pressable, Modal, TextInput } from "react-native";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useRouter } from "expo-router";
import { usePlayerStore } from "../store/playerStore";
import { Image } from "expo-image";
import Slider from "@react-native-community/slider";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withSpring,
    interpolate,
    Extrapolation,
    Easing,
} from "react-native-reanimated";

/* ============================================================
   Haptic helpers
   ============================================================ */
const haptics = {
    // A real "button press" — used for play/pause toggle
    press: () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { }),
    // Lighter tap — skip tracks, open/close modal
    light: () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { }),
    // Tiny tick — toggles, slider release
    selection: () =>
        Haptics.selectionAsync().catch(() => { }),
    // Success pattern — set a sleep timer
    success: () =>
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
            () => { }
        ),
};

/* ============================================================
   Play/Pause — morphing icon, springy tap, haptics
   ============================================================ */
function PlayPauseButton({
    isPlaying,
    onPress,
}: {
    isPlaying: boolean;
    onPress: () => void;
}) {
    // Single source of truth: 0 = play state, 1 = pause state
    const progress = useSharedValue(isPlaying ? 1 : 0);
    const tapScale = useSharedValue(1);

    useEffect(() => {
        progress.value = withTiming(isPlaying ? 1 : 0, {
            duration: 340,
            easing: Easing.bezier(0.34, 0.1, 0.25, 1), // smooth ease-out-in
        });
    }, [isPlaying, progress]);

    // Button: tap scale * subtle breathing pulse during morph
    const buttonStyle = useAnimatedStyle(() => {
        // 0 -> 1 -> 0 pulse across the transition
        const pulse = interpolate(
            progress.value,
            [0, 0.5, 1],
            [1, 1.06, 1],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ scale: tapScale.value * pulse }],
        };
    });

    // Play icon fades out + shrinks + rotates during first half of transition
    const playStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            progress.value,
            [0, 0.45],
            [1, 0],
            Extrapolation.CLAMP
        );
        const scale = interpolate(
            progress.value,
            [0, 1],
            [1, 0.55],
            Extrapolation.CLAMP
        );
        const rotate = interpolate(
            progress.value,
            [0, 1],
            [0, 90],
            Extrapolation.CLAMP
        );
        return {
            opacity,
            transform: [{ scale }, { rotate: `${rotate}deg` }],
        };
    });

    // Pause icon fades in + grows + un-rotates during second half
    const pauseStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            progress.value,
            [0.55, 1],
            [0, 1],
            Extrapolation.CLAMP
        );
        const scale = interpolate(
            progress.value,
            [0, 1],
            [0.55, 1],
            Extrapolation.CLAMP
        );
        const rotate = interpolate(
            progress.value,
            [0, 1],
            [-90, 0],
            Extrapolation.CLAMP
        );
        return {
            opacity,
            transform: [{ scale }, { rotate: `${rotate}deg` }],
        };
    });

    const handlePress = () => {
        haptics.press();
        tapScale.value = withSequence(
            withTiming(0.9, { duration: 70, easing: Easing.out(Easing.quad) }),
            withSpring(1, {
                damping: 14,
                stiffness: 220,
                mass: 0.7,
            })
        );
        onPress();
    };

    return (
        <Pressable
            onPress={handlePress}
            android_ripple={{ color: "rgba(0,0,0,0.15)", foreground: true }}
            className="bg-accent rounded-pill p-4 touch-target-lg flex-1 items-center justify-center"
        >
            <Animated.View style={buttonStyle}>
                <View
                    style={{
                        width: 32,
                        height: 32,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Animated.View
                        style={[
                            { position: "absolute" },
                            playStyle,
                        ]}
                    >
                        <Lucide name="play" size={32} color="black" />
                    </Animated.View>
                    <Animated.View
                        style={[
                            { position: "absolute" },
                            pauseStyle,
                        ]}
                    >
                        <Lucide name="pause" size={32} color="black" />
                    </Animated.View>
                </View>
            </Animated.View>
        </Pressable>
    );
}

/* ============================================================
   Generic icon button — press-scale + haptics
   ============================================================ */
function IconButton({
    onPress,
    haptic = "selection",
    children,
    className = "p-2 touch-target",
}: {
    onPress: () => void;
    haptic?: "press" | "light" | "selection" | "none";
    children: React.ReactNode;
    className?: string;
}) {
    const scale = useSharedValue(1);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.get() }], // ✅ .get()
    }));

    const handlePress = () => {
        if (haptic !== "none") haptics[haptic]();
        onPress();
    };

    return (
        <Pressable
            onPress={handlePress}
            onPressIn={() => {
                scale.set(                       // ✅ .set()
                    withTiming(0.88, {
                        duration: 90,
                        easing: Easing.out(Easing.quad),
                    })
                );
            }}
            onPressOut={() => {
                scale.set(                       // ✅ .set()
                    withSpring(1, {
                        damping: 14,
                        stiffness: 260,
                        mass: 0.6,
                    })
                );
            }}
            className={className}
        >
            <Animated.View style={style}>{children}</Animated.View>
        </Pressable>
    );
}

/* ============================================================
   Screen
   ============================================================ */
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

    const [isSeeking, setIsSeeking] = useState(false);
    const [seekValue, setSeekValue] = useState(0);

    // Track which song the current seek state belongs to
    const [seekSongId, setSeekSongId] = useState(currentSong?.id);

    // If the song changed, reset seek state *during render*.
    // React re-renders immediately without committing the stale tree.
    if (seekSongId !== currentSong?.id) {
        setSeekSongId(currentSong?.id);
        setIsSeeking(false);
        setSeekValue(0);
    }

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 30_000);
        return () => clearInterval(interval);
    }, []);

    // useEffect(() => {
    //     setIsSeeking(false);
    //     setSeekValue(0);
    // }, [currentSong?.id]);

    const formatTime = useCallback((seconds: number) => {
        if (!isFinite(seconds) || seconds < 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }, []);

    if (!currentSong) return null;

    const progress = duration > 0 ? currentTime / duration : 0;
    const displayProgress = isSeeking ? seekValue : progress;
    const displayTime = isSeeking ? seekValue * duration : currentTime;

    const formatSleepRemaining = (endTime: number) => {
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000 / 60));
        return `${remaining}m`;
    };

    const handleSetSleepTimer = () => {
        const minutes = parseInt(sleepMinutes, 10);
        if (isNaN(minutes) || minutes <= 0) {
            haptics.light();
            return;
        }
        haptics.success();
        setSleepTimer(minutes);
        setSleepMinutes("");
        setShowSleepModal(false);
    };

    const handleQuickSleep = (minutes: number) => {
        haptics.success();
        setSleepTimer(minutes);
        setShowSleepModal(false);
    };

    const handleClearSleep = () => {
        haptics.selection();
        clearSleepTimer();
    };

    return (
        <SafeAreaView
            edges={["top", "bottom"]}
            className="flex-1 bg-background px-6 pt-16"
        >
            {/* Header */}
            <View className="flex-row justify-between items-start">
                <IconButton onPress={() => router.back()} haptic="light">
                    <Lucide name="chevron-down" size={28} color="white" />
                </IconButton>
                <IconButton
                    onPress={() => {
                        setShowSleepModal(true);
                    }}
                    haptic="selection"
                >
                    <Lucide
                        name="moon"
                        size={24}
                        color={sleepTimerEnd ? "#1DB954" : "#9CA3AF"}
                    />
                </IconButton>
            </View>

            <View className="mt-20 items-center">
                {/* Artwork */}
                {currentSong.artwork ? (
                    <Image
                        source={{ uri: currentSong.artwork }}
                        className="w-72 h-72 rounded-card bg-background-card"
                        contentFit="cover"
                        transition={200}
                    />
                ) : (
                    <View className="w-72 h-72 rounded-card bg-background-card" />
                )}

                {/* Meta */}
                <View className="mt-8 w-full px-4">
                    <Text
                        className="text-title-lg text-text-primary text-center"
                        numberOfLines={1}
                    >
                        {currentSong.title}
                    </Text>
                    <Text
                        className="text-body text-text-secondary text-center mt-1"
                        numberOfLines={1}
                    >
                        {currentSong.artist}
                    </Text>
                    {currentSong.album && (
                        <Text
                            className="text-caption text-text-muted text-center mt-0.5"
                            numberOfLines={1}
                        >
                            {currentSong.album}
                        </Text>
                    )}
                </View>

                {/* Progress + Slider */}
                <View className="mt-8 w-full px-4">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-caption-sm text-text-muted">
                            {formatTime(displayTime)}
                        </Text>
                        <Text className="text-caption-sm text-text-muted">
                            {formatTime(duration)}
                        </Text>
                    </View>
                    <Slider
                        value={displayProgress}
                        onSlidingStart={() => {
                            haptics.selection();
                            setIsSeeking(true);
                            setSeekValue(progress);
                        }}
                        onValueChange={(value) => {
                            if (isSeeking) setSeekValue(value);
                        }}
                        onSlidingComplete={(value) => {
                            haptics.light();
                            setIsSeeking(false);
                            seekTo(value * duration);
                        }}
                        minimumValue={0}
                        maximumValue={1}
                        minimumTrackTintColor="#1DB954"
                        maximumTrackTintColor="#333"
                        thumbTintColor="#1DB954"
                        style={{ height: 32 }}
                    />
                </View>

                {/* Transport controls */}
                <View className="mt-6 flex-row items-center justify-center gap-6">
                    <IconButton onPress={toggleShuffle} haptic="selection">
                        <Lucide
                            name="shuffle"
                            size={24}
                            color={isShuffle ? "#1DB954" : "#9CA3AF"}
                        />
                    </IconButton>

                    <IconButton onPress={previous} haptic="light">
                        <Lucide name="skip-back" size={32} color="white" />
                    </IconButton>

                    <PlayPauseButton
                        isPlaying={isPlaying}
                        onPress={isPlaying ? pause : play}
                    />

                    <IconButton onPress={next} haptic="light">
                        <Lucide name="skip-forward" size={32} color="white" />
                    </IconButton>

                    <IconButton onPress={toggleRepeat} haptic="selection">
                        <Lucide
                            name="repeat"
                            size={24}
                            color={repeatMode !== "off" ? "#1DB954" : "#9CA3AF"}
                        />
                    </IconButton>
                </View>

                {/* Sleep-timer pill */}
                {sleepTimerEnd && (
                    <View className="mt-6 flex-row items-center justify-center gap-2 bg-accent/10 border border-accent/30 rounded-pill px-4 py-2">
                        <Lucide name="moon" size={16} color="#1DB954" />
                        <Text className="text-caption text-accent font-medium">
                            Sleep timer: {formatSleepRemaining(sleepTimerEnd)}
                        </Text>
                        <Pressable
                            onPress={handleClearSleep}
                            className="p-1"
                            hitSlop={8}
                        >
                            <Lucide name="x" size={14} color="#9CA3AF" />
                        </Pressable>
                    </View>
                )}
            </View>

            {/* Sleep Timer Modal */}
            <Modal
                visible={showSleepModal}
                animationType="slide"
                transparent
                statusBarTranslucent
                onRequestClose={() => setShowSleepModal(false)}
            >
                <Pressable
                    onPress={() => {
                        haptics.light();
                        setShowSleepModal(false);
                    }}
                    className="flex-1 bg-black/50 items-center justify-center"
                >
                    <Pressable
                        onPress={() => { }}
                        className="w-full max-w-md bg-background-elevated rounded-card-lg p-6 m-4"
                    >
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-title text-text-primary">
                                Sleep Timer
                            </Text>
                            <Pressable
                                onPress={() => {
                                    haptics.light();
                                    setShowSleepModal(false);
                                }}
                                className="p-2"
                                hitSlop={8}
                            >
                                <Lucide name="x" size={24} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <View className="flex-row gap-2 mb-4">
                            {[15, 30, 45, 60].map((m) => (
                                <Pressable
                                    key={m}
                                    onPress={() => handleQuickSleep(m)}
                                    className="flex-1 bg-background rounded-card py-3 items-center border border-border"
                                >
                                    <Text className="text-body text-text-primary">
                                        {m} min
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <View className="mb-4">
                            <TextInput
                                value={sleepMinutes}
                                onChangeText={setSleepMinutes}
                                placeholder="Custom minutes"
                                placeholderTextColor="#6B7280"
                                keyboardType="numeric"
                                className="w-full bg-background rounded-card px-4 py-3 text-text-primary border border-border text-center"
                                onSubmitEditing={handleSetSleepTimer}
                            />
                        </View>

                        <View className="flex-row gap-2">
                            <Pressable
                                onPress={() => {
                                    haptics.light();
                                    setShowSleepModal(false);
                                }}
                                className="flex-1 bg-background-elevated rounded-card py-3 items-center border border-border"
                            >
                                <Text className="text-body text-text-primary">
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={handleSetSleepTimer}
                                className="flex-1 bg-accent rounded-card py-3 items-center"
                            >
                                <Text className="text-body font-bold text-black">
                                    Set Timer
                                </Text>
                            </Pressable>
                        </View>

                        {sleepTimerEnd && (
                            <Pressable
                                onPress={handleClearSleep}
                                className="w-full mt-3 bg-red-500/20 border border-red-500/30 rounded-card py-3 items-center"
                            >
                                <Text className="text-body text-red-400">
                                    Cancel Sleep Timer
                                </Text>
                            </Pressable>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}