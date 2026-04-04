import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BarChart2, Store, Users, MapPin, 
  Settings, LogOut, ChevronRight, LayoutDashboard,
  Layers, Package, MonitorPlay, X
} from 'lucide-react';
import { useAuthContext } from '../../auth/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Analytics', icon: BarChart2, path: '/analytics' },
    { name: 'Orders', icon: MonitorPlay, path: '/orders' },
    { name: 'Locations', icon: MapPin, path: '/locations' },
    { name: 'Shops', icon: Store, path: '/shops' },
    { name: 'Categories', icon: Layers, path: '/categories' },
    { name: 'Vendors', icon: Users, path: '/vendors' },
  ];

  const handleLogout = async () => {
    const { success } = await logout();
    if (success) navigate('/login');
  };

  const sidebarStyle = {
    width: '260px',
    color: '#CBD5E1',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, margin-left 0.3s ease',
    flexShrink: 0,
    zIndex: 1000,
    // Mobile Overrides
    position: isMobile ? 'fixed' : 'sticky',
    top: 0,
    left: 0,
    height: '100vh',
    transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
    boxShadow: isMobile && isOpen ? '10px 0 30px rgba(0,0,0,0.5)' : 'none'
  };

  return (
    <div className="admin-sidebar" style={sidebarStyle}>
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'var(--gradient-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <Package size={20} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>College Interface</span>
        </div>
        {isMobile && (
          <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
             <X size={24} />
          </button>
        )}
      </div>

      <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => isMobile && toggleSidebar()}
            className={({ isActive }) =>
              `nav-pill admin-sidebar-nav-item${isActive ? ' nav-pill-active' : ''}`
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              textDecoration: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <item.icon size={20} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.name}</span>
            </div>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '20px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={handleLogout}
          className="nav-pill"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            background: 'rgba(255, 255, 255, 0.06)',
            color: '#d4d4d8',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.transform = 'translateX(4px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'
            e.currentTarget.style.transform = 'none'
          }}
        >
          <LogOut size={20} />
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Logout Panel</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
