import React from 'react'

const SessionTimeoutWarning = ({ secondsLeft, onStay, onLogout }) => (
  <div
    className="glass-modal-overlay"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
    }}
  >
    <div
      className="auth-glass-panel"
      style={{
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#d4d4d8',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '28px', height: '28px' }}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="auth-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
        Session Expiring Soon
      </h3>
      <p className="auth-sub" style={{ fontSize: '15px', lineHeight: '1.5', marginBottom: '24px' }}>
        You will be signed out in{' '}
        <span style={{ fontWeight: '700', color: '#f5f5f5' }}>{secondsLeft} seconds</span> due to inactivity. Do you want to stay
        signed in?
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={onLogout}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.08)',
            color: '#e2e8f0',
            fontWeight: '600',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.15)',
            transition: 'background 0.2s',
          }}
        >
          Sign Out Now
        </button>
        <button type="button" onClick={onStay} className="auth-btn-primary" style={{ flex: 1, width: 'auto' }}>
          Stay Signed In
        </button>
      </div>
    </div>
  </div>
)

export default SessionTimeoutWarning
