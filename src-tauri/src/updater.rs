use futures_util::StreamExt;
use reqwest::Response;
use std::{fmt::Display, io::Write, path::Path, process::Command};
use zip::ZipArchive;

use serde::{Deserialize, Serialize};
use tracing::{debug, error};

use crate::{emitter::CustomEmitter as Emitter, notifications::NotificationPayload};

const URL: &str = "https://github.com/casper-n/car_head_unit/releases/latest/download/latest.json";

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInfo {
    version: String,
    url: String,
    change_log: Option<String>,
}

impl Display for UpdateInfo {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.url)
    }
}

#[tauri::command]
pub async fn check_for_updates(app: tauri::AppHandle) -> Result<(), ()> {
    let current_version = env!("CARGO_PKG_VERSION");
    debug!("Checking for updates, current version: {}", current_version);

    let resp = reqwest::get(URL).await.map_err(|e| {
        error!("Failed to fetch latest.json");
        Emitter::emit_error(NotificationPayload::fetch_latest_error(), &app);
    })?;

    let update_info: UpdateInfo = resp.json().await.map_err(|e| {
        error!("Failed to parse latest.json: {}", e);
        Emitter::emit_error(NotificationPayload::fetch_latest_error(), &app);
    })?;

    if *update_info.version > *current_version {
        Emitter::emit_update_available(NotificationPayload::update_available(&update_info), &app);
        Emitter::emit_update_url(&update_info.url, &app);
    } else {
        Emitter::emit_update_available(NotificationPayload::no_update_available(), &app);
    }
    Ok(())
}

#[tauri::command]
pub async fn update_application(
    url: String,
    save_path: String,
    app: tauri::AppHandle,
) -> Result<(), String> {
    debug!("Starting download of update from url {}", url);
    let zip_path = match download_file(url, save_path, &app).await {
        Ok(path) => {
            Emitter::emit_update_step_done(&app, 0);
            path
        }
        Err(e) => {
            Emitter::emit_update_step_fail(&app, 0);
            error!("Failed to get download zip file: {}", e);
            return Err(e);
        }
    };

    let deb_path = match extract_zip(&zip_path, "/home/cappe/Downloads/", &app) {
        Ok(path) => {
            Emitter::emit_update_step_done(&app, 1);
            path
        }
        Err(e) => {
            Emitter::emit_update_step_fail(&app, 1);
            error!("Failed to extract zip file: {}", e);
            return Err(e);
        }
    };

    match install_deb(&deb_path, &app) {
        Ok(()) => {
            Emitter::emit_update_step_done(&app, 2);
            Ok(())
        }
        Err(e) => {
            Emitter::emit_update_step_fail(&app, 2);
            error!("Failed to install file: {}", e);
            Err(e)
        }
    }
}

async fn download_file(
    url: String,
    save_path: String,
    app: &tauri::AppHandle,
) -> Result<String, String> {
    let resp = match reqwest::Client::new().get(url).send().await {
        Ok(res) => res,
        Err(e) => {
            error!("Failed to download update, {}", e);
            Emitter::emit_error(NotificationPayload::fetch_latest_error(), &app);
            return Err(format!("{}", e));
        }
    };

    let total_size = resp
        .content_length()
        .ok_or("Failed to get content length")?;

    let save_path = format!("{}/car_head_unit_update.zip", &save_path);
    let path = Path::new(&save_path);
    let mut file = match std::fs::File::create(path) {
        Ok(f) => f,
        Err(e) => {
            error!("Failed to create a file on system, {}", e);
            return Err(format!("{}", e));
        }
    };

    let mut downloaded: u64 = 0;
    let mut stream = resp.bytes_stream();

    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| {
            error!("Chunk error: {}", e);
            format!("Chunk error: {}", e)
        })?;
        file.write_all(&chunk).map_err(|e| {
            error!("Write error: {}", e);
            format!("Write error: {}", e)
        })?;
        downloaded += chunk.len() as u64;

        let progress = (downloaded as f64 / total_size as f64) * 100.0;
        Emitter::emit_update_download_progress(progress, &app);
    }
    Ok(save_path)
}

fn extract_zip(zip_path: &str, extract_to: &str, app: &tauri::AppHandle) -> Result<String, String> {
    let file = std::fs::File::open(zip_path).map_err(|e| {
        error!("Failed to open zip file: {}", e);
        format!("Failed to open zip file: {}", e)
    })?;

    let mut archive = ZipArchive::new(file).map_err(|e| {
        error!("Invalid zip: {}", e);
        format!("Invalid zip: {}", e)
    })?;

    let mut deb_path = None;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| {
            error!("Read error: {}", e);
            format!("Read error: {}", e)
        })?;

        let out_path = Path::new(extract_to).join(file.name());

        if file.name().ends_with(".deb") {
            let mut outfile = std::fs::File::create(&out_path).map_err(|e| {
                error!("Create error: {}", e);
                format!("Create error: {}", e)
            })?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| {
                error!("Copy error: {}", e);
                format!("Copy error: {}", e)
            })?;
            deb_path = Some(out_path.to_string_lossy().to_string());
        }
    }

    match deb_path {
        Some(path) => {
            return Ok(path);
        }
        None => Err("No .deb file found in zip file".into()),
    }
}

fn install_deb(deb_path: &str, app: &tauri::AppHandle) -> Result<(), String> {
    let status = Command::new("pkexec")
        .arg("dpkg")
        .arg("-i")
        .arg(deb_path)
        .status()
        .map_err(|e| {
            error!("Failed to run dpkg: {}", e);
            format!("Failed to run dpkg: {}", e)
        })?;

    if status.success() {
        Ok(())
    } else {
        Err("dpkg failed".into())
    }
}
