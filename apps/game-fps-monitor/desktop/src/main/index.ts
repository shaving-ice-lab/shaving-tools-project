import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { WebSocketServer } from './websocket';
import { Database } from './database';
import { AdbManager } from './adb';

let mainWindow: BrowserWindow | null = null;
let wsServer: WebSocketServer | null = null;
let database: Database | null = null;
let adbManager: AdbManager | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    frame: true,
    backgroundColor: '#11111b',
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function initServices() {
  // 初始化数据库
  const dbPath = path.join(app.getPath('userData'), 'fps_monitor.db');
  database = new Database(dbPath);

  // 初始化WebSocket服务器
  wsServer = new WebSocketServer(8765, database);
  wsServer.on('data', (data) => {
    mainWindow?.webContents.send('performance-data', data);
  });
  wsServer.on('device-connected', (deviceId) => {
    mainWindow?.webContents.send('device-connected', deviceId);
  });
  wsServer.on('device-disconnected', (deviceId) => {
    mainWindow?.webContents.send('device-disconnected', deviceId);
  });

  // 初始化ADB管理器
  adbManager = new AdbManager();

  // 启动服务
  wsServer.start();
}

// IPC处理
function setupIPC() {
  // 获取连接设备列表
  ipcMain.handle('get-connected-devices', () => {
    return wsServer?.getConnectedDevices() || [];
  });

  // 获取会话列表
  ipcMain.handle('get-sessions', async (_, limit?: number) => {
    return database?.getSessions(limit) || [];
  });

  // 获取会话详情
  ipcMain.handle('get-session', async (_, sessionId: string) => {
    return database?.getSession(sessionId) || null;
  });

  // 获取会话帧数据
  ipcMain.handle('get-session-frames', async (_, sessionId: string) => {
    return database?.getSessionFrames(sessionId) || [];
  });

  // 删除会话
  ipcMain.handle('delete-session', async (_, sessionId: string) => {
    return database?.deleteSession(sessionId);
  });

  // 导出会话数据
  ipcMain.handle('export-session', async (_, sessionId: string, format: string) => {
    const session = database?.getSession(sessionId);
    const frames = database?.getSessionFrames(sessionId);
    return { session, frames };
  });

  // ADB设备检测
  ipcMain.handle('get-adb-devices', async () => {
    return adbManager?.getDevices() || [];
  });

  // ADB端口转发
  ipcMain.handle('adb-forward', async (_, serial: string, localPort: number, remotePort: number) => {
    return adbManager?.forward(serial, localPort, remotePort);
  });

  // 获取服务器状态
  ipcMain.handle('get-server-status', () => {
    return {
      wsRunning: wsServer?.isRunning() || false,
      wsPort: 8765,
      connectedDevices: wsServer?.getConnectedDevices().length || 0,
    };
  });
}

app.whenReady().then(async () => {
  await initServices();
  setupIPC();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  wsServer?.stop();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  wsServer?.stop();
});
