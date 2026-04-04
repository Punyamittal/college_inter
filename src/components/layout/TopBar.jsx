import React, { useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuthContext } from '../../auth/AuthContext';

const TopBar = ({ toggleSidebar }) => {
  const { admin, logout } = useAuthContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
  };

  return (
    <header
      className="glass-topbar"
      style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 997,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button
          type="button"
          onClick={toggleSidebar}
          className="icon-btn-tilt"
          style={{
            border: 'none',
            cursor: 'pointer',
            color: '#e2e8f0',
            padding: '10px',
            display: 'flex',
            background: 'transparent',
          }}
        >
          <Menu size={24} />
        </button>
        <div style={{ position: 'relative', maxWidth: '400px', width: '100%', display: 'none', md: 'block' }}>
           {/* Desktop search - optionally hidden on small mobile */}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          className="profile-chip"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '14px',
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          onKeyDown={(e) => e.key === 'Escape' && setShowProfileMenu(false)}
          role="button"
          tabIndex={0}
        >
           <div
             style={{
               width: '38px',
               height: '38px',
               borderRadius: '12px',
               background: 'var(--gradient-accent)',
               color: '#fff',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontWeight: 'bold',
               boxShadow: '0 6px 18px rgba(99, 102, 241, 0.45)',
             }}
           >
              {admin?.email?.charAt(0).toUpperCase()}
           </div>
           <div className="topbar-profile-text">
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#f4f4f5' }}>College Interface</p>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>{admin?.email}</p>
           </div>

           {showProfileMenu && (
             <div
               className="glass-dropdown"
               style={{
                 position: 'absolute',
                 top: 'calc(100% + 12px)',
                 right: 0,
                 width: '240px',
                 borderRadius: '16px',
                 overflow: 'hidden',
                 zIndex: 1001,
               }}
             >
                <div
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                   <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#f1f5f9' }}>Access Control</p>
                   <p style={{ fontSize: '11px', color: '#94a3b8' }}>College Interface session</p>
                </div>
                <div style={{ padding: '8px' }}>
                   <button type="button" onClick={handleLogout} disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', cursor: loading ? 'wait' : 'pointer', color: '#d4d4d8', borderRadius: '10px', fontSize: '13px', transition: 'background 0.2s' }} onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
                      <LogOut size={16} />
                      {loading ? 'Processing...' : 'Secure Sign Out'}
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
