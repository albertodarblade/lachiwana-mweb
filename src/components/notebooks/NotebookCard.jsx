import React from 'react'
import { Card, CardContent } from 'framework7-react'

export default function NotebookCard({ notebook }) {
  return (
    <Card style={{ margin: '8px 16px' }}>
      <CardContent style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
        <div style={{
          width: '6px',
          alignSelf: 'stretch',
          borderRadius: '3px',
          background: notebook.color ?? 'var(--f7-theme-color)',
          flexShrink: 0,
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '40px' }}>
          <i className="f7-icons" style={{ fontSize: '28px', color: notebook.color ?? 'var(--f7-theme-color)' }}>
            {notebook.iconName ?? 'book'}
          </i>
        </div>
        <span style={{ fontSize: '16px', fontWeight: '500', flex: 1 }}>
          {notebook.title}
        </span>
      </CardContent>
    </Card>
  )
}
