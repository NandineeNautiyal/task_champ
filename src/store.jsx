import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'

const POLL_INTERVAL_MS = 5000

const LEVELS = [
  { level: 1, min: 0, max: 499, label: 'Rookie' },
  { level: 2, min: 500, max: 999, label: 'Grinder' },
  { level: 3, min: 1000, max: 1999, label: 'Contender' },
  { level: 4, min: 2000, max: 2999, label: 'Champion' },
  { level: 5, min: 3000, max: Infinity, label: 'Legend' },
]

const BADGES = [
  { id: 'first-task', label: 'First Task', icon: '🏅', check: (s) => s.tasksCompleted >= 1 },
  { id: 'ten-tasks', label: '10 Tasks Completed', icon: '⚡', check: (s) => s.tasksCompleted >= 10 },
  { id: 'fifty-tasks', label: '50 Tasks Completed', icon: '🚀', check: (s) => s.tasksCompleted >= 50 },
  { id: 'thousand-points', label: '1,000 Points', icon: '💎', check: (s) => s.totalPoints >= 1000 },
  { id: 'top-player', label: '#1 Player', icon: '👑', check: (s) => s.rank === 1 && s.totalPoints > 0 },
]

const EMPTY = { players: [], tasks: [], history: [] }

async function apiGet() {
  const res = await fetch('/api/state')
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Could not load the board.')
  return body
}

async function apiPost(action, payload) {
  const res = await fetch('/api/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'That action failed.')
  return body
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const pollRef = useRef(null)

  const refresh = useCallback(async ({ silent = false } = {}) => {
    try {
      const fresh = await apiGet()
      setData(fresh)
      setError('')
    } catch (e) {
      if (!silent) setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    pollRef.current = setInterval(() => refresh({ silent: true }), POLL_INTERVAL_MS)
    return () => clearInterval(pollRef.current)
  }, [refresh])

  const runAction = useCallback(async (action, payload) => {
    try {
      const fresh = await apiPost(action, payload)
      setData(fresh)
      setError('')
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }, [])

  const addPlayer = useCallback((name) => runAction('addPlayer', { name }), [runAction])
  const deletePlayer = useCallback((playerId) => runAction('deletePlayer', { playerId }), [runAction])
  const addTask = useCallback((task) => runAction('addTask', task), [runAction])
  const completeTask = useCallback((taskId) => runAction('completeTask', { taskId }), [runAction])
  const deleteTask = useCallback((taskId) => runAction('deleteTask', { taskId }), [runAction])
  const deleteHistoryEntry = useCallback((historyId) => runAction('deleteHistoryEntry', { historyId }), [runAction])

  // --- Derived data (computed client-side from whatever the API returned) ---

  const totalsByPlayer = useMemo(() => {
    const totals = {}
    for (const p of data.players) totals[p.id] = 0
    for (const h of data.history) {
      const delta = h.action === 'earned' ? h.points : -Math.abs(h.points)
      totals[h.playerId] = (totals[h.playerId] || 0) + delta
    }
    return totals
  }, [data.players, data.history])

  const tasksCompletedByPlayer = useMemo(() => {
    const counts = {}
    for (const p of data.players) counts[p.id] = 0
    for (const t of data.tasks) {
      if (t.status === 'completed') counts[t.playerId] = (counts[t.playerId] || 0) + 1
    }
    return counts
  }, [data.players, data.tasks])

  const leaderboard = useMemo(() => {
    const rows = data.players.map((p) => ({
      ...p,
      totalPoints: totalsByPlayer[p.id] || 0,
      tasksCompleted: tasksCompletedByPlayer[p.id] || 0,
    }))
    rows.sort((a, b) => b.totalPoints - a.totalPoints)
    return rows.map((r, i) => ({ ...r, rank: i + 1 }))
  }, [data.players, totalsByPlayer, tasksCompletedByPlayer])

  const getLevel = useCallback((points) => {
    return LEVELS.find((l) => points >= l.min && points <= l.max) || LEVELS[0]
  }, [])

  const getBadges = useCallback(
    (playerId) => {
      const row = leaderboard.find((r) => r.id === playerId)
      if (!row) return []
      return BADGES.filter((b) => b.check(row))
    },
    [leaderboard]
  )

  const value = {
    players: data.players,
    tasks: data.tasks,
    history: data.history,
    leaderboard,
    LEVELS,
    loading,
    error,
    clearError: () => setError(''),
    getLevel,
    getBadges,
    addPlayer,
    deletePlayer,
    addTask,
    completeTask,
    deleteTask,
    deleteHistoryEntry,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within a StoreProvider')
  return ctx
}
