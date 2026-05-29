import { useState, useEffect } from 'react'
import { fetchAlarms } from '../api/mockData'
import { format } from 'date-fns'

export default function LiveFeedPage() {
  const [alarms, setAlarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  async function load() {
    try {
      const data = await fetchAlarms()
      setAlarms(data.slice(0, 50))
      setLastUpdate(new Date())
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [])

  const sevColor = {
    critical: 'var(--red)',
    high: 'var(--amber)',
    medium: 'var(--accent2)',
    low: 'var(--text3)',
  }

  const personCount = alarms.reduce((s, a) => s + (a.objects?.filter(o => o.class === 'person').length || 0), 0)
  const vehicleCount = alarms.reduce((s, a) => s + (a.objects?.filter(o => o.class === 'vehicle').length || 0), 0)
  const unacked = alarms.filter(a => !a.acknowledged).length

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Alarm Event Feed</div>
            <div className="page-sub mono">
              {loading ? 'Henter...' : `Sidst opdateret: ${lastUpdate ? format(lastUpdate, 'HH:mm:ss') : '—'} · Auto-refresh hvert 30s`}
            </div>
          </div>
          <div className="flex-gap">
            <span className="tag">{loading ? 'HENTER...' : 'LIVE'}</span>
            <button className="btn" onClick={load}>Opdater nu</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <div className="panel" style={{ padding: '14px 18px' }}>
          <div className="mono text3" style={{ fontSize: 10, marginBottom: 6 }}>UBEKRÆFTEDE</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--red)' }}>{unacked}</div>
        </div>
        <div className="panel" style={{ padding: '14px 18px' }}>
          <div className="mono text3" style={{ fontSize: 10, marginBottom: 6 }}>PERSONER DETEKTERET</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>{personCount}</div>
        </div>
        <div className="panel" style={{ padding: '14px 18px' }}>
          <div className="mono text3" style={{ fontSize: 10, marginBottom: 6 }}>KØRETØJER DETEKTERET</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--amber)' }}>{vehicleCount}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Alarm log — rigtige data fra Alta</span>
          <span className="mono text3" style={{ fontSize: 11 }}>{alarms.length} events</span>
        </div>
        <div style={{ maxHeight: 600, overflowY: 'auto' }}>
          {loading && <div style={{ padding: 20, color: 'var(--text3)', fontSize: 13 }}>Henter alarmer fra Alta...</div>}
          {alarms.map(a => {
            const persons = a.objects?.filter(o => o.class === 'person').length || 0
            const vehicles = a.objects?.filter(o => o.class === 'vehicle').length || 0
            return (
              <div key={a.id} className="live-event">
                <div className="live-dot" style={{ background: sevColor[a.severity] }} />
                <div style={{ flex: 1 }}>
                  <div className="live-text">
                    <span style={{ color: sevColor[a.severity], fontWeight: 500 }}>{a.type}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                    {a.camera}
                    {persons > 0 && <span style={{ marginLeft: 8, color: 'var(--accent)' }}>{persons} person{persons > 1 ? 'er' : ''}</span>}
                    {vehicles > 0 && <span style={{ marginLeft: 8, color: 'var(--amber)' }}>{vehicles} køretøj{vehicles > 1 ? 'er' : ''}</span>}
                  </div>
                  <div className="live-time">{format(new Date(a.time), 'dd.MM.yy HH:mm')}</div>
                </div>
                <span className={`badge badge-${a.acknowledged ? 'online' : 'warning'}`} style={{ fontSize: 10 }}>
                  {a.acknowledged ? 'Bekræftet' : 'Åben'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
