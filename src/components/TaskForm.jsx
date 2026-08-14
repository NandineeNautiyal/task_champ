import React, { useState } from 'react'
import { useStore } from '../store.jsx'

const CATEGORIES = ['College', 'Work', 'Personal', 'Fitness', 'General']
const PRIORITIES = ['Low', 'Medium', 'High']

const EMPTY = { title: '', description: '', points: 50, playerId: '', category: 'General', priority: 'Medium', dueDate: '' }

export default function TaskForm({ onClose }) {
  const { players, addTask } = useStore()
  const [form, setForm] = useState({ ...EMPTY, playerId: players[0]?.id || '' })
  const [error, setError] = useState('')

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError('Give the task a name.')
    if (!form.playerId) return setError('Pick who this task is for.')
    if (!form.points || Number(form.points) <= 0) return setError('Points must be greater than zero.')
    addTask(form)
    onClose()
  }

  if (players.length === 0) {
    return (
      <div className="panel-card">
        <p className="empty-note">Add a player first on the Players tab, then come back to create a task.</p>
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
      </div>
    )
  }

  return (
    <form className="panel-card task-form" onSubmit={submit}>
      <div className="panel-card-header">
        <h2>New task</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <label className="field">
        <span>Task name</span>
        <input value={form.title} onChange={update('title')} placeholder="Complete presentation" autoFocus />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea value={form.description} onChange={update('description')} placeholder="Finish slides 1–10" rows={2} />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Player</span>
          <select value={form.playerId} onChange={update('playerId')}>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Points</span>
          <input type="number" min="1" value={form.points} onChange={update('points')} />
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>Category</span>
          <select value={form.category} onChange={update('category')}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label className="field">
          <span>Priority</span>
          <select value={form.priority} onChange={update('priority')}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Due date</span>
        <input type="date" value={form.dueDate} onChange={update('dueDate')} />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn btn-primary btn-block">Create task</button>
    </form>
  )
}
