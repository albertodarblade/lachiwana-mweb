import React, { useState } from 'react'
import { getSession } from '../../stores/authStore'

export default function UserProfileHeader() {
  const user = getSession()?.user ?? {}
  const { name, email, picture } = user
  const [imgError, setImgError] = useState(false)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 16px 16px',
    }}>
      {picture && !imgError ? (
        <img
          src={picture}
          alt={name}
          width={64}
          height={64}
          onError={() => setImgError(true)}
          style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <i className="f7-icons" style={{ fontSize: '64px' }}>person_circle</i>
      )}
      <p style={{ margin: '12px 0 4px', fontWeight: 'bold', fontSize: '17px' }}>{name}</p>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--f7-list-item-subtitle-text-color)' }}>
        {email}
      </p>
    </div>
  )
}
