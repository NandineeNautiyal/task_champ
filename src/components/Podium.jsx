import React from 'react'

const STEP_STYLE = {
  1: { order: 2, height: 168, medal: '🥇', tone: 'gold' },
  2: { order: 1, height: 128, medal: '🥈', tone: 'silver' },
  3: { order: 3, height: 96, medal: '🥉', tone: 'bronze' },
}

export default function Podium({ topThree, onSelectPlayer }) {
  if (topThree.length === 0) {
    return (
      <div className="podium-empty">
        <p>The podium is empty. Add a player and complete a task to claim the top spot.</p>
      </div>
    )
  }

  return (
    <div className="podium">
      {topThree.map((player) => {
        const style = STEP_STYLE[player.rank] || STEP_STYLE[3]
        return (
          <button
            key={player.id}
            className={`podium-step podium-${style.tone}`}
            style={{ order: style.order, height: `${style.height}px` }}
            onClick={() => onSelectPlayer(player.id)}
          >
            <span className="podium-medal" aria-hidden="true">{style.medal}</span>
            <span className="podium-name">{player.name}</span>
            <span className="podium-points">{player.totalPoints.toLocaleString()}</span>
            <span className="podium-rank-plate">{player.rank}</span>
          </button>
        )
      })}
    </div>
  )
}
