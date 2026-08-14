import React from 'react'
import { useStore } from '../store.jsx'

export default function Header() {
  const { leaderboard } = useStore()
  const totalPointsInPlay = leaderboard.reduce((sum, p) => sum + p.totalPoints, 0)

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-emblem">🏆</span>
        <div>
          <h1 className="header-title">TASK CHAMPION</h1>
          <p className="header-subtitle">Every task you finish is a point on the board.</p>
        </div>
      </div>
      <div className="header-stat">
        <span className="header-stat-label">Points in play</span>
        <span className="header-stat-value">{totalPointsInPlay.toLocaleString()}</span>
      </div>
    </header>
  )
}
