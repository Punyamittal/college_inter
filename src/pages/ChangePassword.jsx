import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import zxcvbn from 'zxcvbn';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Security Scoring
  const strength = zxcvbn(newPassword);
  const score = strength.score; // 0-4

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (score < 3) {
      toast.error('Password is not strong enough for admin access.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Administrator password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  const getStrengthColor = (s) => ['#525252', '#737373', '#a1a1aa', '#d4d4d8', '#f5f5f5'][s];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>Security Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Update your administrative credentials and security policy.</p>
      </div>

      <div className="card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', color: '#d4d4d8' }}>
          <ShieldCheck size={28} />
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>Update Password</h3>
        </div>

        <div className="glass-plate" style={{ padding: '16px', marginBottom: '32px', display: 'flex', gap: '12px', borderColor: 'rgba(255, 255, 255, 0.14)' }}>
          <AlertCircle size={20} color="#a1a1aa" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: '#d4d4d8', lineHeight: '1.5' }}>
            <strong>Security Policy:</strong> Passwords must be at least 12 characters and score &quot;Strong&quot; (3/4) on our complexity meter to protect system integrity.
          </p>
        </div>

        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 12 characters"
                className="glass-input"
                style={{ width: '100%', padding: '14px 48px 14px 48px' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Strength Meter */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', gap: '4px', height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'rgba(255,255,255,0.08)', marginBottom: '8px' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ flex: 1, backgroundColor: i < score ? getStrengthColor(score) : 'transparent' }}></div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '12px', fontWeight: '700', color: getStrengthColor(score) }}>
                    {newPassword.length > 0 ? ['Very Weak', 'Weak', 'So-so', 'Strong', 'Excellent!'][score] : 'Enter a password'}
                 </span>
                 {score < 3 && newPassword.length > 0 && (
                   <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: '600' }}>Requirements not met</span>
                 )}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="glass-input"
                style={{ width: '100%', padding: '14px 14px 14px 48px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || score < 3 || newPassword !== confirmPassword}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              border: 'none',
              cursor: loading || score < 3 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              opacity: loading || score < 3 || newPassword !== confirmPassword ? 0.55 : 1,
            }}
          >
            <Save size={20} />
            {loading ? 'Securing Identity...' : 'Update Admin Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
