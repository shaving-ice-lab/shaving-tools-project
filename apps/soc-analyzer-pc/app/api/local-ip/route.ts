import { NextResponse } from 'next/server'
import os from 'os'

export async function GET() {
  const interfaces = os.networkInterfaces()
  let ipAddress = 'localhost'

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name]
    if (!iface) continue
    
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        ipAddress = alias.address
        break
      }
    }
  }

  return NextResponse.json({ ip: ipAddress })
}
