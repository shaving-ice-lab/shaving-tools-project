use std::process::Command;
use crate::DeviceInfo;

pub async fn scan_devices() -> Result<Vec<DeviceInfo>, Box<dyn std::error::Error>> {
    let output = Command::new("adb")
        .args(["devices", "-l"])
        .output()?;

    let output_str = String::from_utf8_lossy(&output.stdout);
    let mut devices = Vec::new();

    for line in output_str.lines().skip(1) {
        if line.trim().is_empty() {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 2 && parts[1] == "device" {
            let device_id = parts[0].to_string();
            
            let model = get_device_property(&device_id, "ro.product.model").await
                .unwrap_or_else(|_| "Unknown".to_string());
            let brand = get_device_property(&device_id, "ro.product.brand").await
                .unwrap_or_else(|_| "Unknown".to_string());
            let soc = get_device_property(&device_id, "ro.board.platform").await
                .unwrap_or_else(|_| "Unknown".to_string());

            devices.push(DeviceInfo {
                id: device_id,
                name: format!("{} {}", brand, model),
                model,
                soc,
                connection_type: "usb".to_string(),
                status: "connected".to_string(),
            });
        }
    }

    Ok(devices)
}

async fn get_device_property(device_id: &str, prop: &str) -> Result<String, Box<dyn std::error::Error>> {
    let output = Command::new("adb")
        .args(["-s", device_id, "shell", "getprop", prop])
        .output()?;

    let value = String::from_utf8_lossy(&output.stdout).trim().to_string();
    Ok(value)
}

pub async fn forward_port(device_id: &str, local_port: u16, remote_port: u16) -> Result<(), Box<dyn std::error::Error>> {
    Command::new("adb")
        .args([
            "-s", device_id,
            "forward",
            &format!("tcp:{}", local_port),
            &format!("tcp:{}", remote_port)
        ])
        .output()?;
    
    Ok(())
}

pub async fn remove_forward(device_id: &str, local_port: u16) -> Result<(), Box<dyn std::error::Error>> {
    Command::new("adb")
        .args([
            "-s", device_id,
            "forward",
            "--remove",
            &format!("tcp:{}", local_port)
        ])
        .output()?;
    
    Ok(())
}

pub async fn push_file(device_id: &str, local_path: &str, remote_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    Command::new("adb")
        .args(["-s", device_id, "push", local_path, remote_path])
        .output()?;
    
    Ok(())
}

pub async fn pull_file(device_id: &str, remote_path: &str, local_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    Command::new("adb")
        .args(["-s", device_id, "pull", remote_path, local_path])
        .output()?;
    
    Ok(())
}
