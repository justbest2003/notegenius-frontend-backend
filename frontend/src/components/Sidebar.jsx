import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlinePlusCircle,
  HiOutlineLogout,
  HiOutlineSparkles,
  HiOutlineMenu,
  HiOutlineX
} from 'react-icons/hi';
import { useState } from 'react';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { to: '/dashboard', icon: <HiOutlineHome />, label: 'แดชบอร์ด' },
    { to: '/notes', icon: <HiOutlineDocumentText />, label: 'โน้ตทั้งหมด' },
    { to: '/notes/new', icon: <HiOutlinePlusCircle />, label: 'สร้างโน้ตใหม่' },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        id="sidebar-toggle"
      >
        {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <HiOutlineSparkles />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">NoteGenius</span>
            <span className="sidebar-logo-desc">AI Note-Taking</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {user?.displayName?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">
                {user?.displayName || 'ผู้ใช้'}
              </span>
              <span className="sidebar-user-email">{user?.email}</span>
            </div>
          </div>
          <button
            className="btn-icon sidebar-logout"
            onClick={handleLogout}
            title="ออกจากระบบ"
            id="logout-btn"
          >
            <HiOutlineLogout />
          </button>
        </div>
      </aside>
    </>
  );
}
