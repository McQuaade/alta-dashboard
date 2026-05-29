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
      site: d.device_group_id || 'Elsec',
      status: d.live?.status === 'CONNECTED' ? 'online'
            : d.live?.display_status === 'AMBER' ? 'warning' : 'offline',
      uptime: d.live?.status === 'CONNECTED' ? 99 : 50,
      resolution: d.model || '—',
      recording: d.live?.source_live?.[0]?.storing_info === 'smart_storing',
      lastSeen: d.live?.last_connected_status_update
        ? new Date(d.live.last_connected_status_update).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })
        : '—',
      ip: d.remote_local_ip || '—',
      analytics: d.remote_analytics_capable || false,
      lpr: d.capabilities?.licensePlateRecognition || false,
      model: d.model || '—',
      firmware: d.firmware_version || '—',
      manufacturer: d.manufacturer || '—',
      serial: d.serial_number || '—',
    }))
  } catch (e) {
    console.warn('Cameras fejl, bruger mock:', e.message)
    return generateCameras()
  }
}

export async function fetchAlarms() {
  try {
    const data = await get('/api/alarms')
    const alerts = Array.isArray(data) ? data : (data.alerts || data.items || [])
    return alerts.map(a => ({
      id: a.id || a._id || Math.random().toString(36),
      type: a.rule_name || a.ruleName || a.type || 'Alarm',
      severity: a.priority === 'critical' ? 'critical'
              : a.priority === 'high' ? 'high'
              : a.priority === 'medium' ? 'medium' : 'low',
      camera: a.camera_name || a.cameraName || a.device_name || '—',
      site: a.site_name || a.siteName || '—',
      time: new Date(a.start_time || a.startTime || a.timestamp || Date.now()),
      acknowledged: a.acknowledged || false,
    }))
  } catch (e) {
    console.warn('Alarms fejl, bruger mock:', e.message)
    return generateAlarms()
  }
}

export function generateHourlyTraffic() {
  const hours = []
  for (let h = 0; h < 24; h++) {
    const base = h >= 7 && h <= 19 ? Math.floor(Math.random() * 90 + 30) : Math.floor(Math.random() * 15)
    hours.push({ hour: `${String(h).padStart(2, '0')}:00`, ind: base, ud: Math.floor(base * 0.8) })
  }
  return hours
}

export function generateWeeklyAlarms() {
  return ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map(day => ({
    day,
    critical: Math.floor(Math.random() * 5),
    high: Math.floor(Math.random() * 15),
    medium: Math.floor(Math.random() * 30),
    low: Math.floor(Math.random() * 40),
  }))
}

export function generateLPRData() {
  const names = ['Indgang A', 'Parkering Øst', 'Serverrum', 'Reception', 'Kantine', 'Lager Zone 1', 'Udgang B']
  return ['AB12345', 'CD67890', 'EF11223', 'GH44556', 'IJ77889', 'KL00112', 'MN33445'].map((plate, i) => ({
    plate,
    count: Math.floor(Math.random() * 45 + 1),
    lastSeen: names[i % names.length],
    known: i % 3 !== 0,
    risk: i === 3 ? 'high' : i === 5 ? 'medium' : 'none',
  }))
}

export function generateCameras() {
  const names = ['Indgang A', 'Parkering Øst', 'Serverrum', 'Reception', 'Kantine', 'Lager Zone 1', 'Udgang B', 'Elevator Lobby', 'Tagterrasse', 'Vareindlevering']
  return names.map((name, i) => ({
    id: `cam-${i + 1}`,
    name,
    site: 'Elsec',
    status: i < 8 ? 'online' : i === 8 ? 'warning' : 'offline',
    uptime: i < 8 ? 99 : 65,
    resolution: ['DOME-W-4K-30', 'DOME-B-5MP-30', 'COMPACTDOME-W-5MP-30'][i % 3],
    recording: true,
    lastSeen: 'Nu',
    ip: `10.150.36.${10 + i}`,
    analytics: true,
    lpr: i % 3 === 0,
    model: 'DOME-W-4K-30',
    firmware: '8_2_260505_05050',
    manufacturer: 'Ava',
    serial: `ABCD-${i}`,
  }))
}

export function generateAlarms() {
  const types = ['Bevægelse detekteret', 'Linjeovergang', 'Uautoriseret adgang', 'Kamera offline', 'Anomali', 'LPR match']
  const severities = ['critical', 'high', 'medium', 'low']
  const now = new Date()
  return Array.from({ length: 48 }, (_, i) => ({
    id: `alarm-${i}`,
    type: types[i % types.length],
    severity: severities[Math.abs(Math.floor(Math.sin(i * 7) * 2)) % 4],
    camera: 'Parkering gård',
    site: 'Elsec',
    time: new Date(now - i * 30 * 60 * 1000),
    acknowledged: i > 3,
  }))
}

export function generateSystemStats() {
  return {
    cameras: { total: 10, online: 9, warning: 1, offline: 0 },
    alarms: { today: 5, unacknowledged: 2, critical: 0 },
    recording: { activeStreams: 9, storageUsed: 68, storageGB: '—' },
    analytics: { eventsToday: 0, anomalies: 0, lprHits: 0 },
  }
}

export function generateSiteHealth() {
  return [{ site: 'Elsec', cameras: 10, online: 9, alarms: 2 }]
}