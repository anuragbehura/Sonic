import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
    if (!db) {
        db = await SQLite.openDatabaseAsync("sonic.db");
    }
    return db;
}

export async function initDb() {
    const database = await getDb();

    await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      artist TEXT,
      album TEXT,
      artwork TEXT,
      duration REAL,
      date_added INTEGER NOT NULL,
      play_count INTEGER NOT NULL DEFAULT 0,
      is_favorite INTEGER NOT NULL DEFAULT 0,

      -- hybrid cloud fields
      cloud_key TEXT,
      local_uri TEXT,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      last_played_at INTEGER,
      uploaded_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS playlist_songs (
      playlist_id TEXT NOT NULL,
      song_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id),
      FOREIGN KEY (song_id) REFERENCES songs(id)
    );
  `);
}