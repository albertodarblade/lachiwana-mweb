import React, { useState } from 'react'
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, f7 } from 'framework7-react'
import UserProfileHeader from '../components/settings/UserProfileHeader'
import { getSession, clearSession } from '../stores/authStore'
import { getPrefs, setPrefs } from '../stores/settingsStore'
import queryClient from '../queryClient'

export default function SettingsPage() {
  const [, rerender] = useState(0)
  const userId = getSession()?.user?.googleId ?? ''
  const currentPrefs = getPrefs(userId)

  function handleLogout() {
    f7.dialog.confirm('¿Cerrar sesión?', 'Cerrar sesión', () => {
      clearSession()
      queryClient.clear()
      window.location.replace('/login')
    })
  }

  function handleTheme(theme) {
    setPrefs(userId, { ...currentPrefs, theme })
    rerender(n => n + 1)
  }

  function handleColorScheme() {
    const newColorScheme = currentPrefs.colorScheme === 'dark' ? 'light' : 'dark'
    setPrefs(userId, { ...currentPrefs, colorScheme: newColorScheme })
    rerender(n => n + 1)
  }

  return (
    <Page>
      <Navbar title="Ajustes" backLink="Atrás" />

      <UserProfileHeader />

      <BlockTitle>Estilo</BlockTitle>
      <List>
        <ListItem
          title="iOS"
          after={currentPrefs.theme === 'ios' ? '✓' : ''}
          onClick={() => handleTheme('ios')}
        />
        <ListItem
          title="Google"
          after={currentPrefs.theme === 'md' ? '✓' : ''}
          onClick={() => handleTheme('md')}
        />
      </List>

      <BlockTitle>Apariencia</BlockTitle>
      <List>
        <ListItem title="Modo oscuro">
          <Toggle
            slot="after"
            checked={currentPrefs.colorScheme === 'dark'}
            onToggleChange={handleColorScheme}
          />
        </ListItem>
      </List>

      <List style={{ marginTop: '32px' }}>
        <ListItem
          title="Cerrar sesión"
          onClick={handleLogout}
          style={{ color: 'var(--f7-color-red)' }}
        />
      </List>
    </Page>
  )
}
