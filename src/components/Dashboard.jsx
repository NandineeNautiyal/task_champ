import React, { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import Podium from './Podium.jsx'
import Leaderboard from './Leaderboard.jsx'

const RANGES = [
  { id: 'all', label: 'All Time' },
  { id: 'month', label: 'This Month' },
  { id: 'week', label: 'This Week' },
  { id: 'today', label: 'Today' },
]

function withinRange(timestamp, rangeId) {
  const now = new Date()
  const d = new Date(timestamp)
  if (rangeId === 'all') return true
  if (rangeId === 'today') {
    return d.toDateString() === now.toDateString()
  }
  if (rangeId === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    start.setHours(0, 0, 0, 0)
    return d >= start
  }
  if (rangeId === 'month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }
  return true
}

export default function Dashboard({ onSelectPlayer }) {
  const { players, history } = useStore()
  const [range, setRange] = useState('all')

  const rows = useMemo(() => {
    const totals = {}
    for (const p of players) totals[p.id] = 0
    for (const h of history) {
      if (!withinRange(h.date, range)) continue
      const delta = h.action === 'earned' ? h.points : -Math.abs(h.points)
      totals[h.playerId] = (totals[h.playerId] || 0) + delta
    }
    const list = players.map((p) => ({ ...p, totalPoints: totals[p.id] || 0 }))
    list.sort((a, b) => b.totalPoints - a.totalPoints)
    return list.map((r, i) => ({ ...r, rank: i + 1 }))
  }, [players, history, range])

  const topThree = rows.slice(0, 3).filter((r) => r.totalPoints > 0 || rows.length <= 3)

  return (
    <div className="tab-panel">
      <section className="panel-card podium-card">
        <Podium topThree={topThree} onSelectPlayer={onSelectPlayer} />
      </section>

      <section className="panel-card">
        <div className="panel-card-header">
          <h2>Leaderboard</h2>
          <div className="range-tabs">
            {RANGES.map((r) => (
              <button
                key={r.id}
                className={`range-tab ${range === r.id ? 'range-tab-active' : ''}`}
                onClick={() => setRange(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <Leaderboard rows={rows} onSelectPlayer={onSelectPlayer} />
      </section>
    </div>
  )
}
