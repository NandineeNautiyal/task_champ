import React from 'react'

const PRIORITY_TONE = { High: 'priority-high', Medium: 'priority-medium', Low: 'priority-low' }

export default function TaskItem({ task, playerName, onComplete, onDelete }) {
  const isDone = task.status === 'completed'

  return (
    <li className={`task-item ${isDone ? 'task-item-done' : ''}`}>
      <div className="task-item-main">
        <div className="task-item-title-row">
          <span className="task-item-title">{task.title}</span>
          <span className={`priority-chip ${PRIORITY_TONE[task.priority] || ''}`}>{task.priority}</span>
        </div>
        {task.description && <p className="task-item-desc">{task.description}</p>}
        <div className="task-item-meta">
          <span>👤 {playerName || 'Unassigned'}</span>
          <span>🏷️ {task.category}</span>
          {task.dueDate && <span>📅 {task.dueDate}</span>}
        </div>
      </div>
      <div className="task-item-side">
        <span className="task-item-points">+{task.points} ⭐</span>
        {isDone ? (
          <span className="task-item-badge">✅ Done</span>
        ) : (
          <button className="btn btn-primary btn-small" onClick={() => onComplete(task.id)}>
            Claim +{task.points}
          </button>
        )}
        <button className="icon-btn icon-btn-danger" onClick={() => onDelete(task)} aria-label="Delete task">🗑️</button>
      </div>
    </li>
  )
}
