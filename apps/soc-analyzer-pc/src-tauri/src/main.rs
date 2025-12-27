#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::{Arc, Mutex};
use tauri::{Manager, State};
use tokio::sync::broadcast;

mod adb;
mod websocket;
mod device;

#[derive(Clone, serde::Serialize)]
struct DeviceInfo {
    id: String,
    name: String,
    model: String,
    soc: String,
    connection_type: String,
    status: String,
}

#[derive(Clone, serde::Serialize)]
struct RealtimeData {
    device_id: String,
    timestamp: u64,
    cpu_usage: f32,
    cpu_temp: f32,
    gpu_usage: f32,
    gpu_temp: f32,
    memory_used: u64,
    memory_total: u64,
    battery_temp: f32,
    power_mw: f32,
}

struct AppState {
    devices: Arc<Mutex<Vec<DeviceInfo>>>,
    data_sender: broadcast::Sender<RealtimeData>,
}

#[tauri::command]
fn get_connected_devices(state: State<AppState>) -> Vec<DeviceInfo> {
    let devices = state.devices.lock().unwrap();
    devices.clone()
}

#[tauri::command]
async fn scan_adb_devices(state: State<'_, AppState>) -> Result<Vec<DeviceInfo>, String> {
    let adb_devices = adb::scan_devices().await.map_err(|e| e.to_string())?;
    
    let mut devices = state.devices.lock().unwrap();
    for device in adb_devices {
        if !devices.iter().any(|d| d.id == device.id) {
            devices.push(device);
        }
    }
    
    Ok(devices.clone())
}

#[tauri::command]
async fn connect_device(device_id: String, state: State<'_, AppState>) -> Result<bool, String> {
    let mut devices = state.devices.lock().unwrap();
    
    if let Some(device) = devices.iter_mut().find(|d| d.id == device_id) {
        device.status = "connected".to_string();
        Ok(true)
    } else {
        Err("Device not found".to_string())
    }
}

#[tauri::command]
async fn disconnect_device(device_id: String, state: State<'_, AppState>) -> Result<bool, String> {
    let mut devices = state.devices.lock().unwrap();
    
    if let Some(device) = devices.iter_mut().find(|d| d.id == device_id) {
        device.status = "disconnected".to_string();
        Ok(true)
    } else {
        Err("Device not found".to_string())
    }
}

#[tauri::command]
fn get_local_ip() -> Result<String, String> {
    local_ip_address::local_ip()
        .map(|ip| ip.to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn start_websocket_server(port: u16) -> Result<String, String> {
    websocket::start_server(port).await.map_err(|e| e.to_string())
}

#[tauri::command]
fn generate_pairing_qrcode(ip: String, port: u16) -> Result<String, String> {
    let pairing_info = serde_json::json!({
        "type": "soc_analyzer_pair",
        "ip": ip,
        "port": port,
        "version": "1.0.0"
    });
    
    Ok(pairing_info.to_string())
}

fn main() {
    let (tx, _rx) = broadcast::channel::<RealtimeData>(100);
    
    let app_state = AppState {
        devices: Arc::new(Mutex::new(Vec::new())),
        data_sender: tx,
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_connected_devices,
            scan_adb_devices,
            connect_device,
            disconnect_device,
            get_local_ip,
            start_websocket_server,
            generate_pairing_qrcode
        ])
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            
            #[cfg(debug_assertions)]
            window.open_devtools();
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
