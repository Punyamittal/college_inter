import React, { useState, useEffect } from 'react'
import { useAuthContext } from './AuthContext'
import { Lock, Mail, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const LockoutTimer = ({ lockedUntil, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(() => Math.ceil((lockedUntil - new Date()) / 1000))

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire()
      return
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onExpire()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, onExpire])

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  return (
    <div
      style={{
        padding: '14px',
        background: 'rgba(255, 255, 255, 0.08)',
        color: '#e5e5e5',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: '24px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        backdropFilter: 'blur(8px)',
      }}
    >
      Too many failed attempts. Try again in {mins}:{secs < 10 ? '0' : ''}{secs}
    </div>
  )
}

const Login = () => {
  const { login, lockedUntil } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locked, setLocked] = useState(lockedUntil && new Date() < lockedUntil)
  const navigate = useNavigate()

  useEffect(() => {
    if (lockedUntil && new Date() < lockedUntil) {
      setLocked(true)
    } else {
      setLocked(false)
    }
  }, [lockedUntil])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (locked) return

    setIsSubmitting(true)
    const { error } = await login(email, password)

    if (error) {
      toast.error(error)
      setIsSubmitting(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="auth-ambient">
      <div className="auth-glass-panel">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#d4d4d8',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <Lock size={30} />
          </div>
          <h1 className="auth-title" style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>
            College Interface
          </h1>
          <p className="auth-sub" style={{ fontSize: '15px' }}>
            Authorised personnel only
          </p>

          <div
            style={{
              marginTop: '18px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(15, 23, 42, 0.45)',
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <ShieldAlert size={14} color="#a1a1aa" />
            System monitored for unauthorised access
          </div>
        </div>

        {locked && <LockoutTimer lockedUntil={lockedUntil} onExpire={() => setLocked(false)} />}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label className="auth-label">Administrator email</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vitstudent.ac.in"
                className="auth-field"
                style={{ paddingLeft: '48px' }}
                disabled={locked}
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label className="auth-label">Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-field"
                style={{ paddingLeft: '48px', paddingRight: '48px' }}
                disabled={locked}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting || locked} className="auth-btn-primary">
            {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a href="/forgot-password" style={{ color: '#d4d4d8', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
            Forgotten password?
          </a>
        </div>
      </div>

      <div style={{ marginTop: '28px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p style={{ color: '#64748b', fontSize: '11px', letterSpacing: '0.06em', maxWidth: '360px' }}>
          UNAUTHORISED ACCESS ATTEMPTS ARE LOGGED AND REPORTED.
        </p>
      </div>
    </div>
  )
}

export default Login
