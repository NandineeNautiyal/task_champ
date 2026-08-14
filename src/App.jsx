import React, { useState } from 'react'
import Header from './components/Header.jsx'
import StatusBanner from './components/StatusBanner.jsx'
import NavTabs from './components/NavTabs.jsx'
import Dashboard from './components/Dashboard.jsx'
import Tasks from './components/Tasks.jsx'
import Players from './components/Players.jsx'
import History from './components/History.jsx'

const TABS = [
  { id: 'dashboard', label: 'Scoreboard', icon: '🏆' },
  { id: 'tasks', label: 'Tasks', icon: '📋' },
  { id: 'players', label: 'Players', icon: '👤' },
  { id: 'history', label: 'History', icon: '📜' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedPlayerId, setSelectedPlayerId] = useState(null)

  const goToPlayer = (playerId) => {
    setSelectedPlayerId(playerId)
    setActiveTab('players')
  }

  return (
    <div className="app-shell">
      <Header />
      <StatusBanner />
      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard onSelectPlayer={goToPlayer} />}
        {activeTab === 'tasks' && <Tasks />}
        {activeTab === 'players' && (
          <Players selectedPlayerId={selectedPlayerId} onSelectPlayer={setSelectedPlayerId} />
        )}
        {activeTab === 'history' && <History />}
      </main>
      <NavTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}
