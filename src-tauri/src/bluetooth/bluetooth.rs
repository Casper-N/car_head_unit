use std::sync::Arc;

use bt_wrapper::{
    adapter::adapter1::Adapter1,
    dbus_utils::parse_variant,
    devices::device::device1::Device1,
    properties,
    root::object_manager::ObjectManager,
    utils::{get_address_from_path, get_path_from_address},
    DBusItem, Properties,
};
use regex::Regex;
use tauri::Manager;
use tokio::sync::watch;
use tracing::{error, info};

use crate::{emitter::CustomEmitter as Emitter, notifications::NotificationPayload, AppState};

use super::BtDevice;

#[tauri::command]
pub fn start_discovery(app: tauri::AppHandle, state: tauri::State<'_, AppState>) -> Result<(), ()> {
    info!("Starting bluetooth discovery");
    let adapter = match &state.bluetooth_adapter {
        Some(adapter) => adapter,
        None => {
            error!("Failed to create adapter, cause");
            Emitter::emit_error(NotificationPayload::bluetooth_adapter_error(), &app);
            return Ok(());
        }
    };

    match adapter.start_discovery() {
        Ok(_) => {}
        Err(e) => {
            error!("Failed to start discovery, cause: {}", e);
            Emitter::emit_error(NotificationPayload::bluetooth_start_discovery_error(), &app);
        }
    };
    Ok(())
}

#[tauri::command]
pub fn stop_discovery(app: tauri::AppHandle, state: tauri::State<'_, AppState>) -> Result<(), ()> {
    info!("Stopping bluetooth discovery");
    let adapter = match &state.bluetooth_adapter {
        Some(adapter) => adapter,
        None => {
            error!("Failed to create adapter, cause");
            Emitter::emit_error(NotificationPayload::bluetooth_adapter_error(), &app);
            return Ok(());
        }
    };

    match adapter.stop_discovery() {
        Ok(_) => {}
        Err(e) => {
            error!("Failed to stop discovery, cause: {}", e);
            Emitter::emit_error(NotificationPayload::bluetooth_stop_discovery_error(), &app);
        }
    };
    Ok(())
}

#[tauri::command]
pub fn get_discovery_status(
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<(), ()> {
    info!("Getting discovery status");
    let adapter = match &state.bluetooth_adapter {
        Some(adapter) => adapter,
        None => return Ok(()),
    };

    let discovering = adapter.get_property::<bool>("Discovering").unwrap_or(false);

    Emitter::emit_bluetooth_discovery(discovering.to_string(), &app);
    Ok(())
}

#[tauri::command]
pub fn remove_device(
    address: String,
    app: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<(), ()> {
    info!("Removing device {}", address);
    let adapter = match &state.bluetooth_adapter {
        Some(adapter) => adapter,
        None => {
            error!("Failed to create adapter");
            Emitter::emit_error(NotificationPayload::bluetooth_adapter_error(), &app);
            return Ok(());
        }
    };

    match adapter.remove_device(get_path_from_address(&address, adapter.get_object_path()).into()) {
        Ok(_) => {}
        Err(e) => error!("Failed to remove device {}, cause: {}", address, e),
    };
    Ok(())
}

#[tauri::command]
pub fn connect_to_device(address: String, app: tauri::AppHandle) -> Result<(), ()> {
    info!("Connecting to device {}", address);
    let device = match Device1::new(address.as_str()) {
        Ok(dev) => dev,
        Err(err) => {
            error!("Failed to create Device1: {}", err);
            Emitter::emit_error(NotificationPayload::bluetooth_device_error(), &app);
            return Ok(());
        }
    };

    tokio::spawn(async move {
        match device.connect() {
            Ok(()) => {}
            Err(e) => {
                error!("Failed to connect to device {}, cause {}", address, e);
                Emitter::emit_error(NotificationPayload::bluetooth_connect_error(), &app);
            }
        }
    });
    Ok(())
}

#[tauri::command]
pub fn disconnect_from_device(address: String, app: tauri::AppHandle) -> Result<(), ()> {
    info!("Disonnecting from device {}", address);
    let device = match Device1::new(address.as_str()) {
        Ok(dev) => dev,
        Err(e) => {
            error!("Failed to create device {}, cause {}", address, e);
            Emitter::emit_error(NotificationPayload::bluetooth_device_error(), &app);
            return Ok(());
        }
    };

    let device_name = device
        .get_property::<String>("Name")
        .unwrap_or(address.clone());
    tokio::spawn(async move {
        match device.disconnect() {
            Ok(()) => {}
            Err(e) => {
                error!(
                    "Failed to disconnect from device {}, cause: {}",
                    device_name, e
                );
                Emitter::emit_error(NotificationPayload::bluetooth_disconnect_error(), &app);
            }
        }
    });
    Ok(())
}

#[tauri::command]
pub fn get_known_devices(app: tauri::AppHandle) -> Result<(), ()> {
    let re = Regex::new(r"^/org/bluez/hci0/dev_[0-9A-Fa-f]{2}(_[0-9A-Fa-f]{2}){5}$")
        .unwrap_or_else(|e| {
            error!("Failed to create a device path regex, cause: {}", e);
            panic!("Failed to create a device path regex, cause: {}", e)
        });

    info!("Getting connected devices");

    let object_manager = match ObjectManager::new() {
        Ok(obj_mngr) => obj_mngr,
        Err(e) => {
            error!("Failed to create an object manager, cause: {}", e);
            return Ok(());
        }
    };

    match object_manager.get_managed_objects() {
        Ok(objects) => {
            for (path, properties) in objects {
                if !path.starts_with("/org/bluez/hci0/dev_") || !re.is_match(&path.to_string()) {
                    continue;
                }

                for (iface, props) in properties {
                    if !iface.starts_with("org.bluez.Device") {
                        continue;
                    }

                    let mut device = BtDevice::default();

                    props
                        .get("Name")
                        .and_then(|prop| parse_variant::<String>(prop).ok())
                        .map(|prop| device.name = prop.to_string());

                    props
                        .get("Address")
                        .and_then(|prop| parse_variant::<String>(prop).ok())
                        .map(|prop| device.address = prop.to_string());

                    props
                        .get("Paired")
                        .and_then(|prop| parse_variant::<bool>(prop).ok())
                        .map(|prop| device.paired = *prop);

                    props
                        .get("Connected")
                        .and_then(|prop| parse_variant::<bool>(prop).ok())
                        .map(|prop| device.connected = *prop);

                    props
                        .get("Icon")
                        .and_then(|prop| parse_variant::<String>(prop).ok())
                        .map(|prop| device.icon = prop.to_string());

                    if !device.address.is_empty() {
                        let address = device.address.clone();
                        Emitter::emit_bluetooth_device(device, &app);

                        let state: tauri::State<'_, AppState> = app.state();
                        state.start_device_listener(&address, &app);
                    }
                }
            }
        }
        Err(_) => todo!(),
    };
    Ok(())
}

#[tauri::command]
pub fn turn_on_bluetooth(app: tauri::AppHandle) -> Result<(), ()> {
    info!("Turning on bluetooth");
    let adapter = match Adapter1::new() {
        Ok(adapter) => adapter,
        Err(e) => {
            error!("Failed to create adapter, cause: {}", e);
            Emitter::emit_error(NotificationPayload::bluetooth_adapter_error(), &app);
            return Ok(());
        }
    };

    match adapter.set_property("Powered", true) {
        Ok(_) => {}
        Err(e) => {
            error!("Failed to turn on bluetooth, cause: {}", e);
            Emitter::emit_error(NotificationPayload::bluetooth_toggle_error(), &app);
        }
    };
    Ok(())
}

#[tauri::command]
pub fn turn_off_bluetooth(app: tauri::AppHandle) -> Result<(), ()> {
    info!("Turning off bluetooth");
    let adapter = match Adapter1::new() {
        Ok(adapter) => adapter,
        Err(e) => {
            error!("Failed to create adapter, cause: {}", e);
            Emitter::emit_error(NotificationPayload::bluetooth_adapter_error(), &app);
            return Ok(());
        }
    };

    match adapter.set_property("Powered", false) {
        Ok(_) => {}
        Err(e) => {
            error!("Failed to turn off bluetooth, cause: {}", e);
            Emitter::emit_error(NotificationPayload::bluetooth_toggle_error(), &app);
        }
    };
    Ok(())
}

#[tauri::command]
pub fn start_bt_listener(app: tauri::AppHandle) {
    info!("Starting bt listeners...");
    let app = Arc::new(app);

    let app_clone = Arc::clone(&app);
    tauri::async_runtime::spawn(async move {
        device_found_listener(&app_clone).await;
    });

    let app_clone = Arc::clone(&app);
    tauri::async_runtime::spawn(async move {
        device_removed_listener(&app_clone).await;
    });

    let app_clone = Arc::clone(&app);
    tauri::async_runtime::spawn(async move {
        generic_listener(&app_clone).await;
    });
}

pub fn set_default_agent(state: tauri::State<'_, AppState>) {
    if let Some(agent) = &state.bluetooth_agent {
        match agent.register_agent(
            "/org/bluez/car_head_unit".into(),
            "NoInputNoOutput".to_string(),
        ) {
            Ok(_) => {
                if let Err(e) = agent.request_default_agent("/org/bluez/car_head_unit".into()) {
                    error!("Failed to request default agent, cause: {}", e);
                } else {
                    info!("Default agent set");
                }
            }
            Err(e) => {
                error!("Failed to register an agent, cause: {}", e);
            }
        }
    }
}

async fn device_found_listener(app: &tauri::AppHandle) {
    info!("... device found listener");
    let re = Regex::new(r"^/org/bluez/hci0/dev_[0-9A-Fa-f]{2}(_[0-9A-Fa-f]{2}){5}$")
        .unwrap_or_else(|e| {
            error!("Failed to create a device path regex, cause: {}", e);
            panic!("Failed to create a device path regex, cause: {}", e)
        });

    let object_manager = match ObjectManager::new() {
        Ok(mngr) => mngr,
        Err(e) => {
            error!("Failed to create an object manager, cause: {}", e);
            return;
        }
    };

    let (sender, mut receiver) = tokio::sync::mpsc::channel(100);
    tokio::spawn(async move { object_manager.interfaces_added(sender, None).await });

    while let Some(response) = receiver.recv().await {
        for (path, props) in response.1 {
            if !re.is_match(&path.to_string()) {
                continue;
            }
            let mut device = BtDevice::default();

            props
                .get("Name")
                .and_then(|prop| parse_variant::<String>(prop).ok())
                .map(|prop| device.name = prop.to_string());
            props
                .get("Address")
                .and_then(|prop| parse_variant::<String>(prop).ok())
                .map(|prop| device.address = prop.to_string());
            props
                .get("Paired")
                .and_then(|prop| parse_variant::<bool>(prop).ok())
                .map(|prop| device.paired = *prop);
            props
                .get("Connected")
                .and_then(|prop| parse_variant::<bool>(prop).ok())
                .map(|prop| device.connected = *prop);
            props
                .get("Icon")
                .and_then(|prop| parse_variant::<bool>(prop).ok())
                .map(|prop| device.icon = prop.to_string());

            if !device.address.is_empty() {
                let address = device.address.clone();
                Emitter::emit_bluetooth_device(device, &app);

                let state: tauri::State<'_, AppState> = app.state();
                state.start_device_listener(&address, app);
            }
        }
    }
}

async fn device_removed_listener(app: &tauri::AppHandle) {
    info!("... device removed listener");
    if let Ok(object_manager) =
        ObjectManager::new().map_err(|e| error!("Failed to create an object manager, cause: {}", e))
    {
        let (sender, mut receiver) = tokio::sync::mpsc::channel(100);
        tokio::spawn(async move { object_manager.interfaces_removed(sender, None).await });

        while let Some(response) = receiver.recv().await {
            let path = response.0;

            if path.starts_with("/org/bluez/hci0/dev_") {
                let address =
                    get_address_from_path(path.trim().into()).unwrap_or(path.trim().into());
                Emitter::emit_bluetooth_removed(&address, &app);
                let state: tauri::State<'_, AppState> = app.state();
                state.stop_device_listener(&address);
            }
        }
    }
}

pub async fn device_listener(
    address: &String,
    app: tauri::AppHandle,
    mut shutdown_rx: watch::Receiver<bool>,
) {
    info!("Starting device listener for device {}", &address);

    let device_properties =
        match properties::Properties::new(&get_path_from_address(&address, "/org/bluez/hci0")) {
            Ok(dev_props) => dev_props,
            Err(e) => {
                error!(
                    "Failed to start a device listener for device {}, cause {}",
                    address, e
                );
                return;
            }
        };

    let (sender, mut receiver) = tokio::sync::mpsc::channel(100);

    tokio::spawn(async move {
        device_properties.properties_changed(sender, None).await;
    });

    loop {
        tokio::select! {
            Some(response) = receiver.recv() => {
                if let Some(connected) = response.get("Connected") {
                    if connected.contains("true") {
                        Emitter::emit_bluetooth_connected(
                            NotificationPayload::bluetooth_connected(&address),
                            &app,
                        );
                    } else {
                        Emitter::emit_bluetooth_disconnected(
                            NotificationPayload::bluetooth_disconnected(&address),
                            &app,
                        );
                    }
                }
            }
            _ = shutdown_rx.changed() => {
                    if *shutdown_rx.borrow() {
                        info!("Stopping device listener for device {}", &address);
                        break;
                    }
                }
        }
    }
}

async fn generic_listener(app: &tauri::AppHandle) {
    if let Ok(properties) = properties::Properties::new("/org/bluez/hci0")
        .map_err(|e| error!("Failed to get bluetooth properties, cause: {}", e))
    {
        info!("... generic listener");
        let (sender, mut receiver) = tokio::sync::mpsc::channel(100);

        tokio::spawn(async move {
            properties.properties_changed(sender, None).await;
        });

        while let Some(response) = receiver.recv().await {
            if let Some(iface) = response.get("Sender") {
                match iface.as_str() {
                    "org.bluez.Adapter1" => {
                        let discovering = response
                            .get("Discovering")
                            .is_some_and(|s| s.contains("true"))
                            .to_string();
                        Emitter::emit_bluetooth_discovery(discovering, &app);
                    }
                    _ => {
                        info!("Generic: {:?}", response);
                    }
                }
            }
        }
    }
}
