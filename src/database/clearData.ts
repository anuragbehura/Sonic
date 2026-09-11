// src/database/clearData.ts
import { Directory, Paths } from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDb, initDb } from "./sqllite";
import { usePlayerStore } from "../store/playerStore";

export async function clearAllData(): Promise<void> {
    // 1. Stop playback so the audio engine releases file handles
    const player = usePlayerStore.getState();
    try {
        if (player.isPlaying) player.pause();
    } catch (e) {
        console.warn("[clearAllData] pause failed:", e);
    }

    // 2. Drop tables and rebuild from initDb().
    //    This is the only way to remove a stale NOT NULL constraint in SQLite —
    //    there is no ALTER TABLE ... DROP CONSTRAINT.
    const db = await getDb();
    await db.execAsync(`
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS playlist_songs;
    DROP TABLE IF EXISTS playlists;
    DROP TABLE IF EXISTS songs;
    PRAGMA foreign_keys = ON;
  `);

    // Re-run initDb() so schema matches what the code expects
    await initDb();

    // 3. Delete + recreate dirs.
    //    NOTE: Directory.delete() on Android has known recursive-deletion issues
    //    (expo/expo#34542). Delete children explicitly first, then the dir.
    const songsDir = new Directory(Paths.document, "songs");
    const coversDir = new Directory(Paths.document, "covers");

    for (const dir of [songsDir, coversDir]) {
        try {
            if (dir.exists) {
                // manual recursive delete — safer than dir.delete() on Android
                for (const entry of dir.list()) {
                    try {
                        entry.delete();
                    } catch (e) {
                        console.warn(`[clearAllData] failed to delete ${entry.uri}:`, e);
                    }
                }
                dir.delete();
            }
        } catch (e) {
            console.warn(`[clearAllData] cleanup failed for ${dir.uri}:`, e);
        }
        try {
            dir.create();
        } catch (e) {
            console.warn(`[clearAllData] recreate failed for ${dir.uri}:`, e);
        }
    }

    // 4. Reset in-memory player state (merges, keeps control fns intact)
    usePlayerStore.setState({
        currentSong: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        queue: [],
        currentIndex: -1,
        isShuffle: false,
        shuffleOrder: [],
        repeatMode: "off",
        sleepTimerEnd: null,
    });

    // 5. Remove persisted zustand key
    try {
        await AsyncStorage.removeItem("sonic-player-storage");
    } catch (e) {
        console.warn("[clearAllData] AsyncStorage cleanup failed:", e);
    }
}