import * as DocumentPicker from "expo-document-picker";

import { File, Directory, Paths } from "expo-file-system";

import { getSongByLocalUri, insertSong } from "../database/songs";

import { useToastStore } from "../store/toastStore";

import { Song } from "../types/music";


function getSongsDir() {
    const dir = new Directory(Paths.document, "songs");

    if (!dir.exists) {
        dir.create();
    }

    return dir;
}


function getCoversDir() {
    const dir = new Directory(Paths.document, "covers");

    if (!dir.exists) {
        dir.create();
    }

    return dir;
}


function removeExtension(filename: string) {
    return filename.replace(/\.[^/.]+$/, "");
}


/**
 * Metadata fallback.
 *
 * Expo FileSystem can read the audio file, but it does not currently
 * parse ID3 tags for us automatically.
 *
 * For now we use the filename as the title.
 */
export async function extractMetadata(
    fileUri: string,
    songId: string
): Promise<{
    title?: string;
    artist?: string;
    album?: string;
    artwork?: string;
}> {

    try {

        console.log("========== METADATA DEBUG ==========");
        console.log("FILE URI:", fileUri);
        console.log("SONG ID:", songId);

        const file = new File(fileUri);

        console.log("FILE EXISTS:", file.exists);
        console.log("FILE NAME:", file.name);
        console.log("FILE SIZE:", file.size);

        const filename = file.name;

        return {
            title: removeExtension(filename),
            artist: "Unknown Artist",
            album: undefined,
            artwork: undefined,
        };

    } catch (error) {

        console.log(
            "METADATA EXTRACTION FAILED:",
            error
        );

        return {};
    }
}


export async function pickAndImportSongs(): Promise<Song[]> {

    const result = await DocumentPicker.getDocumentAsync({

        type: "audio/*",

        multiple: true,

        copyToCacheDirectory: true,

    });


    if (result.canceled) {
        return [];
    }


    const songsDir = getSongsDir();

    const imported: Song[] = [];


    for (const asset of result.assets) {

        try {

            console.log("========== IMPORT DEBUG ==========");

            console.log("ASSET NAME:", asset.name);

            console.log("ASSET URI:", asset.uri);


            const destFile = new File(
                songsDir,
                asset.name
            );


            console.log(
                "DEST URI:",
                destFile.uri
            );


            const existing =
                await getSongByLocalUri(
                    destFile.uri
                );


            if (existing) {

                useToastStore
                    .getState()
                    .show(
                        `"${asset.name}" already imported`
                    );

                imported.push(existing);

                continue;
            }


            const sourceFile =
                new File(asset.uri);


            sourceFile.copy(destFile);


            console.log(
                "COPIED TO:",
                destFile.uri
            );


            const id =
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`;


            const meta =
                await extractMetadata(
                    destFile.uri,
                    id
                );


            const song: Song = {

                id,

                local_uri: destFile.uri,

                title:
                    meta.title ||
                    removeExtension(asset.name),

                artist:
                    meta.artist ||
                    "Unknown Artist",

                album:
                    meta.album,

                artwork:
                    meta.artwork,

                date_added:
                    Date.now(),

                play_count:
                    0,

                is_favorite:
                    false,

            };


            console.log(
                "SAVING SONG:",
                song
            );


            await insertSong(song);


            imported.push(song);

        } catch (error) {

            console.error(
                `FAILED TO IMPORT ${asset.name}:`,
                error
            );
        }
    }


    return imported;
}