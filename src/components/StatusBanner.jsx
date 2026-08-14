import React from 'react'
import { useStore } from '../store.jsx'

export default function StatusBanner() {
  const { loading, error, clearError } = useStore()

  if (loading) {
    return <div className="status-banner status-banner-info">Loading the shared board…</div>
  }

  if (error) {
    return (
      <div className="status-banner status-banner-error">
        <span>⚠️ {error}</span>
        <button className="status-banner-dismiss" onClick={clearError} aria-label="Dismiss">✕</button>
      </div>
    )
  }

  return null
}
