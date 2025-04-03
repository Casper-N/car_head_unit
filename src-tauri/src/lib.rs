use std::{collections::HashMap, sync::Arc};

use bluetooth::bluetooth::{
    connect_to_device, device_listener, disconnect_from_device, get_discovery_status,
    get_known_devices, remove_device, set_default_agent, start_bt_listener, start_discovery,
    stop_discovery, turn_off_bluetooth, turn_on_bluetooth,
};
use bt_wrapper::{adapter::adapter1::Adapter1, org_bluez::agent_manager1::AgentManager1};
use music::music::{
    emit_music_status, next_song, play_pause_song, previous_song, set_song_position,
    start_music_listener, start_position_polling, stop_position_polling, toggle_shuffle,
};
use tauri::Manager;
use tokio::sync::{watch, Mutex};
use tracing::info;

pub mod bluetooth;
mod emitter;
mod music;
mod notifications;

pub struct AppState {
    music_position_sender: Mutex<Option<watch::Sender<bool>>>,
    bluetooth_adapter: Option<Adapter1>,
    bluetooth_agent: Option<AgentManager1>,
    device_tasks: std::sync::Mutex<HashMap<String, watch::Sender<bool>>>,
}

impl AppState {
    fn new() -> Self {
        let adapter = match Adapter1::new() {
            Ok(adapter) => Some(adapter),
            Err(_) => None,
        };
        let agent = match AgentManager1::new() {
            Ok(adapter) => Some(adapter),
            Err(_) => None,
        };
        Self {
            music_position_sender: Mutex::new(None),
            bluetooth_adapter: adapter,
            bluetooth_agent: agent,
            device_tasks: std::sync::Mutex::new(HashMap::new()),
        }
    }

    pub fn start_device_listener(&self, address: &String, app: &tauri::AppHandle) {
        info!("Starting device listener for address {}", &address);

        let mut tasks = self.device_tasks.lock().unwrap(); //FIXME: unwrap

        if tasks.contains_key(address) {
            info!("Listener for {} is already running, skipping...", &address);
            return;
        }

        let (shutdown_tx, shutdown_rx) = watch::channel(false);
        tasks.insert(address.clone(), shutdown_tx);

        let app = app.clone();
        let address = address.clone();
        tokio::spawn(async move {
            device_listener(&address, app, shutdown_rx).await;
        });
    }

    pub fn stop_device_listener(&self, address: &String) {
        info!("Stopping device listener for address {}", &address);
        let mut tasks = self.device_tasks.lock().unwrap(); //FIXME: unwrap
        if let Some(shutdown_tx) = tasks.remove(address) {
            let _ = shutdown_tx.send(true);
            self.device_tasks.lock().unwrap().remove(address);
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::new())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle();

            let app = handle.clone();
            tauri::async_runtime::spawn(async move {
                start_music_listener(app).await;
            });
            let app = handle.clone();
            start_bt_listener(app);

            set_default_agent(handle.state());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_position_polling,
            stop_position_polling,
            emit_music_status,
            next_song,
            previous_song,
            play_pause_song,
            toggle_shuffle,
            set_song_position,
            connect_to_device,
            start_discovery,
            stop_discovery,
            remove_device,
            disconnect_from_device,
            turn_on_bluetooth,
            get_known_devices,
            get_discovery_status,
            turn_off_bluetooth
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
