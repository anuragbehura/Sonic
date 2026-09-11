import { getAllSongs, insertSong } from "../database/songs";
import { extractMetadata } from "./fileImporter";

export async function rescanAllMetadata() {
    const songs = await getAllSongs();
    console.log(`Rescanning ${songs.length} songs...`);

    for (const song of songs) {
        const localUri = song.uri;   // now populated by the mapper

        if (!localUri) {
            console.warn(`Skipping "${song.title}" — no local URI`);
            continue;
        }

        const meta = await extractMetadata(localUri, song.id);

        // only overwrite if we actually got something new
        const updated = {
            ...song,
            title: meta.title ?? song.title,
            artist: meta.artist ?? song.artist,
            album: meta.album ?? song.album,
            artwork: meta.artwork ?? song.artwork,
        };

        await insertSong(updated);
    }

    console.log("Rescan complete.");
}