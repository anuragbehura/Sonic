import * as DocumentPicker from "expo-document-picker";
import { File, Directory, Paths } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
import { getAudioMetadata } from "@missingcore/audio-metadata";
import { getSongByLocalUri, insertSong } from "../database/songs";
import { useToastStore } from "../store/toastStore";
import { Song } from "../types/music";

function getSongsDir() {
    const dir = new Directory(Paths.document, "songs");
    if (!dir.exists) dir.create();
    return dir;
}

function getCoversDir() {
    const dir = new Directory(Paths.document, "covers");
    if (!dir.exists) dir.create();
    return dir;
}

export async function extractMetadata(fileUri: string, songId: string) {
    try {
        const { metadata } = await getAudioMetadata(fileUri, [
            "name",
            "artist",
            "album",
            "artwork",
        ]);

        console.log("METADATA RESULT for", fileUri, JSON.stringify(metadata));

        let artworkUri: string | undefined;
        if (metadata.artwork) {
            const base64Data = metadata.artwork.includes(",")
                ? metadata.artwork.split(",")[1]
                : metadata.artwork;

            const artworkFile = new File(getCoversDir(), `${songId}.jpg`);
            await FileSystem.writeAsStringAsync(artworkFile.uri, base64Data, {
                encoding: FileSystem.EncodingType.Base64,
            });
            artworkUri = artworkFile.uri;
        }

        return {
            title: metadata.name || undefined,
            artist: metadata.artist || undefined,
            album: metadata.album || undefined,
            artwork: artworkUri,
        };
    } catch (err) {
        console.log("METADATA EXTRACTION FAILED for", fileUri, err);
        return {};
    }
}

export async function pickAndImportSongs(): Promise<Song[]> {
    const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: true,
        copyToCacheDirectory: true,
    });

    if (result.canceled) return [];

    const songsDir = getSongsDir();
    const imported: Song[] = [];

    for (const asset of result.assets) {
        const destFile = new File(songsDir, asset.name);

        const existing = await getSongByLocalUri(destFile.uri);
        if (existing) {
            useToastStore.getState().show(`"${asset.name}" already imported`);
            imported.push(existing);
            continue;
        }

        const sourceFile = new File(asset.uri);
        sourceFile.copy(destFile);

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const meta = await extractMetadata(destFile.uri, id);

        const song: Song = {
            id,
            local_uri: destFile.uri,
            title: meta.title || asset.name.replace(/\.[^/.]+$/, ""),
            artist: meta.artist || "Unknown Artist",
            album: meta.album,
            artwork: meta.artwork,
        };

        await insertSong(song);
        imported.push(song);
    }

    return imported;
}