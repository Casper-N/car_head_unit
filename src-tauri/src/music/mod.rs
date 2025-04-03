use playerctl_wrapper::metadata::Metadata;
use serde::Serialize;
use serde_json::json;

pub mod music;
pub mod player;

#[derive(Default, Clone, Debug, Serialize)]
pub struct SongInfo {
    title: Option<String>,
    artist: Option<Vec<String>>,
    album: Option<String>,
    album_url: Option<String>,
    length: Option<i64>,
}

impl SongInfo {
    pub fn from_metadata(metadata: Metadata) -> Self {
        let length_seconds = match metadata.length {
            Some(len) => Some(len / 1000000),
            None => None,
        };

        Self {
            title: metadata.title,
            artist: metadata.artist,
            album: metadata.album,
            album_url: metadata.art_url,
            length: length_seconds,
        }
    }
}

#[derive(Default, Clone, Debug, Serialize)]
pub struct MusicStatus {
    is_playing: Option<bool>,
    song: SongInfo,
}

#[derive(Default, Debug, Serialize)]
pub struct MusicPosition {
    position: Option<f64>,
}

impl MusicStatus {}

impl ToString for MusicStatus {
    fn to_string(&self) -> String {
        let is_playing = self.is_playing.unwrap_or(false).to_string();
        let song = &self.song;
        let title = &song.title.clone().unwrap_or("".to_string());
        let artist = &song.artist.clone().unwrap_or(vec![]);
        let album = &song.album.clone().unwrap_or("".to_string());
        let album_url = song.album_url.clone().unwrap_or("".to_string());
        let length = song.length.unwrap_or(0);

        return json!({
            "is_playing": is_playing,
            "title": title,
            "artist": artist,
            "album": album,
            "album_url": album_url,
            "length": length,
        })
        .to_string();
    }
}
