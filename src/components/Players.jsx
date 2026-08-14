import React, { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import ConfirmModal from './ConfirmModal.jsx'

export default function Players({ selectedPlayerId, onSelectPlayer }) {
  const { leaderboard, tasks, history, addPlayer, deletePlayer, getLevel, getBadges } = useStore()
  const [name, setName] = useState('')
  const [playerToDelete, setPlayerToDelete] = useState(null)

  const selected = leaderboard.find((p) => p.id === selectedPlayerId)

  const recentTasks = useMemo(() => {
    if (!selected) return []
    return tasks
      .filter((t) => t.playerId === selected.id && t.status === 'completed')
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 5)
  }, [tasks, selected])

  const pointsThisWeek = useMemo(() => {
    if (!selected) return 0
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    start.setHours(0, 0, 0, 0)
    return history
      .filter((h) => h.playerId === selected.id && new Date(h.date) >= start)
      .reduce((sum, h) => sum + (h.action === 'earned' ? h.points : -Math.abs(h.points)), 0)
  }, [history, selected])

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    addPlayer(name)
    setName('')
  }

  return (
    <div className="tab-panel">
      <form className="panel-card add-player-form" onSubmit={submit}>
        <label className="field">
          <span>Add a player</span>
          <div className="field-row">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Player name" />
            <button type="submit" className="btn btn-primary">Add</button>
          </div>
        </label>
      </form>

      {selected && (
        <section className="panel-card player-detail">
          <button className="link-back" onClick={() => onSelectPlayer(null)}>← All players</button>
          <div className="player-detail-head">
            <span className="player-avatar" aria-hidden="true">👤</span>
            <h2>{selected.name}</h2>
            <span className="player-points-big">{selected.totalPoints.toLocaleString()} ⭐</span>
            <span className="player-rank-tag">🏆 Rank #{selected.rank}</span>
            <span className="player-level-tag">Lvl {getLevel(selected.totalPoints).level} · {getLevel(selected.totalPoints).label}</span>
          </div>

          <div className="player-stat-grid">
            <div className="player-stat">
              <span className="player-stat-value">{selected.tasksCompleted}</span>
              <span className="player-stat-label">Tasks completed</span>
            </div>
            <div className="player-stat">
              <span className="player-stat-value">{pointsThisWeek}</span>
              <span className="player-stat-label">Points this week</span>
            </div>
          </div>

          <div className="badge-row">
            {getBadges(selected.id).map((b) => (
              <span key={b.id} className="badge-chip" title={b.label}>{b.icon} {b.label}</span>
            ))}
            {getBadges(selected.id).length === 0 && <span className="empty-note">No badges yet — complete a task to earn the first one.</span>}
          </div>

          <h3 className="section-label">Recent tasks</h3>
          {recentTasks.length === 0 ? (
            <p className="empty-note">No completed tasks yet.</p>
          ) : (
            <ul className="recent-task-list">
              {recentTasks.map((t) => (
                <li key={t.id}>
                  <span>✅ {t.title}</span>
                  <span className="recent-task-points">+{t.points}</span>
                </li>
              ))}
            </ul>
          )}

          <button className="btn btn-danger-outline btn-block" onClick={() => setPlayerToDelete(selected)}>
            Remove player
          </button>
        </section>
      )}

      {!selected && (
        <section className="panel-card">
          <h2>All players</h2>
          {leaderboard.length === 0 ? (
            <p className="empty-note">No players yet — add your first champion above.</p>
          ) : (
            <ul className="leaderboard-list">
              {leaderboard.map((p) => (
                <li key={p.id} className="leaderboard-row" onClick={() => onSelectPlayer(p.id)}>
                  <span className="leaderboard-rank">#{p.rank}</span>
                  <span className="leaderboard-name">
                    {p.name}
                    <span className="leaderboard-level">Lvl {getLevel(p.totalPoints).level} · {getLevel(p.totalPoints).label}</span>
                  </span>
                  <span className="leaderboard-points">{p.totalPoints.toLocaleString()} ⭐</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <ConfirmModal
        open={!!playerToDelete}
        title="Remove this player?"
        message={playerToDelete ? `"${playerToDelete.name}" and all of their tasks and point history will be deleted. This can't be undone.` : ''}
        onCancel={() => setPlayerToDelete(null)}
        onConfirm={() => {
          deletePlayer(playerToDelete.id)
          setPlayerToDelete(null)
          onSelectPlayer(null)
        }}
      />
    </div>
  )
}
