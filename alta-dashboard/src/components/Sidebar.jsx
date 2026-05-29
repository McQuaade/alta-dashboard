export default function Sidebar({ active, onNav }) {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })

  const navItems = [
    { id: 'overview', label: 'Overblik', icon: GridIcon },
    { id: 'cameras', label: 'Kameraer', icon: CamIcon },
    { id: 'alarms', label: 'Alarmer', icon: BellIcon, badge: 4 },
    { id: 'analytics', label: 'Analytics', icon: ChartIcon },
    { id: 'live', label: 'Live Feed', icon: PlayIcon },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">
            <svg viewBox="0 0 16 16"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z"/></svg>
          </div>
          <div>
            <div>ALTA</div>
            <div className="logo-sub">SECURITY DASHBOARD</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">NAVIGATION</div>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item${active === item.id ? ' active' : ''}`}
            onClick={() => onNav(item.id)}
          >
            <item.icon />
            {item.label}
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </button>
        ))}

        <div className="nav-section" style={{ marginTop: 12 }}>SYSTEM</div>
        <button className="nav-item" style={{ cursor: 'default' }}>
          <SettingsIcon />
          Indstillinger
        </button>
        <button className="nav-item" style={{ cursor: 'default' }}>
          <ApiIcon />
          API Status
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="conn-status">
          <span className="conn-dot" />
          <span>Forbundet · {timeStr}</span>
        </div>
        <div className="conn-server">alta.eu1.aware.avasecurity.com</div>
      </div>
    </aside>
  )
}

function GridIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
      <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
    </svg>
  )
}
function CamIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="4" width="11" height="8" rx="1.5"/>
      <path d="M12 6.5L15 5v6l-3-1.5"/>
      <circle cx="6" cy="8" r="2"/>
    </svg>
  )
}
function BellIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1.5A4.5 4.5 0 0 0 3.5 6v3.5L2 11h12l-1.5-1.5V6A4.5 4.5 0 0 0 8 1.5Z"/>
      <path d="M6.5 11v.5a1.5 1.5 0 0 0 3 0V11"/>
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12L5 7l3 3 3-4 3 2"/>
      <path d="M1 15h14"/>
    </svg>
  )
}
function PlayIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5"/>
      <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor" stroke="none"/>
    </svg>
  )
}
function SettingsIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/>
    </svg>
  )
}
function ApiIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 5l4-4 4 4M3 11l4 4 4-4"/>
      <line x1="8" y1="1" x2="8" y2="15"/>
    </svg>
  )
}
