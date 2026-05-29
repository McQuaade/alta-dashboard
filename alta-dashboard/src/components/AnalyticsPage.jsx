import { useState, useEffect } from 'react'
import { fetchAlarms, fetchCameras } from '../api/mockData'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

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
  const [alarms, setAlarms] = useState([])
  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [alrms, cams] = await Promise.all([fetchAlarms(), fetchCameras()])
      setAlarms(alrms)
      setCameras(cams)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div className="page-title">Analytics</div>
        </div>
        <div style={{ color: 'var(--text3)', fontSize: 13 }}>Henter data fra Alta...</div>
      </div>
    )
  }

  // --- Beregn statistik ---

  // Objekt-typer totalt
  const totalPersons = alarms.reduce((s, a) => s + (a.objects?.filter(o => o.class === 'person').length || 0), 0)
  const totalVehicles = alarms.reduce((s, a) => s + (a.objects?.filter(o => o.class === 'vehicle').length || 0), 0)
  const totalUnacked = alarms.filter(a => !a.acknowledged).length

  // Unik regel-navne
  const ruleNames = [...new Set(alarms.map(a => a.type.split(' — ')[0]))]

  // Alarmer per kamera
  const perCamera = {}
  alarms.forEach(a => {
    if (!perCamera[a.camera]) perCamera[a.camera] = { name: a.camera, alarmer: 0, personer: 0, koretoejer: 0 }
    perCamera[a.camera].alarmer++
    perCamera[a.camera].personer += a.objects?.filter(o => o.class === 'person').length || 0
    perCamera[a.camera].koretoejer += a.objects?.filter(o => o.class === 'vehicle').length || 0
  })
  const cameraData = Object.values(perCamera).sort((a, b) => b.alarmer - a.alarmer).slice(0, 8)

  // Alarmer per dag (sidste 14 dage)
  const dayMap = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = format(d, 'dd.MM')
    dayMap[key] = { dag: key, alarmer: 0, personer: 0, koretoejer: 0 }
  }
  alarms.forEach(a => {
    const key = format(new Date(a.time), 'dd.MM')
    if (dayMap[key]) {
      dayMap[key].alarmer++
      dayMap[key].personer += a.objects?.filter(o => o.class === 'person').length || 0
      dayMap[key].koretoejer += a.objects?.filter(o => o.class === 'vehicle').length || 0
    }
  })
  const dailyData = Object.values(dayMap)

  // Alarmer per time på dagen
  const hourMap = {}
  for (let h = 0; h < 24; h++) {
    hourMap[h] = { time: String(h).padStart(2, '0') + ':00', antal: 0 }
  }
  alarms.forEach(a => {
    const h = new Date(a.time).getHours()
    hourMap[h].antal++
  })
  const hourlyData = Object.values(hourMap)

  // Pie data
  const pieData = [
    { name: 'Personer', value: totalPersons, color: '#00d4aa' },
    { name: 'Køretøjer', value: totalVehicles, color: '#ffaa00' },
  ].filter(d => d.value > 0)

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Analytics</div>
            <div className="page-sub">Baseret på {alarms.length} alarmer fra Alta Video API</div>
          </div>
          <div className="flex-gap">
            <span className="tag">LIVE DATA</span>
          </div>
        </div>
      </div>

      {/* KPI KORT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <div className="kpi-mini">
          <div className="kpi-mini-label">TOTAL ALARMER</div>
          <div className="kpi-mini-val accent">{alarms.length}</div>
          <div className="kpi-mini-delta">{ruleNames.join(', ')}</div>
        </div>
        <div className="kpi-mini">
          <div className="kpi-mini-label">UBEKRÆFTEDE</div>
          <div className="kpi-mini-val red">{totalUnacked}</div>
          <div className="kpi-mini-delta">Kræver opmærksomhed</div>
        </div>
        <div className="kpi-mini">
          <div className="kpi-mini-label">PERSONER DETEKTERET</div>
          <div className="kpi-mini-val" style={{ color: 'var(--accent)' }}>{totalPersons}</div>
          <div className="kpi-mini-delta">Across alle kameraer</div>
        </div>
        <div className="kpi-mini">
          <div className="kpi-mini-label">KØRETØJER DETEKTERET</div>
          <div className="kpi-mini-val" style={{ color: 'var(--amber)' }}>{totalVehicles}</div>
          <div className="kpi-mini-delta">Across alle kameraer</div>
        </div>
      </div>

      {/* DAGLIG AKTIVITET + PIE */}
      <div className="grid-cols-3-2" style={{ marginBottom: 20 }}>
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Aktivitet — sidste 14 dage</span>
          </div>
          <div className="panel-body" style={{ padding: '16px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dag" tick={{ fontSize: 10 }} interval={1} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="personer" name="Personer" stackId="a" fill="#00d4aa" />
                <Bar dataKey="koretoejer" name="Køretøjer" stackId="a" fill="#ffaa00" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Objekt-fordeling</span>
          </div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16 }}>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val, name) => [val, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                      <span className="text2">{d.name}: <strong>{d.value}</strong></span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text3" style={{ fontSize: 13, marginTop: 40 }}>Ingen objekt-data</div>
            )}
          </div>
        </div>
      </div>

      {/* AKTIVITET PER TIME */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <span className="panel-title">Aktivitet per time på dagen</span>
          <span className="text3 mono" style={{ fontSize: 11 }}>Hvornår sker der mest</span>
        </div>
        <div className="panel-body" style={{ padding: '16px 8px 8px' }}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourlyData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={2} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="antal" name="Alarmer" fill="#0099ff" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ALARMER PER KAMERA */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Aktivitet per kamera</span>
          <span className="text3 mono" style={{ fontSize: 11 }}>Top {cameraData.length} kameraer</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>KAMERA</th>
              <th>ALARMER</th>
              <th>PERSONER</th>
              <th>KØRETØJER</th>
              <th>AKTIVITET</th>
            </tr>
          </thead>
          <tbody>
            {cameraData.map(c => {
              const maxAlarmer = cameraData[0].alarmer
              return (
                <tr key={c.name}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td className="mono accent">{c.alarmer}</td>
                  <td>
                    {c.personer > 0
                      ? <span style={{ color: 'var(--accent)' }}>{c.personer}</span>
                      : <span className="text3">—</span>}
                  </td>
                  <td>
                    {c.koretoejer > 0
                      ? <span style={{ color: 'var(--amber)' }}>{c.koretoejer}</span>
                      : <span className="text3">—</span>}
                  </td>
                  <td style={{ width: 160 }}>
                    <div className="uptime-bar" style={{ width: 120 }}>
                      <div className="uptime-fill" style={{
                        width: `${Math.round(c.alarmer / maxAlarmer * 100)}%`,
                        background: 'var(--accent2)'
                      }} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
