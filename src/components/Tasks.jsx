import React, { useMemo, useState } from 'react'
import { useStore } from '../store.jsx'
import TaskForm from './TaskForm.jsx'
import TaskItem from './TaskItem.jsx'
import ConfirmModal from './ConfirmModal.jsx'

const FILTERS = [
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'all', label: 'All' },
]

export default function Tasks() {
  const { tasks, players, completeTask, deleteTask } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('pending')
  const [taskToDelete, setTaskToDelete] = useState(null)

  const playerName = (id) => players.find((p) => p.id === id)?.name

  const visibleTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => b.createdAt - a.createdAt)
    if (filter === 'all') return sorted
    return sorted.filter((t) => t.status === filter)
  }, [tasks, filter])

  return (
    <div className="tab-panel">
      {!showForm && (
        <button className="btn btn-primary btn-block" onClick={() => setShowForm(true)}>
          + Add task
        </button>
      )}

      {showForm && <TaskForm onClose={() => setShowForm(false)} />}

      <section className="panel-card">
        <div className="panel-card-header">
          <h2>Tasks</h2>
          <div className="range-tabs">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={`range-tab ${filter === f.id ? 'range-tab-active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {visibleTasks.length === 0 ? (
          <p className="empty-note">Nothing here yet. Add a task to get the board moving.</p>
        ) : (
          <ul className="task-list">
            {visibleTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                playerName={playerName(task.playerId)}
                onComplete={completeTask}
                onDelete={setTaskToDelete}
              />
            ))}
          </ul>
        )}
      </section>

      <ConfirmModal
        open={!!taskToDelete}
        title="Remove this task?"
        message={
          taskToDelete
            ? `"${taskToDelete.title}" will be removed from the board.${
                taskToDelete.status === 'completed' ? ' Its points stay recorded in History — delete them there if you also want to adjust the total.' : ''
              }`
            : ''
        }
        onCancel={() => setTaskToDelete(null)}
        onConfirm={() => {
          deleteTask(taskToDelete.id)
          setTaskToDelete(null)
        }}
      />
    </div>
  )
}
