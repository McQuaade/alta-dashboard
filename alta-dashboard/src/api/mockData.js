const PROXY = import.meta.env.VITE_PROXY_URL || 'https://alta-proxy.onrender.com'
 
async function get(path) {
  const res = await fetch(`${PROXY}${path}`)
  if (!res.ok) throw new Error(`API fejl: ${res.status}`)
  return res.json()
}
 
export async function fetchCameras() {
  try {
    const data = await get('/api/cameras')
    const devices = data.devices || data || []
    return devices.map(d => ({
      id: d.id || d._id,
      name: d.name || d.displayName || 'Ukendt kamera',
      site: d.siteName || d.location || 'Ukendt site',
      status: d.connectionStatus === 'connected' ? 'online' : d.connectionStatus === 'warning' ? 'warning' : 'offline',
      uptime: d.connectionStatus === 'connected' ? 99 : 50,
      resolution: d.resolution || d.videoMode || '1080p',
      recording: d.recording !== false,
      lastSeen: d.lastSeen || 'Ukendt',
      ip: d.ipAddress || d.ip || '—',
      analytics: d.analyticsEnabled || false,
    }))
  } catch (e) {
    console.warn('Cameras fejl, bruger mock:', e.message)
    return generateCameras()
  }
}
 
export async function fetchAlarms() {
  try {
    const data = await get('/api/alarms')
    const alerts = data.alerts || data || []
    return alerts.map(a => ({
      id: a.id || a._id,
      type: a.ruleName || a.type || 'Alarm',
      severity: a.priority === 'critical' ? 'critical' : a.priority === 'high' ? 'high' : a.priority === 'medium' ? 'medium' : 'low',
      camera: a.cameraName || a.deviceName || 'Ukendt',
      site: a.siteName || '—',
      time: new Date(a.startTime || a.timestamp || Date.now()),
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
  const names = ['Indgang A', 'Parkering Øst', 'Serverrum', 'Reception', 'Kantine', 'Lager Zone 1', 'Udgang B', 'Elevator Lobby', 'Tagterrasse', 'Vareindlevering', 'Kontorgang 2', 'Møderum 3', 'Parkeringsanlæg', 'Indkørsel', 'Varehus']
  const sites = ['Hovedkontor', 'Lager Nord', 'Butik City', 'Datacenter']
  return names.map((name, i) => ({
    id: `cam-${i + 1}`,
    name,
    site: sites[i % sites.length],
    status: i < 12 ? 'online' : i === 12 ? 'warning' : 'offline',
    uptime: i < 12 ? 98 : 65,
    resolution: ['4K', '1080p', '4MP', '8MP'][i % 4],
    recording: i !== 14,
    lastSeen: i < 12 ? 'Nu' : '47 min siden',
    ip: `192.168.1.${10 + i}`,
    analytics: i % 3 === 0,
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
    camera: 'Indgang A',
    site: 'Hovedkontor',
    time: new Date(now - i * 30 * 60 * 1000),
    acknowledged: i > 3,
  }))
}
 
export function generateSystemStats() {
  return {
    cameras: { total: 15, online: 12, warning: 1, offline: 2 },
    alarms: { today: 23, unacknowledged: 4, critical: 2 },
    recording: { activeStreams: 12, storageUsed: 68, storageGB: '4.2 TB' },
    analytics: { eventsToday: 847, anomalies: 3, lprHits: 34 },
  }
}
 
export function generateSiteHealth() {
  return ['Hovedkontor', 'Lager Nord', 'Butik City', 'Datacenter'].map((site, i) => ({
    site,
    cameras: [4, 3, 5, 3][i],
    online: [4, 2, 5, 3][i],
    alarms: [2, 7, 1, 0][i],
  }))
}