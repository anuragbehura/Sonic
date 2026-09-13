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

  return rows.some((row) => row.name === column);
}

export async function initDb() {
  const database = await getDb();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
  `);

  /*
   * Check whether old "uri" column exists.
   */
  const hasOldUri = await columnExists(
    database,
    "songs",
    "uri"
  );

  if (hasOldUri) {
    console.log(
      "🔄 Migrating songs table from uri → local_uri"
    );

    await database.execAsync(`
      BEGIN TRANSACTION;

      CREATE TABLE songs_new (
        id TEXT PRIMARY KEY NOT NULL,

        local_uri TEXT,

        title TEXT NOT NULL,

        artist TEXT,

        album TEXT,

        artwork TEXT,

        duration REAL,

        date_added INTEGER NOT NULL,

        play_count INTEGER NOT NULL DEFAULT 0,

        is_favorite INTEGER NOT NULL DEFAULT 0,

        cloud_key TEXT,

        is_pinned INTEGER NOT NULL DEFAULT 0,

        last_played_at INTEGER,

        uploaded_at INTEGER
      );

      INSERT INTO songs_new (
        id,
        local_uri,
        title,
        artist,
        album,
        artwork,
        duration,
        date_added,
        play_count,
        is_favorite,
        cloud_key,
        is_pinned,
        last_played_at,
        uploaded_at
      )
      SELECT
        id,
        uri,
        title,
        artist,
        album,
        artwork,
        duration,
        date_added,
        play_count,
        is_favorite,
        cloud_key,
        COALESCE(is_pinned, 0),
        last_played_at,
        uploaded_at
      FROM songs;

      DROP TABLE songs;

      ALTER TABLE songs_new RENAME TO songs;

      COMMIT;
    `);

    console.log(
      "✅ Songs table migration complete"
    );
  }

  /*
   * Create tables if they don't exist.
   */
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY NOT NULL,

      local_uri TEXT,

      title TEXT NOT NULL,

      artist TEXT,

      album TEXT,

      artwork TEXT,

      duration REAL,

      date_added INTEGER NOT NULL,

      play_count INTEGER NOT NULL DEFAULT 0,

      is_favorite INTEGER NOT NULL DEFAULT 0,

      cloud_key TEXT,

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

      FOREIGN KEY (playlist_id)
        REFERENCES playlists(id),

      FOREIGN KEY (song_id)
        REFERENCES songs(id)
    );
  `);

  console.log("✅ Database initialized");
}