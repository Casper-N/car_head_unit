use serde::{Deserialize, Serialize};

pub mod bluetooth;

#[derive(Serialize, Deserialize, Debug)]
pub enum BtState {
    Connected,
    Searching,
    On,
    Off,
}

#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct BtDevice {
    pub name: String,
    pub address: String,
    pub paired: bool,
    pub connected: bool,
    pub icon: String,
}

impl BtDevice {}
