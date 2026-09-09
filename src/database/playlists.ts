import { getDb } from "./sqllite";

export interface Playlist {
  id: string;
  name: string;
  created_at: number;
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  const db = await getDb();
  return db.getAllAsync<Playlist>(`SELECT * FROM playlists ORDER BY created_at DESC`);
}

export async function createPlaylist(name: string): Promise<string> {
  const db = await getDb();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await db.runAsync(
    `INSERT INTO playlists (id, name, created_at) VALUES (?, ?, ?)`,
    [id, name, Date.now()]
  );
  return id;
}

export async function deletePlaylist(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM playlists WHERE id = ?`, [id]);
  await db.runAsync(`DELETE FROM playlist_songs WHERE playlist_id = ?`, [id]);
}

export async function getPlaylistSongs(playlistId: string) {
  const db = await getDb();
  return db.getAllAsync(`
    SELECT s.* FROM songs s
    JOIN playlist_songs ps ON s.id = ps.song_id
    WHERE ps.playlist_id = ?
    ORDER BY ps.position ASC
  `, [playlistId]);
}

export async function addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ position: number }>(
    `SELECT MAX(position) as position FROM playlist_songs WHERE playlist_id = ?`,
    [playlistId]
  );
  const position = (existing?.position ?? -1) + 1;
  await db.runAsync(
    `INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)`,
    [playlistId, songId, position]
  );
}

export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?`,
    [playlistId, songId]
  );
}