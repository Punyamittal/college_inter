import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import zxcvbn from 'zxcvbn'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const strength = zxcvbn(password)
  const score = strength.score

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (score < 3) {
      toast.error('Password is too weak. Aim for a strong score.')
      return
    }

    setIsSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password })
    setIsSubmitting(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully. Please sign in.')
      navigate('/login')
    }
  }

  const getStrengthColor = (s) => ['#525252', '#737373', '#a1a1aa', '#d4d4d8', '#f5f5f5'][s]

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
            <ShieldCheck size={28} />
          </div>
          <h1 className="auth-title" style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
            New Password
          </h1>
          <p className="auth-sub" style={{ fontSize: '15px' }}>Security requirement: Strong (3/4) or better</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label className="auth-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={12}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-field"
                style={{ paddingRight: '48px' }}
                placeholder="Min 12 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flex: 1, gap: '4px' }}>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: '4px',
                      flex: 1,
                      borderRadius: '2px',
                      backgroundColor: i < score ? getStrengthColor(score) : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: getStrengthColor(score) }}>
                {['Very Weak', 'Weak', 'So-so', 'Strong', 'Great!'][score]}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label className="auth-label">Confirm Password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="auth-field"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || score < 3}
            className="auth-btn-primary"
            style={{ opacity: isSubmitting || score < 3 ? 0.55 : 1 }}
          >
            {isSubmitting ? 'Updating...' : 'Set New Password'}
          </button>
          {score < 3 && password.length > 0 && (
            <p style={{ marginTop: '12px', fontSize: '12px', color: '#a1a1aa', textAlign: 'center', fontWeight: '500' }}>
              Password is not strong enough for admin accounts.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
