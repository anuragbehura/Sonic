import { getAllSongs, insertSong } from "../database/songs";
import { extractMetadata } from "./fileImporter";

export async function rescanAllMetadata() {
    const songs = await getAllSongs();

    for (const song of songs) {
        const meta = await extractMetadata(song.local_uri || "", song.id);

        await insertSong({
            ...song,
            title: meta.title || song.title,
            artist: meta.artist || song.artist,
            album: meta.album || song.album,
            artwork: meta.artwork || song.artwork,
        });
    }
}