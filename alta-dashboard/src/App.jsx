import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import OverviewPage from './components/OverviewPage'
import CamerasPage from './components/CamerasPage'
import AlarmsPage from './components/AlarmsPage'
import AnalyticsPage from './components/AnalyticsPage'
import LiveFeedPage from './components/LiveFeedPage'
import './styles.css'

export default function App() {
  const [page, setPage] = useState('overview')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  const pages = {
    overview: <OverviewPage key={tick} />,
    cameras: <CamerasPage key={tick} />,
    alarms: <AlarmsPage key={tick} />,
    analytics: <AnalyticsPage key={tick} />,
    live: <LiveFeedPage key={tick} />,
  }

  return (
    <div className="app">
      <Sidebar active={page} onNav={setPage} />
      <main className="main-content">
        {pages[page]}
      </main>
    </div>
  )
}
