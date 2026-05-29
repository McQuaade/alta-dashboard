import { useState } from 'react'
import { generateAlarms } from '../api/mockData'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

export default function AlarmsPage() {
  const allAlarms = generateAlarms()
  const [filter, setFilter] = useState('all')
  const [acked, setAcked] = useState(new Set(allAlarms.filter(a => a.acknowledged).map(a => a.id)))

  const filtered = allAlarms.filter(a => {
    if (filter === 'unacked') return !acked.has(a.id)
    if (filter === 'critical') return a.severity === 'critical'
    return true
  })

  const sevColor = { critical: 'var(--red)', high: 'var(--amber)', medium: 'var(--accent2)', low: 'var(--text3)' }
  const sevLabel = { critical: 'Kritisk', high: 'Høj', medium: 'Medium', low: 'Lav' }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Alarmer</div>
            <div className="page-sub">{allAlarms.filter(a => !acked.has(a.id)).length} ubekræftede · {allAlarms.filter(a => a.severity === 'critical').length} kritiske</div>
          </div>
          <div className="flex-gap">
            {[['all','Alle'],['unacked','Ubekræftede'],['critical','Kritiske']].map(([f,l]) => (
              <button key={f} className={`btn${filter===f?' btn-accent':''}`} onClick={() => setFilter(f)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {['critical','high','medium','low'].map(sev => {
          const count = allAlarms.filter(a => a.severity === sev).length
          return (
            <div key={sev} className="panel" style={{ padding: '14px 16px' }}>
              <div className="mono text3" style={{ fontSize: 10, letterSpacing: '0.08em', marginBottom: 6 }}>{sevLabel[sev].toUpperCase()}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: sevColor[sev] }}>{count}</div>
            </div>
          )
        })}
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Alarm log</span>
          <button className="btn" onClick={() => setAcked(new Set(allAlarms.map(a => a.id)))}>Bekræft alle</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{width:4}}></th>
              <th>ALARMTYPE</th>
              <th>KAMERA</th>
              <th>SITE</th>
              <th>TIDSPUNKT</th>
              <th>ALVORLIGHED</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(alarm => (
              <tr key={alarm.id}>
                <td style={{ padding: '12px 0 12px 16px' }}>
                  <div style={{ width: 3, height: 32, borderRadius: 2, background: sevColor[alarm.severity] }} />
                </td>
                <td style={{ fontWeight: 500 }}>{alarm.type}</td>
                <td className="mono text2" style={{ fontSize: 12 }}>{alarm.camera}</td>
                <td className="text2">{alarm.site}</td>
                <td className="mono text3" style={{ fontSize: 12 }}>
                  {format(alarm.time, 'dd.MM HH:mm', { locale: da })}
                </td>
                <td>
                  <span className={`badge badge-${alarm.severity}`}>{sevLabel[alarm.severity]}</span>
                </td>
                <td>
                  {acked.has(alarm.id)
                    ? <span className="text3 mono" style={{ fontSize: 11 }}>Bekræftet</span>
                    : <span className="red mono" style={{ fontSize: 11 }}>Åben</span>}
                </td>
                <td>
                  {!acked.has(alarm.id) && (
                    <button className="btn" style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={() => setAcked(p => new Set([...p, alarm.id]))}>
                      Bekræft
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
