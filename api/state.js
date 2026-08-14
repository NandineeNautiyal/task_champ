import { getDb } from '../lib/mongodb.js'

// Everyone who opens the app shares this one board document.
const BOARD_ID = 'default-board'

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

async function getBoard(db) {
  const col = db.collection('boards')
  let doc = await col.findOne({ _id: BOARD_ID })
  if (!doc) {
    doc = { _id: BOARD_ID, players: [], tasks: [], history: [] }
    await col.insertOne(doc)
  }
  return doc
}

async function saveBoard(db, board) {
  const col = db.collection('boards')
  await col.updateOne(
    { _id: BOARD_ID },
    { $set: { players: board.players, tasks: board.tasks, history: board.history } },
    { upsert: true }
  )
}

function publicShape(board) {
  return { players: board.players, tasks: board.tasks, history: board.history }
}

export default async function handler(req, res) {
  let db
  try {
    db = await getDb()
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }

  if (req.method === 'GET') {
    try {
      const board = await getBoard(db)
      return res.status(200).json(publicShape(board))
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, payload = {} } = req.body || {}
      const board = await getBoard(db)
      const now = Date.now()

      switch (action) {
        case 'addPlayer': {
          const name = (payload.name || '').trim()
          if (!name) return res.status(400).json({ error: 'Player name is required.' })
          board.players.push({ id: uid('p'), name, createdAt: now })
          break
        }

        case 'deletePlayer': {
          board.players = board.players.filter((p) => p.id !== payload.playerId)
          board.tasks = board.tasks.filter((t) => t.playerId !== payload.playerId)
          board.history = board.history.filter((h) => h.playerId !== payload.playerId)
          break
        }

        case 'addTask': {
          const title = (payload.title || '').trim()
          if (!title) return res.status(400).json({ error: 'Task name is required.' })
          if (!payload.playerId) return res.status(400).json({ error: 'A player is required.' })
          board.tasks.push({
            id: uid('t'),
            title,
            description: (payload.description || '').trim(),
            points: Number(payload.points) || 0,
            playerId: payload.playerId,
            status: 'pending',
            category: payload.category || 'General',
            priority: payload.priority || 'Medium',
            dueDate: payload.dueDate || '',
            createdAt: now,
            completedAt: null,
          })
          break
        }

        case 'completeTask': {
          const task = board.tasks.find((t) => t.id === payload.taskId)
          if (task && task.status !== 'completed') {
            task.status = 'completed'
            task.completedAt = now
            board.history.push({
              id: uid('h'),
              playerId: task.playerId,
              taskId: task.id,
              taskTitle: task.title,
              points: task.points,
              action: 'earned',
              date: now,
            })
          }
          break
        }

        case 'deleteTask': {
          board.tasks = board.tasks.filter((t) => t.id !== payload.taskId)
          break
        }

        case 'deleteHistoryEntry': {
          board.history = board.history.filter((h) => h.id !== payload.historyId)
          break
        }

        default:
          return res.status(400).json({ error: `Unknown action "${action}".` })
      }

      await saveBoard(db, board)
      return res.status(200).json(publicShape(board))
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ error: 'Method not allowed' })
}
