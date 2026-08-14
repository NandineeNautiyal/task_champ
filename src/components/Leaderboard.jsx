import React from 'react'
import { useStore } from '../store.jsx'

const RANK_ICONS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ rows, onSelectPlayer }) {
  const { getLevel } = useStore()

  if (rows.length === 0) {
    return <p className="empty-note">No players yet. Head to the Players tab to add your first champion.</p>
  }

  return (
    <ol className="leaderboard-list">
      {rows.map((player) => {
        const level = getLevel(player.totalPoints)
        return (
          <li key={player.id} className="leaderboard-row" onClick={() => onSelectPlayer(player.id)}>
            <span className="leaderboard-rank">{RANK_ICONS[player.rank - 1] || player.rank}</span>
            <span className="leaderboard-name">
              {player.name}
              <span className="leaderboard-level">Lvl {level.level} · {level.label}</span>
            </span>
            <span className="leaderboard-points">{player.totalPoints.toLocaleString()} ⭐</span>
          </li>
        )
      })}
    </ol>
  )
}
