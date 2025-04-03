use tauri_plugin_updater::UpdaterExt;
use tracing::debug;

use crate::{emitter::CustomEmitter as Emitter, notifications::NotificationPayload};

pub async fn check_for_updates(app: &tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(_update) = app.updater()?.check().await? {
        debug!("Checking for updates...");
        Emitter::emit_update_available(NotificationPayload::update_available(), app);
        debug!("Done checking for updates, result: {}", _update.raw_json);
    }
    Ok(())
}
