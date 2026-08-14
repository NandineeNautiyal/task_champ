import React from 'react'

export default function NavTabs({ tabs, activeTab, onChange }) {
  return (
    <nav className="nav-tabs" aria-label="Primary">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab ${activeTab === tab.id ? 'nav-tab-active' : ''}`}
          onClick={() => onChange(tab.id)}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          <span className="nav-tab-icon" aria-hidden="true">{tab.icon}</span>
          <span className="nav-tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
