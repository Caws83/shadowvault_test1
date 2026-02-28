import React from 'react'
import { isMobile } from 'components/isMobile'

const SimpleHero: React.FC = () => {
  const mobile = isMobile()

  return (
    <div style={{ 
      minHeight: '400px', 
      padding: mobile ? '20px' : '50px',
      background: '#000',
      color: '#fff'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: mobile ? 'column' : 'row',
        gap: '48px',
        alignItems: 'flex-start'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: mobile ? '32px' : '48px',
            fontWeight: 'bold',
            background: 'linear-gradient(9deg, rgb(255, 255, 255) 0%, rgb(220, 20, 60) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px'
          }}>
            ShadowVault Protocol
          </h1>
          <p style={{
            fontSize: mobile ? '16px' : '20px',
            color: '#dadad2',
            maxWidth: '600px',
            marginBottom: '20px'
          }}>
            Trade in Shadows. Leverage Fearless. Privacy-centric DEX with AI-driven leverage trading.
          </p>
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#dadad2' }}>
              <span style={{ color: '#DC143C' }}>✓</span>
              <span>Zero-Knowledge Privacy - Complete transaction anonymity</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#dadad2' }}>
              <span style={{ color: '#DC143C' }}>✓</span>
              <span>Uniswap Liquidity - Deep pools for optimal execution</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#dadad2' }}>
              <span style={{ color: '#DC143C' }}>✓</span>
              <span>AI Trading Agent - Safe Mode (5-10x) or Psycho Mode (100x)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleHero

