declare module "jsmediatags/build2/jsmediatags" {
    interface Picture {
        format: string;
        data: number[];
    }

    interface Tags {
        title?: string;
        artist?: string;
        album?: string;
        picture?: Picture;
    }

    interface Tag {
        tags: Tags;
    }

    interface Config {
        setFileReader(reader: any): void;
    }

    interface Jsmediatags {
        Config: Config;
        read(uri: string, options: {
            onSuccess: (tag: Tag) => void;
            onError: (error: any) => void;
        }): void;
    }

    const jsmediatags: Jsmediatags;
    export default jsmediatags;
}