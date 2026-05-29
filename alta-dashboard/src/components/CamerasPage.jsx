import { useState } from 'react'
import { generateCameras } from '../api/mockData'

export default function CamerasPage() {
  const cameras = generateCameras()
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const filtered = cameras.filter(c =>
    filter === 'all' || c.status === filter
  )

  const sel = cameras.find(c => c.id === selected)

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Kameraer</div>
            <div className="page-sub">{cameras.filter(c => c.status === 'online').length} online · {cameras.filter(c => c.status === 'offline').length} offline · {cameras.filter(c => c.status === 'warning').length} advarsel</div>
          </div>
          <div className="flex-gap">
            {['all', 'online', 'warning', 'offline'].map(f => (
              <button key={f} className={`btn${filter === f ? ' btn-accent' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'Alle' : f === 'online' ? 'Online' : f === 'warning' ? 'Advarsel' : 'Offline'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: sel ? '1fr 320px' : '1fr', gap: 20 }}>
        <div className="camera-grid" style={{ gridTemplateColumns: sel ? 'repeat(2,1fr)' : 'repeat(3,1fr)' }}>
          {filtered.map(cam => (
            <div
              key={cam.id}
              className={`camera-card${selected === cam.id ? ' selected' : ''}`}
              onClick={() => setSelected(selected === cam.id ? null : cam.id)}
            >
              <div className="cam-preview">
                <div className="cam-preview-noise" />
                {cam.status === 'online' && (
                  <>
                    <div className="cam-live-badge">
                      <span className="cam-live-dot" />
                      REC
                    </div>
                    <svg width="40" height="40" viewBox="0 0 40 40" style={{ opacity: 0.06 }}>
                      <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="2" fill="none"/>
                      <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2" fill="none"/>
                      <circle cx="20" cy="20" r="2" fill="white"/>
                    </svg>
                  </>
                )}
                {cam.status === 'offline' && (
                  <div className="cam-offline-overlay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                    <span style={{ fontSize: 10, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>OFFLINE</span>
                  </div>
                )}
                {cam.status === 'warning' && (
                  <div className="cam-offline-overlay" style={{ background: 'rgba(255,170,0,0.05)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.5">
                      <path d="M12 2L2 19h20L12 2z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <circle cx="12" cy="17" r="1" fill="var(--amber)"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="cam-info">
                <div className="cam-name">{cam.name}</div>
                <div className="cam-site">{cam.site}</div>
                <div className="cam-footer">
                  <span className={`badge badge-${cam.status}`}>{cam.status}</span>
                  <span className="mono text3" style={{ fontSize: 10 }}>{cam.resolution}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sel && (
          <div className="panel" style={{ height: 'fit-content', position: 'sticky', top: 20 }}>
            <div className="panel-header">
              <span className="panel-title">{sel.name}</span>
              <button className="panel-action" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="panel-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Status', <span className={`badge badge-${sel.status}`}>{sel.status}</span>],
                  ['Site', sel.site],
                  ['Opløsning', sel.resolution],
                  ['IP-adresse', <span className="mono">{sel.ip}</span>],
                  ['Sidst set', sel.lastSeen],
                  ['Optagelse', sel.recording ? <span className="green">Aktiv</span> : <span className="red">Inaktiv</span>],
                  ['Analytics', sel.analytics ? <span className="accent">Aktiveret</span> : <span className="text3">Inaktiv</span>],
                  ['Uptime', `${sel.uptime}%`],
                ].map(([label, val]) => (
                  <div key={label} className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                    <span className="text3 mono" style={{ fontSize: 11 }}>{label}</span>
                    <span style={{ fontSize: 13 }}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button className="btn" style={{ flex: 1 }}>HLS Stream</button>
                <button className="btn" style={{ flex: 1 }}>Optagelser</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
