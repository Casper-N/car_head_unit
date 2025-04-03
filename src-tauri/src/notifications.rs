use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub enum NotificationLevel {
    Normal,
    Success,
    Warning,
    Danger,
}

impl ToString for NotificationLevel {
    fn to_string(&self) -> String {
        match self {
            NotificationLevel::Normal => String::from("normal"),
            NotificationLevel::Success => String::from("success"),
            NotificationLevel::Warning => String::from("warning"),
            NotificationLevel::Danger => String::from("danger"),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct NotificationPayload {
    pub title: String,
    pub text: String,
    pub level: NotificationLevel,
    pub context: String,
}

impl NotificationPayload {
    fn new(title: &str, text: &str, level: NotificationLevel, context: Option<String>) -> Self {
        Self {
            title: String::from(title),
            text: String::from(text),
            level,
            context: context.unwrap_or(String::from("").into()),
        }
    }

    pub fn normal(title: &str, text: &str, context: Option<String>) -> Self {
        Self::new(title, text, NotificationLevel::Normal, context)
    }

    pub fn success(title: &str, text: &str, context: Option<String>) -> Self {
        Self::new(title, text, NotificationLevel::Success, context)
    }

    pub fn warning(title: &str, text: &str, context: Option<String>) -> Self {
        Self::new(title, text, NotificationLevel::Warning, context)
    }

    pub fn danger(title: &str, text: &str, context: Option<String>) -> Self {
        Self::new(title, text, NotificationLevel::Danger, context)
    }

    // Premade bluetooth
    pub fn bluetooth_connected(address: &String) -> Self {
        Self::success(
            "Bluetooth: Connected",
            "Successfully connected to device!",
            Some(address.into()),
        )
    }

    pub fn bluetooth_disconnected(address: &String) -> Self {
        Self::normal(
            "Bluetooth: Disconnected",
            "Disconnected from device",
            Some(address.into()),
        )
    }

    pub fn bluetooth_device_error() -> Self {
        Self::danger(
            "Bluetooth: Invalid device",
            "Device has an invalid address",
            None,
        )
    }

    pub fn bluetooth_connect_error() -> Self {
        Self::danger(
            "Bluetooth: Failed to connect",
            "Failed to connect to device",
            None,
        )
    }

    pub fn bluetooth_disconnect_error() -> Self {
        Self::danger(
            "Bluetooth: Failed to disconnect",
            "Failed to disconnect from device, is the device already disconnected?",
            None,
        )
    }

    pub fn bluetooth_adapter_error() -> Self {
        Self::danger(
            "Bluetooth: Failed to initialize adapter",
            "Failed to initialize the bluetooth adapter, does the device have bluetooth?",
            None,
        )
    }

    pub fn bluetooth_start_discovery_error() -> Self {
        Self::danger(
            "Bluetooth: Failed to start discovery",
            "Failed to start the discovery service, does the device have bluetooth?",
            None,
        )
    }

    pub fn bluetooth_stop_discovery_error() -> Self {
        Self::danger(
            "Bluetooth: Failed to stop discovery",
            "Failed to stop the discovery service, does the device have bluetooth?",
            None,
        )
    }

    pub fn bluetooth_toggle_error() -> Self {
        Self::danger(
            "Bluetooth: Failed to toggle bluetooth",
            "Failed to toggle bluetooth on/off, does the device have bluetooth?",
            None,
        )
    }

    // Updates
    pub fn update_available() -> Self {
        Self::success(
            "Update is available",
            "An update is available. Go to Settings > Updates to update",
            None,
        )
    }
}
