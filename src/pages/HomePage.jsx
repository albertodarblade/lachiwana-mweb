import React from 'react'
import { Page, Navbar, Block, BlockTitle, Card, CardContent, Preloader } from 'framework7-react'
import { useHealth } from '../hooks/useHealth'

export default function HomePage() {
  const { data, isLoading, isError, error } = useHealth()

  return (
    <Page>
      <Navbar title="Lachiwana" />

      <BlockTitle>Service Status</BlockTitle>
      <Block strong inset>
        <Card>
          <CardContent>
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Preloader size={20} />
                <span>Checking API...</span>
              </div>
            )}
            {isError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--f7-color-red)' }}>
                <i className="f7-icons">exclamationmark_circle_fill</i>
                <span>{error.message}</span>
              </div>
            )}
            {data && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--f7-color-green)' }}>
                <i className="f7-icons">checkmark_circle_fill</i>
                <span>API is online</span>
              </div>
            )}
          </CardContent>
        </Card>
      </Block>
    </Page>
  )
}
