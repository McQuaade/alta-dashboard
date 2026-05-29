import { useState, useEffect } from 'react'
import { fetchCameras, fetchAlarms, generateHourlyTraffic, generateSiteHealth } from '../api/mockData'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="val" style={{ color: p.color }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

export default function OverviewPage() {
  const [cameras, setCameras] = useState([])
  const [alarms, setAlarms] = useState([])
  const [loading, setLoading] = useState(true)
  const traffic = generateHourlyTraffic()
  const sites = generateSiteHealth()
  const now = new Date()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [cams, alrms] = await Promise.all([fetchCameras(), fetchAlarms()])
        setCameras(cams)
        setAlarms(alrms)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [])

  const stats = {
    cameras: {
      total: cameras.length,
      online: cameras.filter(c => c.status === 'online').length,
      offline: cameras.filter(c => c.status === 'offline').length,
      warning: cameras.filter(c => c.status === 'warning').length,
    },
    alarms: {
      today: alarms.filter(a => new Date(a.time).toDateString() === now.toDateString()).length,
      unacknowledged: alarms.filter(a => !a.acknowledged).length,
      critical: alarms.filter(a => a.severity === 'critical').length,
    },
    recording: { activeStreams: cameras.filter(c => c.status === 'online').length, storageUsed: 68, storageGB: '—' },
    analytics: { eventsToday: alarms.length, anomalies: alarms.filter(a => a.type?.toLowerCase().includes('anomali')).length, lprHits: alarms.filter(a => a.type?.toLowerCase().includes('lpr')).length },
  }

  const recent = alarms.slice(0, 8)

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">System Overblik</div>
            <div className="page-sub mono">
              {format(now, "EEEE d. MMMM yyyy — HH:mm", { locale: da })}
              {loading ? ' · Henter data...' : ' · Auto-refresh hvert 30s'}
            </div>
          </div>
          <div className="flex-gap">
            <span className="tag">{loading ? 'HENTER...' : 'LIVE'}</span>
            <button className="btn">Eksportér rapport</button>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card green">
          <div className="stat-label">KAMERAER ONLINE</div>
          <div className="stat-value green">{stats.cameras.online}</div>
          <div className="stat-sub">{stats.cameras.total} total · {stats.cameras.offline} offline · {stats.cameras.warning} advarsel</div>
          <div className="uptime-bar">
            <div className="uptime-fill" style={{ width: stats.cameras.total ? `${stats.cameras.online / stats.cameras.total * 100}%` : '0%', background: 'var(--green)' }} />
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">AKTIVE ALARMER</div>
          <div className="stat-value red">{stats.alarms.unacknowledged}</div>
          <div className="stat-sub">{stats.alarms.today} i dag · {stats.alarms.critical} kritiske</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">ANALYTICS EVENTS</div>
          <div className="stat-value amber">{stats.analytics.eventsToday}</div>
          <div className="stat-sub">{stats.analytics.anomalies} anomalier · {stats.analytics.lprHits} LPR hits</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">STORAGE BRUGT</div>
          <div className="stat-value blue">{stats.recording.storageUsed}%</div>
          <div className="stat-sub">{stats.recording.storageGB} · {stats.recording.activeStreams} aktive streams</div>
          <div className="uptime-bar">
            <div className="uptime-fill" style={{ width: `${stats.recording.storageUsed}%`, background: 'var(--accent2)' }} />
          </div>
        </div>
      </div>

      <div className="grid-cols-3-2">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Persontrafikken — i dag</span>
            <span className="text3 mono" style={{ fontSize: 11 }}>people counting API</span>
          </div>
          <div className="panel-body" style={{ padding: '20px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={traffic}>
                <defs>
                  <linearGradient id="gInd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gUd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0099ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0099ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ind" name="Ind" stroke="#00d4aa" fill="url(#gInd)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="ud" name="Ud" stroke="#0099ff" fill="url(#gUd)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Seneste alarmer</span>
            <span className="text3 mono" style={{ fontSize: 11 }}>{alarms.length} total</span>
          </div>
          <div style={{ padding: '0 16px' }}>
            {loading && <div style={{ padding: '20px 0', color: 'var(--text3)', fontSize: 13 }}>Henter alarmer...</div>}
            {!loading && recent.length === 0 && <div style={{ padding: '20px 0', color: 'var(--text3)', fontSize: 13 }}>Ingen alarmer fundet</div>}
            {recent.map(a => (
              <div key={a.id} className="alarm-item">
                <div className="alarm-severity-bar" style={{
                  background: a.severity === 'critical' ? 'var(--red)' :
                    a.severity === 'high' ? 'var(--amber)' :
                    a.severity === 'medium' ? 'var(--accent2)' : 'var(--bg4)'
                }} />
                <div className="alarm-info">
                  <div className="alarm-type">{a.type}</div>
                  <div className="alarm-meta">{a.camera} · {a.site}</div>
                </div>
                <div className="alarm-time">{format(new Date(a.time), 'HH:mm')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Kamera Status</span>
          <span className="text3 mono" style={{ fontSize: 11 }}>{cameras.length} kameraer</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>NAVN</th>
              <th>SITE</th>
              <th>OPLØSNING</th>
              <th>OPTAGELSE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} style={{ color: 'var(--text3)', padding: 20 }}>Henter kameraer...</td></tr>
            )}
            {!loading && cameras.slice(0, 10).map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td className="text2">{c.site}</td>
                <td className="mono text2" style={{ fontSize: 12 }}>{c.resolution}</td>
                <td>
                  {c.recording
                    ? <span className="green" style={{ fontSize: 12 }}>Aktiv</span>
                    : <span className="text3" style={{ fontSize: 12 }}>Inaktiv</span>}
                </td>
                <td>
                  <span className={`badge badge-${c.status}`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
