import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'

const TYPES = [
  { label: 'Bevægelse detekteret', color: 'var(--amber)', sev: 'medium' },
  { label: 'Linjeovergang — Zone A', color: 'var(--accent)', sev: 'low' },
  { label: 'Ukendt nummerplade', color: 'var(--amber)', sev: 'medium' },
  { label: 'Kritisk alarm', color: 'var(--red)', sev: 'critical' },
  { label: 'Kamera online', color: 'var(--green)', sev: 'info' },
  { label: 'Anomali detekteret', color: 'var(--purple)', sev: 'high' },
  { label: 'Adgangskontrol event', color: 'var(--accent2)', sev: 'low' },
  { label: 'Optagelse startet', color: 'var(--green)', sev: 'info' },
]
const CAMS = ['Indgang A', 'Parkering Øst', 'Reception', 'Lager Zone 1', 'Indkørsel', 'Tagterrasse']

function makeEvent() {
  const type = TYPES[Math.floor(Math.random() * TYPES.length)]
  const cam = CAMS[Math.floor(Math.random() * CAMS.length)]
  return { id: Math.random().toString(36).slice(2), type, cam, time: new Date() }
}

export default function LiveFeedPage() {
  const [events, setEvents] = useState(() => Array.from({ length: 12 }, makeEvent))
  const [running, setRunning] = useState(true)
  const [stats, setStats] = useState({ total: 12, critical: 0, perMin: 0 })
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return }
    let count = 0
    intervalRef.current = setInterval(() => {
      const e = makeEvent()
      count++
      setEvents(prev => [e, ...prev].slice(0, 60))
      setStats(s => ({
        total: s.total + 1,
        critical: s.critical + (e.type.sev === 'critical' ? 1 : 0),
        perMin: count
      }))
    }, 2000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Live Event Feed</div>
            <div className="page-sub mono">
              Simuleret webhook-stream · opdateres hvert 2s
            </div>
          </div>
          <div className="flex-gap">
            {running && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--green)' }}>
              <span className="conn-dot" />Live
            </span>}
            <button className={`btn${running ? '' : ' btn-accent'}`} onClick={() => setRunning(r => !r)}>
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <div className="panel" style={{ padding: '14px 18px' }}>
          <div className="mono text3" style={{ fontSize: 10, marginBottom: 6 }}>EVENTS I SESSION</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>{stats.total}</div>
        </div>
        <div className="panel" style={{ padding: '14px 18px' }}>
          <div className="mono text3" style={{ fontSize: 10, marginBottom: 6 }}>KRITISKE</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--red)' }}>{stats.critical}</div>
        </div>
        <div className="panel" style={{ padding: '14px 18px' }}>
          <div className="mono text3" style={{ fontSize: 10, marginBottom: 6 }}>SENESTE MINUT</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--amber)' }}>{stats.perMin}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Event stream</span>
          <span className="mono text3" style={{ fontSize: 11 }}>
            {events.length} events · webhook payload
          </span>
        </div>
        <div style={{ maxHeight: 560, overflowY: 'auto' }}>
          {events.map((e, i) => (
            <div key={e.id} className="live-event" style={{ opacity: Math.max(0.4, 1 - i * 0.012) }}>
              <div className="live-dot" style={{ background: e.type.color }} />
              <div style={{ flex: 1 }}>
                <div className="live-text">
                  <span style={{ color: e.type.color, fontWeight: 500 }}>{e.type.label}</span>
                  {' · '}
                  <span className="live-cam">{e.cam}</span>
                </div>
                <div className="live-time">{format(e.time, 'HH:mm:ss')}</div>
              </div>
              <span className={`badge badge-${e.type.sev === 'info' ? 'online' : e.type.sev}`} style={{ fontSize: 10 }}>
                {e.type.sev}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="panel-header">
          <span className="panel-title">Webhook payload eksempel</span>
          <span className="mono text3" style={{ fontSize: 11 }}>Alta Video API format</span>
        </div>
        <div className="panel-body">
          <pre style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)',
            background: 'var(--bg)', padding: 16, borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', overflow: 'auto', lineHeight: 1.7
          }}>{`POST https://dit-dashboard.vercel.app/api/webhook
Authorization: Bearer <alta-webhook-token>

{
  "event": "rule_triggered",
  "ruleName": "Bevægelse — Zone A",
  "cameraName": "Indgang A",
  "cameraId": "cam-001",
  "site": "Hovedkontor",
  "timestamp": "${new Date().toISOString()}",
  "severity": "medium",
  "url": "https://alta.eu1.aware.avasecurity.com/alarm/abc123",
  "thumbnailUrl": "https://alta.eu1.aware.avasecurity.com/thumb/abc123.jpg"
}`}</pre>
        </div>
      </div>
    </div>
  )
}
