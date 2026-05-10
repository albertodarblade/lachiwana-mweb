import React, { useState } from 'react'
import { CircleUser } from 'lucide-react'
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
        <CircleUser size={64} className={styles.avatarIcon} />
      )}
      <p className={styles.name}>{name}</p>
      <p className={styles.email}>{email}</p>
    </div>
  )
}
