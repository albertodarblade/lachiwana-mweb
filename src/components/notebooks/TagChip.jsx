import React from 'react'

export default function TagChip({ tag }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: 'rgba(0, 0, 0, 0.08)',
      color: 'var(--f7-theme-color)',
      borderRadius: 20,
      padding: '4px 10px',
      fontSize: 13,
      fontWeight: 500,
      flexShrink: 0,
    }}>
      <i className="f7-icons" style={{ fontSize: 14 }}>{tag.icon}</i>
      <span>{tag.title}</span>
    </div>
  )
}
