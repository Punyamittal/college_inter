import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from './AuthContext'

const FullPageSpinner = ({ message = 'Verifying credentials...' }) => (
  <div className="auth-ambient" style={{ flexDirection: 'column' }}>
    <div
      className="auth-glass-panel"
      style={{
        maxWidth: '320px',
        padding: '36px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(255, 255, 255, 0.15)',
          borderTopColor: '#e5e5e5',
          borderRadius: '50%',
        }}
        className="animate-spin"
      />
      <p className="auth-sub" style={{ fontWeight: '500', textAlign: 'center', margin: 0 }}>
        {message}
      </p>
    </div>
  </div>
)

export function ProtectedRoute({ children }) {
  const { admin, loading } = useAuthContext()
  const location = useLocation()

  if (loading) {
    return <FullPageSpinner />
  }

  if (!admin) {
    // Save current location for redirection after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
