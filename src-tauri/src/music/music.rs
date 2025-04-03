use core::panic;
use playerctl_wrapper::{playerctld::DBusItem, properties};
use tokio::sync::watch;
use tracing::error;

use crate::notifications::NotificationPayload;
use crate::{emitter::CustomEmitter as Emitter, AppState};

use super::player::Player;

//TODO: replace all Player::new() calls with a Tauri-managed state

#[tauri::command]
pub async fn start_music_listener(app: tauri::AppHandle) {
    let (sender, mut receiver) = tokio::sync::mpsc::channel(100);
    let player = Player::new().unwrap_or_else(|e| panic!("Failed to create a player: {}", e));

    if let Ok(props) = properties::Properties::new() {
        tokio::spawn(async move {
            let sender = sender.clone();
            let _ = props
                .properties_changed(sender, Some(props.get_interface()))
                .await;
        });

        while let Some(response) = receiver.recv().await {
            if response.contains_key("Metadata") {
                Emitter::emit_song_change(player.get_song_info(), &app);
                Emitter::emit_song_position(player.get_song_position(), &app);
            }
            if response.contains_key("PlaybackStatus") {
                Emitter::emit_music_is_playing(player.get_playback_status(), &app);
            }
        }
    }
}

#[tauri::command]
pub fn emit_music_status(app: tauri::AppHandle) {
    let player = Player::new().unwrap_or_else(|e| panic!("Failed to create a player: {}", e));

    Emitter::emit_song_position(player.get_song_position(), &app);
    Emitter::emit_song_change(player.get_song_info(), &app);
    Emitter::emit_music_is_playing(player.get_playback_status(), &app);
}

#[tauri::command]
pub fn next_song(app: tauri::AppHandle) {
    let player = Player::new().unwrap_or_else(|e| panic!("Failed to create a player: {}", e));

    let _ = player.next_song().map_err(|e| {
        error!("Error while trying to call next_song: {}", e);
        Emitter::emit_error(
            NotificationPayload::warning("Music", "Failed to play next song!", None),
            &app,
        );
    });
}

#[tauri::command]
pub fn previous_song(app: tauri::AppHandle) {
    let player = Player::new().unwrap_or_else(|e| panic!("Failed to create a player: {}", e));

    let _ = player.previous_song().map_err(|e| {
        error!("Error while trying to call previous_song: {}", e);
        Emitter::emit_error(
            NotificationPayload::warning("Music", "Failed to play previous song!", None),
            &app,
        );
    });
}

#[tauri::command]
pub fn play_pause_song(app: tauri::AppHandle) {
    let player = Player::new().unwrap_or_else(|e| panic!("Failed to create a player: {}", e));

    let _ = player.play_pause().map_err(|e| {
        error!("Error while trying to call play_pause: {}", e);
        Emitter::emit_error(
            NotificationPayload::warning("Music", "Failed to play/pause song!", None),
            &app,
        );
    });
}

#[tauri::command]
pub fn toggle_shuffle(app: tauri::AppHandle) {
    let player = Player::new().unwrap_or_else(|e| panic!("Failed to create a player: {}", e));

    let _ = player.toggle_shuffle().map_err(|e| {
        error!("Error while trying to call toggle_shuffle: {}", e);
        Emitter::emit_error(
            NotificationPayload::warning(
                "Music",
                "(Shuffling is only available on local playback (for now!))",
                None,
            ),
            &app,
        );
    });
}

#[tauri::command]
pub fn set_song_position(app: tauri::AppHandle, position: i64) {
    let player = Player::new().unwrap_or_else(|e| panic!("Failed to create a player: {}", e));

    match player.set_song_position(position) {
        Ok(_) => Emitter::emit_song_position(player.get_song_position(), &app),
        Err(e) => {
            error!("Error while trying to call set_song_position: {}", e);
            Emitter::emit_error(
                NotificationPayload::warning("Music", "Failed to set position!", None),
                &app,
            );
        }
    }
}

#[tauri::command]
pub async fn start_position_polling(
    state: tauri::State<'_, AppState>,
    app: tauri::AppHandle,
) -> Result<(), ()> {
    let mut sender_lock = state.music_position_sender.lock().await;
    if sender_lock.is_none() {
        let (sender, receiver) = watch::channel(true);
        *sender_lock = Some(sender);

        tokio::spawn(Player::get_song_progress(app, receiver));
    } else {
        if let Some(sender) = sender_lock.as_ref() {
            let _ = sender.send(true);
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn stop_position_polling(state: tauri::State<'_, AppState>) -> Result<(), ()> {
    let mut sender_lock = state.music_position_sender.lock().await;
    if let Some(sender) = sender_lock.take() {
        let _ = sender.send(false);
    };
    Ok(())
}
