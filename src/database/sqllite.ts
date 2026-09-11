import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("sonic.db");
  }
  return db;
}

async function columnExists(
  database: SQLite.SQLiteDatabase,
  table: string,
  column: string
): Promise<boolean> {
  const rows = await database.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${table});`
  );
  return rows.some((r) => r.name === column);
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

  // ----- migrations for existing DBs -----
  if (!(await columnExists(database, "songs", "last_played_at"))) {
    await database.execAsync(
      `ALTER TABLE songs ADD COLUMN last_played_at INTEGER;`
    );
  }

  if (!(await columnExists(database, "songs", "uploaded_at"))) {
    await database.execAsync(
      `ALTER TABLE songs ADD COLUMN uploaded_at INTEGER;`
    );
  }

  if (!(await columnExists(database, "songs", "cloud_key"))) {
    await database.execAsync(
      `ALTER TABLE songs ADD COLUMN cloud_key TEXT;`
    );
  }

  if (!(await columnExists(database, "songs", "local_uri"))) {
    await database.execAsync(
      `ALTER TABLE songs ADD COLUMN local_uri TEXT;`
    );
  }

  if (!(await columnExists(database, "songs", "is_pinned"))) {
    await database.execAsync(
      `ALTER TABLE songs ADD COLUMN is_pinned INTEGER NOT NULL DEFAULT 0;`
    );
  }
}