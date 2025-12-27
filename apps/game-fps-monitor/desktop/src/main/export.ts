import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

interface FrameRecord {
  id: number;
  sessionId: number;
  timestamp: number;
  fps: number;
  frameTime: number;
  cpuUsage: number;
  gpuUsage: number;
  memoryUsage: number;
  temperature: number;
  power: number;
  isJank: boolean;
}

interface SessionData {
  id: number;
  deviceId: string;
  gameName: string;
  startTime: number;
  endTime: number | null;
}

interface ReportData {
  session: SessionData;
  stats: {
    avgFps: number;
    minFps: number;
    maxFps: number;
    jankCount: number;
    jankRate: number;
    avgCpu: number;
    avgMemory: number;
    avgTemp: number;
    totalFrames: number;
    duration: number;
  };
  frameRecords: FrameRecord[];
}

export function exportToCSV(data: ReportData, outputPath: string): boolean {
  try {
    const headers = [
      'Timestamp',
      'FPS',
      'Frame Time (ms)',
      'CPU Usage (%)',
      'GPU Usage (%)',
      'Memory (MB)',
      'Temperature (°C)',
      'Power (mW)',
      'Is Jank'
    ];

    const rows = data.frameRecords.map(r => [
      new Date(r.timestamp).toISOString(),
      r.fps.toFixed(2),
      r.frameTime.toFixed(2),
      r.cpuUsage.toFixed(2),
      r.gpuUsage.toFixed(2),
      r.memoryUsage.toFixed(2),
      r.temperature.toFixed(2),
      r.power.toFixed(2),
      r.isJank ? 'Yes' : 'No'
    ]);

    const csvContent = [
      `# FPS Monitor Report`,
      `# Session: ${data.session.gameName || 'Unknown'}`,
      `# Device: ${data.session.deviceId}`,
      `# Start: ${new Date(data.session.startTime).toISOString()}`,
      `# Duration: ${formatDuration(data.stats.duration)}`,
      `# Average FPS: ${data.stats.avgFps.toFixed(2)}`,
      `# Min FPS: ${data.stats.minFps.toFixed(2)}`,
      `# Max FPS: ${data.stats.maxFps.toFixed(2)}`,
      `# Jank Rate: ${data.stats.jankRate.toFixed(2)}%`,
      '',
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    fs.writeFileSync(outputPath, csvContent, 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to export CSV:', error);
    return false;
  }
}

export function exportToExcel(data: ReportData, outputPath: string): boolean {
  try {
    // Simple Excel XML format (SpreadsheetML)
    const xmlContent = generateExcelXML(data);
    fs.writeFileSync(outputPath, xmlContent, 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to export Excel:', error);
    return false;
  }
}

function generateExcelXML(data: ReportData): string {
  const rows = data.frameRecords.map(r => `
    <Row>
      <Cell><Data ss:Type="String">${new Date(r.timestamp).toISOString()}</Data></Cell>
      <Cell><Data ss:Type="Number">${r.fps.toFixed(2)}</Data></Cell>
      <Cell><Data ss:Type="Number">${r.frameTime.toFixed(2)}</Data></Cell>
      <Cell><Data ss:Type="Number">${r.cpuUsage.toFixed(2)}</Data></Cell>
      <Cell><Data ss:Type="Number">${r.gpuUsage.toFixed(2)}</Data></Cell>
      <Cell><Data ss:Type="Number">${r.memoryUsage.toFixed(2)}</Data></Cell>
      <Cell><Data ss:Type="Number">${r.temperature.toFixed(2)}</Data></Cell>
      <Cell><Data ss:Type="Number">${r.power.toFixed(2)}</Data></Cell>
      <Cell><Data ss:Type="String">${r.isJank ? 'Yes' : 'No'}</Data></Cell>
    </Row>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#CCCCCC" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Title">
      <Font ss:Bold="1" ss:Size="14"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Summary">
    <Table>
      <Row>
        <Cell ss:StyleID="Title"><Data ss:Type="String">FPS Monitor Report</Data></Cell>
      </Row>
      <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
      <Row>
        <Cell><Data ss:Type="String">Session</Data></Cell>
        <Cell><Data ss:Type="String">${data.session.gameName || 'Unknown'}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Device</Data></Cell>
        <Cell><Data ss:Type="String">${data.session.deviceId}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Start Time</Data></Cell>
        <Cell><Data ss:Type="String">${new Date(data.session.startTime).toISOString()}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Duration</Data></Cell>
        <Cell><Data ss:Type="String">${formatDuration(data.stats.duration)}</Data></Cell>
      </Row>
      <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
      <Row>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Metric</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Value</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Average FPS</Data></Cell>
        <Cell><Data ss:Type="Number">${data.stats.avgFps.toFixed(2)}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Min FPS</Data></Cell>
        <Cell><Data ss:Type="Number">${data.stats.minFps.toFixed(2)}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Max FPS</Data></Cell>
        <Cell><Data ss:Type="Number">${data.stats.maxFps.toFixed(2)}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Total Frames</Data></Cell>
        <Cell><Data ss:Type="Number">${data.stats.totalFrames}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Jank Count</Data></Cell>
        <Cell><Data ss:Type="Number">${data.stats.jankCount}</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Jank Rate</Data></Cell>
        <Cell><Data ss:Type="String">${data.stats.jankRate.toFixed(2)}%</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Avg CPU Usage</Data></Cell>
        <Cell><Data ss:Type="String">${data.stats.avgCpu.toFixed(2)}%</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Avg Memory</Data></Cell>
        <Cell><Data ss:Type="String">${data.stats.avgMemory.toFixed(2)} MB</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Avg Temperature</Data></Cell>
        <Cell><Data ss:Type="String">${data.stats.avgTemp.toFixed(2)} °C</Data></Cell>
      </Row>
    </Table>
  </Worksheet>
  <Worksheet ss:Name="Frame Data">
    <Table>
      <Row>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Timestamp</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">FPS</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Frame Time (ms)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">CPU Usage (%)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">GPU Usage (%)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Memory (MB)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Temperature (°C)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Power (mW)</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Is Jank</Data></Cell>
      </Row>
      ${rows}
    </Table>
  </Worksheet>
</Workbook>`;
}

export function generateHTMLReport(data: ReportData): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FPS Performance Report - ${data.session.gameName || 'Unknown'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #eee; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { font-size: 2em; margin-bottom: 10px; }
    .header .meta { color: #888; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
    .stat-card { background: #16213e; border-radius: 12px; padding: 20px; text-align: center; }
    .stat-card .label { color: #888; font-size: 0.9em; margin-bottom: 5px; }
    .stat-card .value { font-size: 2em; font-weight: bold; }
    .stat-card .value.green { color: #00ff88; }
    .stat-card .value.red { color: #ff4444; }
    .stat-card .value.yellow { color: #ffcc00; }
    .stat-card .value.blue { color: #4488ff; }
    .section { background: #16213e; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    .section h2 { margin-bottom: 15px; font-size: 1.2em; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #2a2a4a; }
    th { color: #888; font-weight: normal; }
    .jank-yes { color: #ff4444; }
    .jank-no { color: #00ff88; }
    .footer { text-align: center; color: #666; margin-top: 40px; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FPS Performance Report</h1>
      <div class="meta">
        <p>${data.session.gameName || 'Unknown Game'} | ${data.session.deviceId}</p>
        <p>${new Date(data.session.startTime).toLocaleString()} | Duration: ${formatDuration(data.stats.duration)}</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="label">Average FPS</div>
        <div class="value green">${data.stats.avgFps.toFixed(1)}</div>
      </div>
      <div class="stat-card">
        <div class="label">Min FPS</div>
        <div class="value red">${data.stats.minFps.toFixed(1)}</div>
      </div>
      <div class="stat-card">
        <div class="label">Max FPS</div>
        <div class="value blue">${data.stats.maxFps.toFixed(1)}</div>
      </div>
      <div class="stat-card">
        <div class="label">Jank Rate</div>
        <div class="value yellow">${data.stats.jankRate.toFixed(1)}%</div>
      </div>
      <div class="stat-card">
        <div class="label">Total Frames</div>
        <div class="value">${data.stats.totalFrames}</div>
      </div>
      <div class="stat-card">
        <div class="label">Jank Count</div>
        <div class="value">${data.stats.jankCount}</div>
      </div>
      <div class="stat-card">
        <div class="label">Avg CPU</div>
        <div class="value">${data.stats.avgCpu.toFixed(1)}%</div>
      </div>
      <div class="stat-card">
        <div class="label">Avg Temp</div>
        <div class="value">${data.stats.avgTemp.toFixed(1)}°C</div>
      </div>
    </div>

    <div class="section">
      <h2>Frame Data (Last 100)</h2>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>FPS</th>
            <th>Frame Time</th>
            <th>CPU</th>
            <th>Memory</th>
            <th>Temp</th>
            <th>Jank</th>
          </tr>
        </thead>
        <tbody>
          ${data.frameRecords.slice(-100).map(r => `
          <tr>
            <td>${new Date(r.timestamp).toLocaleTimeString()}</td>
            <td>${r.fps.toFixed(1)}</td>
            <td>${r.frameTime.toFixed(1)}ms</td>
            <td>${r.cpuUsage.toFixed(1)}%</td>
            <td>${r.memoryUsage.toFixed(0)}MB</td>
            <td>${r.temperature.toFixed(1)}°C</td>
            <td class="${r.isJank ? 'jank-yes' : 'jank-no'}">${r.isJank ? 'Yes' : 'No'}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>Generated by FPS Monitor | ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}
