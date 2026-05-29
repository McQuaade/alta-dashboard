// Mock data simulating Avigilon Alta API responses
// Replace these functions with real API calls to https://<server>/api/v1/

export const API_BASE = import.meta.env.VITE_API_BASE || 'https://your-alta-server/api/v1'

// --- MOCK DATA ---

const SITES = ['Hovedkontor', 'Lager Nord', 'Butik City', 'Datacenter']
const CAMERA_NAMES = [
  'Indgang A', 'Parkering Øst', 'Serverrum', 'Reception', 'Kantine',
  'Lager Zone 1', 'Udgang B', 'Elevator Lobby', 'Tagterrasse', 'Vareindlevering',
  'Kontorgang 2', 'Møderum 3', 'Parkeringsanlæg', 'Indkørsel', 'Varehus'
]

function randomBetween(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function generateCameras() {
  return CAMERA_NAMES.map((name, i) => ({
    id: `cam-${i + 1}`,
    name,
    site: SITES[i % SITES.length],
    status: i < 12 ? 'online' : i === 12 ? 'warning' : 'offline',
    uptime: i < 12 ? randomBetween(95, 100) : randomBetween(60, 80),
    resolution: ['4K', '1080p', '4MP', '8MP'][i % 4],
    recording: i !== 14,
    lastSeen: i < 12 ? 'Nu' : i === 12 ? '2 min siden' : '47 min siden',
    ip: `192.168.${randomBetween(1, 5)}.${randomBetween(10, 250)}`,
    analytics: i % 3 === 0,
  }))
}

export function generateAlarms() {
  const types = ['Bevægelse detekteret', 'Linjeovergang', 'Uautoriseret adgang', 'Kamera offline', 'Anomali', 'LPR match']
  const severities = ['critical', 'high', 'medium', 'low']
  const alarms = []
  const now = new Date()
  for (let i = 0; i < 48; i++) {
    const t = new Date(now - i * randomBetween(10, 90) * 60 * 1000)
    alarms.push({
      id: `alarm-${i}`,
      type: types[i % types.length],
      severity: severities[Math.floor(seededRandom(i * 7) * 4)],
      camera: CAMERA_NAMES[i % CAMERA_NAMES.length],
      site: SITES[i % SITES.length],
      time: t,
      acknowledged: i > 3,
    })
  }
  return alarms
}

export function generateHourlyTraffic() {
  const hours = []
  for (let h = 0; h < 24; h++) {
    const base = h >= 7 && h <= 19 ? randomBetween(30, 120) : randomBetween(0, 15)
    hours.push({
      hour: `${String(h).padStart(2, '0')}:00`,
      ind: base,
      ud: Math.floor(base * seededRandom(h + 1) * 0.9),
    })
  }
  return hours
}

export function generateWeeklyAlarms() {
  const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']
  return days.map((day, i) => ({
    day,
    critical: randomBetween(0, 5),
    high: randomBetween(2, 15),
    medium: randomBetween(5, 30),
    low: randomBetween(10, 40),
  }))
}

export function generateLPRData() {
  const plates = ['AB12345', 'CD67890', 'EF11223', 'GH44556', 'IJ77889', 'KL00112', 'MN33445']
  return plates.map((plate, i) => ({
    plate,
    count: randomBetween(1, 45),
    lastSeen: CAMERA_NAMES[i % CAMERA_NAMES.length],
    known: i % 3 !== 0,
    risk: i === 3 ? 'high' : i === 5 ? 'medium' : 'none',
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
  return SITES.map((site, i) => ({
    site,
    cameras: [4, 3, 5, 3][i],
    online: [4, 2, 5, 3][i],
    alarms: [2, 7, 1, 0][i],
    lat: [55.67, 55.73, 55.68, 55.71][i],
    lng: [12.56, 12.52, 12.58, 12.54][i],
  }))
}
