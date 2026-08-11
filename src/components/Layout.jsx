import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPin, Package, ClipboardList, LogOut, Menu, X, QrCode } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import '../index.css';

const Layout = () => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'farmer'] },
    { name: 'Vùng Trồng (PUC)', path: '/puc', icon: MapPin, roles: ['admin'] },
    { name: 'Kho Vật Tư', path: '/inventory', icon: Package, roles: ['admin', 'farmer'] },
    { name: 'Nhật Ký (FarmLog)', path: '/farmlog', icon: ClipboardList, roles: ['admin', 'farmer'] },
    { name: 'Tạo mã QR', path: '/qr-generate', icon: QrCode, roles: ['admin'] },
  ];

  const allowedNavItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', insetY: 0, left: 0, zIndex: 50,
        width: '256px', backgroundColor: 'var(--surface)', borderRight: '1px solid var(--border)',
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        display: 'flex', flexDirection: 'column'
      }} className="sidebar-desktop">
        
        <div style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.5rem', margin: 0 }}>AgriPro</h2>
          <button className="btn-close-mobile" onClick={() => setIsSidebarOpen(false)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          {allowedNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)',
                padding: 'var(--spacing-3) var(--spacing-4)', borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none'
              })}
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: 'var(--spacing-4)', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Xin chào,</p>
            <p style={{ fontWeight: 600 }}>{user?.name}</p>
            <span className={`badge ${user?.role === 'admin' ? 'badge-warning' : 'badge-success'}`}>
              {user?.role === 'admin' ? 'Quản trị viên' : 'Nông dân'}
            </span>
          </div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="main-content-wrapper">
        
        {/* Mobile Header */}
        <header style={{ 
          backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)',
          padding: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)'
        }} className="mobile-header">
          <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <Menu size={24} />
          </button>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)', margin: 0 }}>AgriPro</h1>
        </header>

        <main style={{ flex: 1, padding: 'var(--spacing-6)', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .sidebar-desktop {
            transform: translateX(0) !important;
          }
          .main-content-wrapper {
            margin-left: 256px;
          }
          .mobile-header {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .btn-close-mobile {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
