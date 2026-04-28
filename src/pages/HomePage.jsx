import React from 'react'
import { Page, Navbar, Block, BlockTitle, Card, CardContent, Preloader, List, ListItem } from 'framework7-react'
import { useHealth } from '../hooks/useHealth'
import { useUsers } from '../hooks/useUsers'

export default function HomePage() {
  const health = useHealth()
  const users = useUsers()

  return (
    <Page>
      <Navbar title="Lachiwana" />

      <BlockTitle>Service Status</BlockTitle>
      <Block strong inset>
        <Card>
          <CardContent>
            {health.isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Preloader size={20} />
                <span>Checking API...</span>
              </div>
            )}
            {health.isError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--f7-color-red)' }}>
                <i className="f7-icons">exclamationmark_circle_fill</i>
                <span>{health.error.message}</span>
              </div>
            )}
            {health.data && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--f7-color-green)' }}>
                <i className="f7-icons">checkmark_circle_fill</i>
                <span>API is online</span>
              </div>
            )}
          </CardContent>
        </Card>
      </Block>

      <BlockTitle>Users</BlockTitle>
      <Block strong inset>
        {users.isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Preloader size={20} />
            <span>Loading users...</span>
          </div>
        )}
        {users.isError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--f7-color-red)' }}>
            <i className="f7-icons">exclamationmark_circle_fill</i>
            <span>{users.error.message}</span>
          </div>
        )}
        {users.data?.data?.length === 0 && (
          <p style={{ color: 'var(--f7-block-text-color)', margin: 0 }}>No users found.</p>
        )}
        {users.data?.data?.length > 0 && (
          <List mediaList>
            {users.data.data.map((user) => (
              <ListItem key={user.googleId} title={user.name} subtitle={user.email}>
                {user.picture
                  ? <img slot="media" src={user.picture} width={44} height={44} style={{ borderRadius: '50%', objectFit: 'cover' }} alt={user.name} />
                  : <i slot="media" className="f7-icons" style={{ fontSize: 44 }}>person_circle</i>
                }
              </ListItem>
            ))}
          </List>
        )}
      </Block>
    </Page>
  )
}
