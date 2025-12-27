use std::net::SocketAddr;
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use futures_util::{StreamExt, SinkExt};

pub async fn start_server(port: u16) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = TcpListener::bind(&addr).await?;
    
    let local_addr = listener.local_addr()?;
    
    tokio::spawn(async move {
        while let Ok((stream, peer_addr)) = listener.accept().await {
            tokio::spawn(handle_connection(stream, peer_addr));
        }
    });

    Ok(format!("WebSocket server started on {}", local_addr))
}

async fn handle_connection(stream: tokio::net::TcpStream, peer_addr: SocketAddr) {
    println!("New connection from: {}", peer_addr);
    
    let ws_stream = match accept_async(stream).await {
        Ok(ws) => ws,
        Err(e) => {
            eprintln!("WebSocket handshake failed: {}", e);
            return;
        }
    };

    let (mut write, mut read) = ws_stream.split();

    let welcome_msg = serde_json::json!({
        "type": "welcome",
        "message": "Connected to SoC Analyzer Pro",
        "version": "1.0.0"
    });

    if let Err(e) = write.send(tokio_tungstenite::tungstenite::Message::Text(
        welcome_msg.to_string()
    )).await {
        eprintln!("Failed to send welcome message: {}", e);
        return;
    }

    while let Some(msg) = read.next().await {
        match msg {
            Ok(tokio_tungstenite::tungstenite::Message::Text(text)) => {
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(&text) {
                    handle_message(&mut write, json).await;
                }
            }
            Ok(tokio_tungstenite::tungstenite::Message::Binary(data)) => {
                println!("Received binary data: {} bytes", data.len());
            }
            Ok(tokio_tungstenite::tungstenite::Message::Close(_)) => {
                println!("Client {} disconnected", peer_addr);
                break;
            }
            Err(e) => {
                eprintln!("Error receiving message: {}", e);
                break;
            }
            _ => {}
        }
    }
}

async fn handle_message(
    write: &mut futures_util::stream::SplitSink<
        tokio_tungstenite::WebSocketStream<tokio::net::TcpStream>,
        tokio_tungstenite::tungstenite::Message
    >,
    json: serde_json::Value
) {
    let msg_type = json.get("type").and_then(|v| v.as_str()).unwrap_or("");

    let response = match msg_type {
        "handshake" => {
            serde_json::json!({
                "type": "handshake_ack",
                "status": "success",
                "server_version": "1.0.0"
            })
        }
        "realtime_monitor" => {
            println!("Received realtime data");
            serde_json::json!({
                "type": "ack",
                "received": true
            })
        }
        "benchmark_result" => {
            println!("Received benchmark result");
            serde_json::json!({
                "type": "ack",
                "received": true,
                "stored": true
            })
        }
        "soc_info" => {
            println!("Received SoC info");
            serde_json::json!({
                "type": "ack",
                "received": true
            })
        }
        _ => {
            serde_json::json!({
                "type": "unknown",
                "original_type": msg_type
            })
        }
    };

    if let Err(e) = write.send(tokio_tungstenite::tungstenite::Message::Text(
        response.to_string()
    )).await {
        eprintln!("Failed to send response: {}", e);
    }
}
