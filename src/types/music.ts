export interface Song {
    id: string;

    local_uri?: string;

    title: string;

    artist: string;

    album?: string;

    artwork?: string;

    duration?: number;
    
    date_added?: number;

    // hybrid cloud fields
    cloud_key?: string;
    is_pinned?: boolean;
    last_played_at?: number;
    uploaded_at?: number;
    play_count?: number;
    is_favorite?: boolean;
}