use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectedDevice {
    pub id: String,
    pub name: String,
    pub model: String,
    pub soc_name: String,
    pub connection_type: ConnectionType,
    pub status: DeviceStatus,
    pub ip_address: Option<String>,
    pub port: Option<u16>,
    pub last_seen: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ConnectionType {
    Usb,
    Wifi,
    AdbForward,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DeviceStatus {
    Connected,
    Disconnected,
    Pairing,
    Syncing,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceMetrics {
    pub device_id: String,
    pub timestamp: u64,
    pub cpu: CpuMetrics,
    pub gpu: GpuMetrics,
    pub memory: MemoryMetrics,
    pub battery: BatteryMetrics,
    pub thermal: ThermalMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuMetrics {
    pub usage: f32,
    pub frequencies: Vec<u32>,
    pub temperature: f32,
    pub cores_online: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuMetrics {
    pub usage: f32,
    pub frequency: u32,
    pub temperature: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryMetrics {
    pub used_mb: u64,
    pub total_mb: u64,
    pub available_mb: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatteryMetrics {
    pub level: u8,
    pub temperature: f32,
    pub current_ma: i32,
    pub voltage_mv: u32,
    pub power_mw: f32,
    pub charging: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThermalMetrics {
    pub zones: HashMap<String, f32>,
    pub max_temp: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkResult {
    pub device_id: String,
    pub timestamp: u64,
    pub cpu_single: u32,
    pub cpu_multi: u32,
    pub gpu_score: u32,
    pub ai_score: u32,
    pub memory_bandwidth: u64,
    pub storage_read: u32,
    pub storage_write: u32,
    pub total_score: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StressTestResult {
    pub device_id: String,
    pub timestamp: u64,
    pub duration_seconds: u32,
    pub initial_score: u32,
    pub final_score: u32,
    pub score_retention: f32,
    pub max_temp: f32,
    pub throttling_detected: bool,
    pub throttling_time_seconds: Option<u32>,
    pub stability_score: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GamePerformanceResult {
    pub device_id: String,
    pub timestamp: u64,
    pub app_name: String,
    pub duration_seconds: u32,
    pub avg_fps: f32,
    pub min_fps: f32,
    pub max_fps: f32,
    pub fps_1_low: f32,
    pub fps_01_low: f32,
    pub jank_count: u32,
    pub frame_times: Vec<f32>,
    pub temp_curve: Vec<f32>,
}

pub struct DeviceManager {
    devices: HashMap<String, ConnectedDevice>,
}

impl DeviceManager {
    pub fn new() -> Self {
        Self {
            devices: HashMap::new(),
        }
    }

    pub fn add_device(&mut self, device: ConnectedDevice) {
        self.devices.insert(device.id.clone(), device);
    }

    pub fn remove_device(&mut self, device_id: &str) -> Option<ConnectedDevice> {
        self.devices.remove(device_id)
    }

    pub fn get_device(&self, device_id: &str) -> Option<&ConnectedDevice> {
        self.devices.get(device_id)
    }

    pub fn get_device_mut(&mut self, device_id: &str) -> Option<&mut ConnectedDevice> {
        self.devices.get_mut(device_id)
    }

    pub fn get_all_devices(&self) -> Vec<&ConnectedDevice> {
        self.devices.values().collect()
    }

    pub fn get_connected_devices(&self) -> Vec<&ConnectedDevice> {
        self.devices
            .values()
            .filter(|d| d.status == DeviceStatus::Connected)
            .collect()
    }

    pub fn update_device_status(&mut self, device_id: &str, status: DeviceStatus) {
        if let Some(device) = self.devices.get_mut(device_id) {
            device.status = status;
            device.last_seen = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs();
        }
    }
}

impl Default for DeviceManager {
    fn default() -> Self {
        Self::new()
    }
}
