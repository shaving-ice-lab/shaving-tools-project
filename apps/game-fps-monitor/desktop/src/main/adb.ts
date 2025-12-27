import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface AdbDevice {
  serial: string;
  state: string;
  model?: string;
}

export class AdbManager {
  private adbPath: string = 'adb';

  constructor(adbPath?: string) {
    if (adbPath) {
      this.adbPath = adbPath;
    }
  }

  async getDevices(): Promise<AdbDevice[]> {
    try {
      const { stdout } = await execAsync(`${this.adbPath} devices -l`);
      const lines = stdout.trim().split('\n').slice(1);
      
      return lines
        .filter((line) => line.trim())
        .map((line) => {
          const parts = line.split(/\s+/);
          const serial = parts[0];
          const state = parts[1];
          const modelMatch = line.match(/model:(\S+)/);
          
          return {
            serial,
            state,
            model: modelMatch ? modelMatch[1] : undefined,
          };
        })
        .filter((device) => device.state === 'device');
    } catch (error) {
      console.error('ADB设备检测失败:', error);
      return [];
    }
  }

  async forward(serial: string, localPort: number, remotePort: number): Promise<boolean> {
    try {
      await execAsync(
        `${this.adbPath} -s ${serial} forward tcp:${localPort} tcp:${remotePort}`
      );
      return true;
    } catch (error) {
      console.error('ADB端口转发失败:', error);
      return false;
    }
  }

  async removeForward(serial: string, localPort: number): Promise<boolean> {
    try {
      await execAsync(`${this.adbPath} -s ${serial} forward --remove tcp:${localPort}`);
      return true;
    } catch (error) {
      console.error('ADB端口转发移除失败:', error);
      return false;
    }
  }

  async getDeviceInfo(serial: string): Promise<Record<string, string>> {
    try {
      const { stdout } = await execAsync(
        `${this.adbPath} -s ${serial} shell getprop`
      );
      
      const info: Record<string, string> = {};
      const lines = stdout.split('\n');
      
      for (const line of lines) {
        const match = line.match(/\[(.+?)\]:\s*\[(.+?)\]/);
        if (match) {
          info[match[1]] = match[2];
        }
      }
      
      return info;
    } catch (error) {
      console.error('获取设备信息失败:', error);
      return {};
    }
  }

  async isAdbAvailable(): Promise<boolean> {
    try {
      await execAsync(`${this.adbPath} version`);
      return true;
    } catch {
      return false;
    }
  }
}
