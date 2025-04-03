use std::time::Duration;

use playerctl_wrapper::{metadata::Metadata, player::Player as PlayerCtl, playerctld::Properties};
use tokio::{sync::watch, time::sleep};
use tracing::debug;

use crate::emitter::CustomEmitter;

use super::SongInfo;

pub struct Player {
    player: PlayerCtl,
}

impl Player {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Self {
            player: PlayerCtl::new()?,
        })
    }

    pub fn get_playback_status(&self) -> String {
        return self
            .player
            .get_property("PlaybackStatus")
            .unwrap_or("Stopped".to_string());
    }

    pub fn get_song_info(&self) -> SongInfo {
        let metadata_prop = self.player.get_property("Metadata").unwrap();

        let metadata = Metadata::from(&metadata_prop);

        return SongInfo::from_metadata(metadata);
    }

    pub fn get_song_position(&self) -> i64 {
        let position = self.player.get_property::<i64>("Position").unwrap();
        return position / 1000000;
    }

    pub async fn get_song_progress(app: tauri::AppHandle, receiver: watch::Receiver<bool>) {
        let player = Player::new().unwrap();
        while *receiver.borrow() {
            let position = player.player.get_property::<i64>("Position").unwrap();
            CustomEmitter::emit_song_position(position / 1000000, &app);
            sleep(Duration::from_millis(1000)).await;
        }
    }

    pub fn next_song(&self) -> Result<(), String> {
        self.player.next()
    }

    pub fn previous_song(&self) -> Result<(), String> {
        self.player.previous()
    }

    pub fn play_pause(&self) -> Result<(), String> {
        self.player.play_pause()
    }

    pub fn toggle_shuffle(&self) -> Result<(), String> {
        self.player.set_property("Volume", 0.05)
    }

    pub fn set_song_position(&self, position: i64) -> Result<(), String> {
        self.player.seek(position)
    }
}
