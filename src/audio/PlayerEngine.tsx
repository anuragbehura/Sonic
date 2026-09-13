import { useEffect, useRef } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { usePlayerStore } from "../store/playerStore";

export function PlayerEngine() {
    const currentSong = usePlayerStore((s) => s.currentSong);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
    const setProgress = usePlayerStore((s) => s.setProgress);
    const registerControls = usePlayerStore((s) => s._registerControls);
    const next = usePlayerStore((s) => s.next);
    const repeatMode = usePlayerStore((s) => s.repeatMode);
    const updateLastPlayed = usePlayerStore((s) => s.updateLastPlayed);
    const checkSleepTimer = usePlayerStore((s) => s._checkSleepTimer);

    const player = useAudioPlayer(null);
    const status = useAudioPlayerStatus(player);
    const prevPlayingRef = useRef(true);

    // register real controls once, on mount
    useEffect(() => {
        registerControls({
            play: () => player.play(),
            pause: () => player.pause(),
            seekTo: (seconds) => player.seekTo(seconds),
        });
    }, [player, registerControls]);

    useEffect(() => {
        console.log("PLAYER ENGINE MOUNTED");

        registerControls({
            play: () => {
                console.log("REAL PLAYER PLAY CALLED");
                player.play();
            },

            pause: () => {
                console.log("REAL PLAYER PAUSE CALLED");
                player.pause();
            },

            seekTo: (seconds) => {
                player.seekTo(seconds);
            },
        });
    }, [player, registerControls]);

    // swap + play whenever a new song is selected
    useEffect(() => {
        if (!currentSong) return;
        console.log("CURRENT SONG OBJECT:", JSON.stringify(currentSong, null, 2));
        const rawUri = currentSong.local_uri;
        if (!rawUri) return;
        const sourceUri = rawUri.startsWith('file://') ? rawUri : `file://${rawUri}`;
        player.replace({ uri: sourceUri });
        player.play();
    }, [currentSong, player]);

    // keep store in sync with real engine state
    useEffect(() => {
        setIsPlaying(status.playing);
        setProgress(status.currentTime, status.duration);
    }, [status.playing, status.currentTime, status.duration, setIsPlaying, setProgress]);

    // auto-advance when track ends
    useEffect(() => {
        const wasPlaying = prevPlayingRef.current;
        const isNowPlaying = status.playing;
        const atEnd = status.duration > 0 && status.currentTime >= status.duration - 0.5;

        prevPlayingRef.current = isNowPlaying;

        if (wasPlaying && !isNowPlaying && atEnd) {
            if (repeatMode === "one") {
                player.seekTo(0);
                player.play();
            } else {
                next();
            }
        }
    }, [status.playing, status.currentTime, status.duration, repeatMode, next, player]);

    // update last_played_at when song starts playing
    useEffect(() => {
        if (currentSong && isPlaying) {
            updateLastPlayed(currentSong.id);
        }
    }, [currentSong, isPlaying, updateLastPlayed]);

    // sleep timer check - polls every 5 seconds per §8.3
    useEffect(() => {
        const interval = setInterval(() => {
            checkSleepTimer();
        }, 5000);
        return () => clearInterval(interval);
    }, [checkSleepTimer]);

    return null;
}