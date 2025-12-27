import Database from 'better-sqlite3';

export interface Session {
  id: string;
  deviceId: string;
  gameName: string;
  startTime: number;
  endTime?: number;
}

export interface FrameRecord {
  id?: number;
  sessionId: string;
  timestamp: number;
  fps: number;
  frameTime: number;
  jank: number;
}

export interface SnapshotRecord {
  id?: number;
  sessionId: string;
  timestamp: number;
  fps: number;
  avgFps: number;
  minFps: number;
  maxFps: number;
  cpuUsage: number;
  gpuUsage: number;
  memoryUsage: number;
  temperature: number;
  power: number;
  jankCount: number;
  jankRate: number;
}

export class Database {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    // 创建会话表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        deviceId TEXT NOT NULL,
        gameName TEXT NOT NULL,
        startTime INTEGER NOT NULL,
        endTime INTEGER,
        createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);

    // 创建帧记录表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS frames (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sessionId TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        fps REAL NOT NULL,
        frameTime REAL NOT NULL,
        jank INTEGER DEFAULT 0,
        FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE
      )
    `);

    // 创建快照表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sessionId TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        fps REAL NOT NULL,
        avgFps REAL NOT NULL,
        minFps REAL NOT NULL,
        maxFps REAL NOT NULL,
        cpuUsage REAL NOT NULL,
        gpuUsage REAL NOT NULL,
        memoryUsage REAL NOT NULL,
        temperature REAL NOT NULL,
        power REAL NOT NULL,
        jankCount INTEGER NOT NULL,
        jankRate REAL NOT NULL,
        FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE
      )
    `);

    // 创建索引
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_frames_session ON frames(sessionId);
      CREATE INDEX IF NOT EXISTS idx_snapshots_session ON snapshots(sessionId);
      CREATE INDEX IF NOT EXISTS idx_sessions_device ON sessions(deviceId);
    `);
  }

  // 会话操作
  createSession(session: Omit<Session, 'endTime'>) {
    const stmt = this.db.prepare(`
      INSERT INTO sessions (id, deviceId, gameName, startTime)
      VALUES (@id, @deviceId, @gameName, @startTime)
    `);
    return stmt.run(session);
  }

  endSession(sessionId: string, endTime: number) {
    const stmt = this.db.prepare(`
      UPDATE sessions SET endTime = ? WHERE id = ?
    `);
    return stmt.run(endTime, sessionId);
  }

  getSession(sessionId: string): Session | undefined {
    const stmt = this.db.prepare(`SELECT * FROM sessions WHERE id = ?`);
    return stmt.get(sessionId) as Session | undefined;
  }

  getSessions(limit: number = 50): Session[] {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions ORDER BY startTime DESC LIMIT ?
    `);
    return stmt.all(limit) as Session[];
  }

  deleteSession(sessionId: string) {
    const stmt = this.db.prepare(`DELETE FROM sessions WHERE id = ?`);
    return stmt.run(sessionId);
  }

  // 帧数据操作
  addFrame(frame: Omit<FrameRecord, 'id'>) {
    const stmt = this.db.prepare(`
      INSERT INTO frames (sessionId, timestamp, fps, frameTime, jank)
      VALUES (@sessionId, @timestamp, @fps, @frameTime, @jank)
    `);
    return stmt.run(frame);
  }

  getSessionFrames(sessionId: string): FrameRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM frames WHERE sessionId = ? ORDER BY timestamp ASC
    `);
    return stmt.all(sessionId) as FrameRecord[];
  }

  // 快照操作
  addSnapshot(snapshot: Omit<SnapshotRecord, 'id'>) {
    const stmt = this.db.prepare(`
      INSERT INTO snapshots (sessionId, timestamp, fps, avgFps, minFps, maxFps, 
        cpuUsage, gpuUsage, memoryUsage, temperature, power, jankCount, jankRate)
      VALUES (@sessionId, @timestamp, @fps, @avgFps, @minFps, @maxFps,
        @cpuUsage, @gpuUsage, @memoryUsage, @temperature, @power, @jankCount, @jankRate)
    `);
    return stmt.run(snapshot);
  }

  getSessionSnapshots(sessionId: string): SnapshotRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM snapshots WHERE sessionId = ? ORDER BY timestamp ASC
    `);
    return stmt.all(sessionId) as SnapshotRecord[];
  }

  // 统计
  getSessionStats(sessionId: string) {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as frameCount,
        AVG(fps) as avgFps,
        MIN(fps) as minFps,
        MAX(fps) as maxFps,
        SUM(jank) as jankCount,
        AVG(frameTime) as avgFrameTime
      FROM frames WHERE sessionId = ?
    `);
    return stmt.get(sessionId);
  }

  close() {
    this.db.close();
  }
}

export { Database };
