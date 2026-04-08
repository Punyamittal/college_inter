import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Lock, Mail, ArrowLeft } from 'lucide-react'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })
    setIsSubmitting(false)
    setSent(true)
    if (error) {
      console.error('Password reset error:', error.message)
    }
  }

  return (
    <div className="auth-ambient">
      <div className="auth-glass-panel">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              margin: '0 auto 16px',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d4d4d8',
            }}
          >
            <Lock size={26} />
          </div>
          <h1 className="auth-title" style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
            Reset Password
          </h1>
          <p className="auth-sub" style={{ fontSize: '15px' }}>
            Enter your administrator email
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                padding: '18px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#e5e5e5',
                borderRadius: '12px',
                fontSize: '14px',
                marginBottom: '24px',
                border: '1px solid rgba(255, 255, 255, 0.16)',
              }}
            >
              If that email exists in our system, a reset link has been sent.
            </div>
            <a
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#d4d4d8',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} /> Back to Login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label className="auth-label">Admin Email</label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                >
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vitstudent.ac.in"
                  className="auth-field"
                  style={{ paddingLeft: '48px' }}
                />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="auth-btn-primary">
              {isSubmitting ? 'Sending...' : 'Send Recovery Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
