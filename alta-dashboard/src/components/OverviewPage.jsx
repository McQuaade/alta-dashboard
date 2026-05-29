import { generateSystemStats, generateAlarms, generateHourlyTraffic, generateSiteHealth } from '../api/mockData'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
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
  const stats = generateSystemStats()
  const alarms = generateAlarms()
  const traffic = generateHourlyTraffic()
  const sites = generateSiteHealth()
  const recent = alarms.slice(0, 8)
  const now = new Date()

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">System Overblik</div>
            <div className="page-sub mono">
              {format(now, "EEEE d. MMMM yyyy — HH:mm", { locale: da })} · Auto-refresh hvert 30s
            </div>
          </div>
          <div className="flex-gap">
            <span className="tag">DEMO MODE</span>
            <button className="btn">Eksportér rapport</button>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stat-grid">
        <div className="stat-card green">
          <div className="stat-label">KAMERAER ONLINE</div>
          <div className="stat-value green">{stats.cameras.online}</div>
          <div className="stat-sub">{stats.cameras.total} total · {stats.cameras.offline} offline · {stats.cameras.warning} advarsel</div>
          <div className="uptime-bar">
            <div className="uptime-fill" style={{ width: `${stats.cameras.online / stats.cameras.total * 100}%`, background: 'var(--green)' }} />
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

      {/* TRAFFIC + ALARMS */}
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
            <button className="panel-action">Vis alle</button>
          </div>
          <div style={{ padding: '0 16px' }}>
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
                <div className="alarm-time">{format(a.time, 'HH:mm')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SITE HEALTH */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Site Status</span>
          <span className="text3 mono" style={{ fontSize: 11 }}>4 lokationer</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>LOKATION</th>
              <th>KAMERAER</th>
              <th>UPTIME</th>
              <th>AKTIVE ALARMER</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {sites.map(s => (
              <tr key={s.site}>
                <td style={{ fontWeight: 500 }}>{s.site}</td>
                <td>
                  <span className="green">{s.online}</span>
                  <span className="text3"> / {s.cameras}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="uptime-bar" style={{ width: 60 }}>
                      <div className="uptime-fill" style={{
                        width: `${s.online / s.cameras * 100}%`,
                        background: s.online === s.cameras ? 'var(--green)' : 'var(--amber)'
                      }} />
                    </div>
                    <span className="mono">{Math.round(s.online / s.cameras * 100)}%</span>
                  </div>
                </td>
                <td>
                  {s.alarms > 0
                    ? <span className="red mono">{s.alarms}</span>
                    : <span className="text3 mono">—</span>}
                </td>
                <td>
                  <span className={`badge badge-${s.online === s.cameras ? 'online' : s.alarms > 3 ? 'offline' : 'warning'}`}>
                    {s.online === s.cameras ? 'OK' : s.alarms > 3 ? 'Kritisk' : 'Advarsel'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
