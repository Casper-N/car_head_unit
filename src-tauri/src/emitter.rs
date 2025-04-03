use std::fmt::Debug;

use crate::{
    bluetooth::{BtDevice, BtState},
    music::SongInfo,
    notifications::NotificationPayload,
};
use serde::Serialize;
use tauri::Emitter;
use tracing::info;

pub struct CustomEmitter {}

impl CustomEmitter {
    fn emit_event<T: Serialize + Debug + Clone>(app: &tauri::AppHandle, name: &str, payload: T) {
        info!("Firing event {} with payload {:?}", &name, &payload);

        app.emit(name, payload)
            .unwrap_or_else(|e| eprintln!("Failed to emit event {}, {}", name, e));
    }

    // General
    pub fn emit_error(payload: NotificationPayload, app: &tauri::AppHandle) {
        let event_name = Self::get_notif_event_name(&payload);
        Self::emit_event(app, &event_name, payload);
    }

    pub fn emit_update_available(payload: NotificationPayload, app: &tauri::AppHandle) {
        Self::emit_event(app, "update-available", payload);
    }

    // Music events
    pub fn emit_music_is_playing(payload: String, app: &tauri::AppHandle) {
        Self::emit_event(app, "music-is-playing", payload.to_string());
    }

    pub fn emit_song_change(payload: SongInfo, app: &tauri::AppHandle) {
        Self::emit_event(app, "music-song-change", payload);
    }

    pub fn emit_song_position(payload: i64, app: &tauri::AppHandle) {
        Self::emit_event(app, "music-position-change", payload);
    }

    // Bluetooth events
    pub fn emit_bluetooth_device(payload: BtDevice, app: &tauri::AppHandle) {
        Self::emit_event(app, "bt-device-found", payload);
    }

    pub fn emit_bluetooth_connected(payload: NotificationPayload, app: &tauri::AppHandle) {
        Self::emit_event(app, "bt-device-connected", payload);
        Self::emit_bluetooth_state(&BtState::Connected, app);
    }

    pub fn emit_bluetooth_disconnected(payload: NotificationPayload, app: &tauri::AppHandle) {
        Self::emit_event(app, "bt-device-disconnected", payload);
    }

    pub fn emit_bluetooth_removed(payload: &String, app: &tauri::AppHandle) {
        Self::emit_event(app, "bt-device-disconnected", payload);
    }

    pub fn emit_bluetooth_discovery(payload: String, app: &tauri::AppHandle) {
        Self::emit_event(app, "bt-discovering", &payload);
        match payload.as_str() {
            "true" => Self::emit_bluetooth_state(&BtState::Searching, app),
            _ => Self::emit_bluetooth_state(&BtState::On, app),
        }
    }

    pub fn emit_bluetooth_state(payload: &BtState, app: &tauri::AppHandle) {
        Self::emit_event(app, "bt-state", payload);
    }

    // Utils
    fn get_notif_event_name(payload: &NotificationPayload) -> String {
        format!(
            "{}-notification-{}",
            payload.level.to_string(),
            payload.title
        )
    }
}
