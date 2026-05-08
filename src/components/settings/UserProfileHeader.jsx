import React, { useState } from 'react'
import { getSession } from '../../stores/authStore'
import styles from './UserProfileHeader.module.css'

export default function UserProfileHeader() {
  const user = getSession()?.user ?? {}
  const { name, email, picture } = user
  const [imgError, setImgError] = useState(false)

  return (
    <div className={styles.wrapper}>
      {picture && !imgError ? (
        <img
          src={picture}
          alt={name}
          width={64}
          height={64}
          onError={() => setImgError(true)}
          className={styles.avatar}
        />
      ) : (
        <i className={['f7-icons', styles.avatarIcon].join(' ')}>person_circle</i>
      )}
      <p className={styles.name}>{name}</p>
      <p className={styles.email}>{email}</p>
    </div>
  )
}
