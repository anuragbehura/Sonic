import { getDb } from "./sqllite";
import { Song } from "../types/music";

export async function insertSong(song: Song) {
    const db = await getDb();
    await db.runAsync(
        `INSERT OR REPLACE INTO songs (
            id, local_uri, title, artist, album, artwork, duration, date_added,
            play_count, is_favorite, cloud_key, is_pinned, last_played_at, uploaded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            song.id,
            song.uri ?? null,
            song.title,
            song.artist ?? null,
            song.album ?? null,
            song.artwork ?? null,
            song.duration ?? null,
            song.date_added ?? Date.now(),   // ← preserve original; fall back to now
            song.play_count ?? 0,
            song.is_favorite ? 1 : 0,
            song.cloud_key ?? null,
            song.is_pinned ? 1 : 0,
            song.last_played_at ?? null,
            song.uploaded_at ?? null,
        ]
    );
}

export async function getSongByLocalUri(localUri: string): Promise<Song | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<any>(
        `SELECT * FROM songs WHERE local_uri = ?`,
        [localUri]
    );
    return row ? mapRowToSong(row) : null;
}

export async function getSongById(id: string): Promise<Song | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<any>(
        `SELECT * FROM songs WHERE id = ?`,
        [id]
    );
    return row ? mapRowToSong(row) : null;
}

export async function mapRowToSong(row: any): Promise<Song> {
    return {
        ...row,
        uri: row.local_uri ?? row.uri,   // normalize
    };
}

export async function getAllSongs(): Promise<Song[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>(
        `SELECT * FROM songs ORDER BY date_added DESC`
    );
    return Promise.all(rows.map(mapRowToSong));
}

export async function updateSongLocalUri(id: string, localUri: string | null): Promise<void> {
    const db = await getDb();
    await db.runAsync(`UPDATE songs SET local_uri = ? WHERE id = ?`, [localUri, id]);
}

export async function updateSongPinned(id: string, isPinned: boolean): Promise<void> {
    const db = await getDb();
    await db.runAsync(`UPDATE songs SET is_pinned = ? WHERE id = ?`, [isPinned ? 1 : 0, id]);
}

export async function setFavorite(id: string, isFavorite: boolean) {
    const db = await getDb();
    await db.runAsync(`UPDATE songs SET is_favorite = ? WHERE id = ?`, [isFavorite ? 1 : 0, id]);
}

export async function updateSongLastPlayed(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(`UPDATE songs SET last_played_at = ?, play_count = play_count + 1 WHERE id = ?`, [Date.now(), id]);
}

export async function updateSongCloudKey(id: string, cloudKey: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(`UPDATE songs SET cloud_key = ?, uploaded_at = ? WHERE id = ?`, [cloudKey, Date.now(), id]);
}