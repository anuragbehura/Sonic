import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Song } from "../types/music";

type RepeatMode = "off" | "one" | "all";

interface PlayerState {
    currentSong: Song | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    setCurrentSong: (song: Song) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setProgress: (currentTime: number, duration: number) => void;
    play: () => void;
    pause: () => void;
    seekTo: (seconds: number) => void;
    _registerControls: (controls: { play: () => void; pause: () => void; seekTo: (s: number) => void }) => void;

    queue: Song[];
    currentIndex: number;
    setQueue: (songs: Song[], startIndex: number) => void;
    next: () => void;
    previous: () => void;

    isShuffle: boolean;
    shuffleOrder: number[];
    toggleShuffle: () => void;
    _rebuildShuffleOrder: () => void;

    repeatMode: RepeatMode;
    toggleRepeat: () => void;

    updateLastPlayed: (songId: string) => void;

    // Sleep timer
    sleepTimerEnd: number | null;
    setSleepTimer: (minutes: number) => void;
    clearSleepTimer: () => void;
    _checkSleepTimer: () => void;
}

function buildShuffleOrder(length: number, currentIndex: number): number[] {
    const indices = Array.from({ length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const currentPos = indices.indexOf(currentIndex);
    if (currentPos > 0) {
        [indices[0], indices[currentPos]] = [indices[currentPos], indices[0]];
    }
    return indices;
}

export const usePlayerStore = create<PlayerState>()(
    persist(
        (set, get) => ({
            currentSong: null,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            setCurrentSong: (song) => set({ currentSong: song }),
            setIsPlaying: (isPlaying) => set({ isPlaying }),
            setProgress: (currentTime, duration) => set({ currentTime, duration }),
            play: () => { },
            pause: () => { },
            seekTo: () => { },
            _registerControls: (controls) => set(controls),

            queue: [],
            currentIndex: -1,
            setQueue: (songs, startIndex) => {
                const shuffleOrder = buildShuffleOrder(songs.length, startIndex);
                set({ queue: songs, currentIndex: startIndex, currentSong: songs[startIndex], shuffleOrder });
            },
            next: () =>
                set((state) => {
                    const { queue, currentIndex, repeatMode, isShuffle, shuffleOrder } = state;
                    if (queue.length === 0) return {};

                    if (repeatMode === "one") {
                        return {};
                    }

                    let nextIndex: number;
                    if (isShuffle) {
                        const currentShufflePos = shuffleOrder.indexOf(currentIndex);
                        if (currentShufflePos < shuffleOrder.length - 1) {
                            nextIndex = shuffleOrder[currentShufflePos + 1];
                        } else {
                            if (repeatMode === "all") {
                                nextIndex = shuffleOrder[0];
                            } else {
                                return {};
                            }
                        }
                    } else {
                        if (currentIndex < queue.length - 1) {
                            nextIndex = currentIndex + 1;
                        } else {
                            if (repeatMode === "all") {
                                nextIndex = 0;
                            } else {
                                return {};
                            }
                        }
                    }
                    return { currentIndex: nextIndex, currentSong: queue[nextIndex] };
                }),
            previous: () =>
                set((state) => {
                    const { queue, currentIndex, repeatMode, isShuffle, shuffleOrder } = state;
                    if (queue.length === 0) return {};

                    let prevIndex: number;
                    if (isShuffle) {
                        const currentShufflePos = shuffleOrder.indexOf(currentIndex);
                        if (currentShufflePos > 0) {
                            prevIndex = shuffleOrder[currentShufflePos - 1];
                        } else {
                            if (repeatMode === "all") {
                                prevIndex = shuffleOrder[shuffleOrder.length - 1];
                            } else {
                                return {};
                            }
                        }
                    } else {
                        if (currentIndex > 0) {
                            prevIndex = currentIndex - 1;
                        } else {
                            if (repeatMode === "all") {
                                prevIndex = queue.length - 1;
                            } else {
                                return {};
                            }
                        }
                    }
                    return { currentIndex: prevIndex, currentSong: queue[prevIndex] };
                }),

            isShuffle: false,
            shuffleOrder: [],
            toggleShuffle: () =>
                set((state) => {
                    const newShuffle = !state.isShuffle;
                    let newShuffleOrder = state.shuffleOrder;
                    if (newShuffle) {
                        newShuffleOrder = buildShuffleOrder(state.queue.length, state.currentIndex);
                    }
                    return { isShuffle: newShuffle, shuffleOrder: newShuffleOrder };
                }),
            _rebuildShuffleOrder: () =>
                set((state) => ({
                    shuffleOrder: buildShuffleOrder(state.queue.length, state.currentIndex),
                })),

            repeatMode: "off",
            toggleRepeat: () =>
                set((state) => {
                    const modes: RepeatMode[] = ["off", "all", "one"];
                    const currentIdx = modes.indexOf(state.repeatMode);
                    return { repeatMode: modes[(currentIdx + 1) % modes.length] };
                }),

            updateLastPlayed: (songId: string) => {
                import("../database/songs").then(({ updateSongLastPlayed }) => {
                    updateSongLastPlayed(songId);
                });
            },

            // Sleep timer - absolute timestamp per §8.3
            sleepTimerEnd: null,
            setSleepTimer: (minutes: number) => {
                const endTime = Date.now() + minutes * 60 * 1000;
                set({ sleepTimerEnd: endTime });
            },
            clearSleepTimer: () => set({ sleepTimerEnd: null }),
            _checkSleepTimer: () => {
                const { sleepTimerEnd, isPlaying, pause } = get();
                if (sleepTimerEnd && isPlaying && Date.now() >= sleepTimerEnd) {
                    pause();
                    set({ sleepTimerEnd: null });
                }
            },
        }),
        {
            name: "sonic-player-storage",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                isShuffle: state.isShuffle,
                repeatMode: state.repeatMode,
                sleepTimerEnd: state.sleepTimerEnd,
            }),
        }
    )
);