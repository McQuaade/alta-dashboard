import { generateWeeklyAlarms, generateLPRData, generateHourlyTraffic } from '../api/mockData'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend
} from 'recharts'

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <div className="label">{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, marginTop: 2 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const weekly = generateWeeklyAlarms()
  const lpr = generateLPRData()
  const traffic = generateHourlyTraffic()

  const totalIn = traffic.reduce((s, h) => s + h.ind, 0)
  const totalOut = traffic.reduce((s, h) => s + h.ud, 0)
  const peakHour = traffic.reduce((max, h) => h.ind > max.ind ? h : max, traffic[0])

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Analytics</div>
        <div className="page-sub">Baseret på Alta Video API — counting, LPR og alarm-data</div>
      </div>

      <div className="analytics-kpi-row">
        <div className="kpi-mini">
          <div className="kpi-mini-label">TOTAL BESØGENDE</div>
          <div className="kpi-mini-val accent">{totalIn.toLocaleString()}</div>
          <div className="kpi-mini-delta">I dag · ind</div>
        </div>
        <div className="kpi-mini">
          <div className="kpi-mini-label">TRAVLESTE TIME</div>
          <div className="kpi-mini-val" style={{ color: 'var(--amber)' }}>{peakHour.hour}</div>
          <div className="kpi-mini-delta">{peakHour.ind} personer</div>
        </div>
        <div className="kpi-mini">
          <div className="kpi-mini-label">LPR REGISTRERINGER</div>
          <div className="kpi-mini-val" style={{ color: 'var(--accent2)' }}>{lpr.reduce((s,l) => s + l.count, 0)}</div>
          <div className="kpi-mini-delta">{lpr.filter(l => l.known).length} kendte køretøjer</div>
        </div>
        <div className="kpi-mini">
          <div className="kpi-mini-label">RISIKOFLAG</div>
          <div className="kpi-mini-val red">{lpr.filter(l => l.risk !== 'none').length}</div>
          <div className="kpi-mini-delta">Kræver opfølgning</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Alarmer denne uge — efter type</span>
          </div>
          <div className="panel-body" style={{ padding: '16px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekly} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="critical" name="Kritisk" stackId="a" fill="#ff4d4d" />
                <Bar dataKey="high" name="Høj" stackId="a" fill="#ffaa00" />
                <Bar dataKey="medium" name="Medium" stackId="a" fill="#0099ff" />
                <Bar dataKey="low" name="Lav" stackId="a" fill="#2a3040" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Trafikprofil — ind/ud</span>
          </div>
          <div className="panel-body" style={{ padding: '16px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={traffic}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={5} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="ind" name="Ind" stroke="#00d4aa" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ud" name="Ud" stroke="#0099ff" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">LPR — nummerpladehistorik</span>
          <span className="text3 mono" style={{ fontSize: 11 }}>Avigilon Alta LPR API</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>NUMMERPLADE</th>
              <th>REGISTRERINGER</th>
              <th>SIDST SET VED</th>
              <th>KLASSIFIKATION</th>
              <th>RISIKO</th>
            </tr>
          </thead>
          <tbody>
            {lpr.map(l => (
              <tr key={l.plate}>
                <td><span className="mono" style={{ fontSize: 13, letterSpacing: '0.05em' }}>{l.plate}</span></td>
                <td>
                  <div className="flex-gap">
                    <div className="uptime-bar" style={{ width: 50 }}>
                      <div className="uptime-fill" style={{ width: `${Math.min(l.count / 50 * 100, 100)}%`, background: 'var(--accent2)' }} />
                    </div>
                    <span className="mono">{l.count}</span>
                  </div>
                </td>
                <td className="text2">{l.lastSeen}</td>
                <td>
                  <span className={`badge ${l.known ? 'badge-online' : 'badge-warning'}`}>
                    {l.known ? 'Kendt' : 'Ukendt'}
                  </span>
                </td>
                <td>
                  {l.risk === 'none'
                    ? <span className="text3 mono" style={{ fontSize: 11 }}>—</span>
                    : <span className={`badge badge-${l.risk}`}>{l.risk === 'high' ? 'Høj risiko' : 'Medium'}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
