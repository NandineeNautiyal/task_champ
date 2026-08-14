import React, { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import ConfirmModal from './ConfirmModal.jsx'

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
  if (rangeId === 'today') return d.toDateString() === now.toDateString()
  if (rangeId === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    start.setHours(0, 0, 0, 0)
    return d >= start
  }
  if (rangeId === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  return true
}

function formatDate(ts) {
  return new Date(ts).toLocaleString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function History() {
  const { history, players, deleteHistoryEntry } = useStore()
  const [range, setRange] = useState('all')
  const [playerFilter, setPlayerFilter] = useState('all')
  const [entryToDelete, setEntryToDelete] = useState(null)

  const playerName = (id) => players.find((p) => p.id === id)?.name || 'Unknown'

  const rows = useMemo(() => {
    return history
      .filter((h) => withinRange(h.date, range))
      .filter((h) => playerFilter === 'all' || h.playerId === playerFilter)
      .sort((a, b) => b.date - a.date)
  }, [history, range, playerFilter])

  const total = rows.reduce((sum, h) => sum + (h.action === 'earned' ? h.points : -Math.abs(h.points)), 0)

  return (
    <div className="tab-panel">
      <section className="panel-card">
        <div className="panel-card-header">
          <h2>Point history</h2>
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

        <select className="player-filter-select" value={playerFilter} onChange={(e) => setPlayerFilter(e.target.value)}>
          <option value="all">All players</option>
          {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        {rows.length === 0 ? (
          <p className="empty-note">No point activity in this range yet.</p>
        ) : (
          <>
            <ul className="history-list">
              {rows.map((h) => (
                <li key={h.id} className="history-row">
                  <span className={`history-points ${h.action === 'earned' ? 'history-points-earned' : 'history-points-removed'}`}>
                    {h.action === 'earned' ? '+' : '−'}{h.points} ⭐
                  </span>
                  <span className="history-info">
                    <span className="history-title">{h.taskTitle}</span>
                    <span className="history-sub">{playerName(h.playerId)} · {formatDate(h.date)}</span>
                  </span>
                  <button className="icon-btn icon-btn-danger" onClick={() => setEntryToDelete(h)} aria-label="Delete entry">🗑️</button>
                </li>
              ))}
            </ul>
            <div className="history-total">
              <span>Total in view</span>
              <strong>{total.toLocaleString()} ⭐</strong>
            </div>
          </>
        )}
      </section>

      <ConfirmModal
        open={!!entryToDelete}
        title="Delete this point transaction?"
        message={
          entryToDelete
            ? `This will remove "${entryToDelete.taskTitle}" (${entryToDelete.points} pts) from ${playerName(entryToDelete.playerId)}'s history and lower their total accordingly.`
            : ''
        }
        onCancel={() => setEntryToDelete(null)}
        onConfirm={() => {
          deleteHistoryEntry(entryToDelete.id)
          setEntryToDelete(null)
        }}
      />
    </div>
  )
}
