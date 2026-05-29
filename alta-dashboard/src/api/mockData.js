const PROXY = import.meta.env.VITE_PROXY_URL || 'https://alta-proxy.onrender.com'

async function get(path) {
  const res = await fetch(`${PROXY}${path}`)
  if (!res.ok) throw new Error(`API fejl: ${res.status}`)
  return res.json()
}

export async function fetchCameras() {
  try {
    const data = await get('/api/cameras')
    const devices = Array.isArray(data) ? data : (data.devices || [])
    return devices.map(d => ({
      id: d.guid,
      name: d.name || 'Ukendt kamera',
      site: 'Elsec',
      status: d.live?.status === 'CONNECTED' ? 'online'
            : d.live?.display_status === 'AMBER' ? 'warning' : 'offline',
      uptime: d.live?.status === 'CONNECTED' ? 99 : 50,
      resolution: d.model || 'unknown',
      recording: d.live?.source_live?.[0]?.storing_info === 'smart_storing',
      lastSeen: d.live?.last_connected_status_update
        ? new Date(d.live.last_connected_status_update).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })
        : 'unknown',
      ip: d.remote_local_ip || 'unknown',
      analytics: d.remote_analytics_capable || false,
      lpr: d.capabilities?.licensePlateRecognition || false,
      model: d.model || 'unknown',
      firmware: d.firmware_version || 'unknown',
      manufacturer: d.manufacturer || 'unknown',
      serial: d.serial_number || 'unknown',
    }))
  } catch (e) {
    console.warn('Cameras fejl:', e.message)
    return generateCameras()
  }
}

export async function fetchAlarms() {
  try {
    const data = await get('/api/alarms')
    const alerts = Array.isArray(data) ? data : (data.alerts || data.items || [])
    return alerts.map(a => ({
      id: a.id || Math.random().toString(36),
      type: a.rule_name || a.ruleName || a.type || 'Alarm',
      severity: a.priority === 'critical' ? 'critical' : a.priority === 'high' ? 'high' : a.priority === 'medium' ? 'medium' : 'low',
      camera: a.camera_name || a.cameraName || a.device_name || 'unknown',
      site: a.site_name || a.siteName || 'Elsec',
      time: new Date(a.start_time || a.startTime || a.timestamp || Date.now()),
      acknowledged: a.acknowledged || false,
    }))
  } catch (e) {
    console.warn('Alarms fejl:', e.message)
    return generateAlarms()
  }
}

export function generateHourlyTraffic() {
  const hours = []
  for (let h = 0; h < 24; h++) {
    const base = h >= 7 && h <= 19 ? Math.floor(Math.random() * 90 + 30) : Math.floor(Math.random() * 15)
    hours.push({ hour: String(h).padStart(2, '0') + ':00', ind: base, ud: Math.floor(base * 0.8) })
  }
  return hours
}

export function generateWeeklyAlarms() {
  return ['Man','Tir','Ons','Tor','Fre','Lor','Son'].map(day => ({
    day, critical: Math.floor(Math.random()*5), high: Math.floor(Math.random()*15),
    medium: Math.floor(Math.random()*30), low: Math.floor(Math.random()*40)
  }))
}

export function generateLPRData() {
  return ['AB12345','CD67890','EF11223','GH44556','IJ77889','KL00112','MN33445'].map((plate,i) => ({
    plate, count: Math.floor(Math.random()*45+1), lastSeen: 'Parkering',
    known: i%3!==0, risk: i===3?'high':i===5?'medium':'none'
  }))
}

export function generateCameras() {
  return ['Kamera 1','Kamera 2','Kamera 3'].map((name,i) => ({
    id: 'cam-'+i, name, site: 'Elsec', status: 'online', uptime: 99,
    resolution: 'DOME-W-4K-30', recording: true, lastSeen: 'Nu',
    ip: '10.150.36.1'+i, analytics: true, lpr: false,
    model: 'DOME-W-4K-30', firmware: '8_2', manufacturer: 'Ava', serial: 'ABC'
  }))
}

export function generateAlarms() {
  const now = new Date()
  return Array.from({length:10}, (_,i) => ({
    id: 'alarm-'+i, type: 'Bevagelse', severity: 'medium',
    camera: 'Parkering', site: 'Elsec',
    time: new Date(now - i*30*60*1000), acknowledged: i>2
  }))
}

export function generateSystemStats() {
  return {
    cameras: { total:10, online:9, warning:1, offline:0 },
    alarms: { today:5, unacknowledged:2, critical:0 },
    recording: { activeStreams:9, storageUsed:68, storageGB:'cloud' },
    analytics: { eventsToday:0, anomalies:0, lprHits:0 },
  }
}

export function generateSiteHealth() {
  return [{ site: 'Elsec', cameras:10, online:9, alarms:2 }]
}