import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Sprout } from 'lucide-react';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('farmer'); // 'admin' | 'farmer'
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    try {
      if (role === 'admin') {
        login('admin', '', pin);
        navigate('/');
      } else {
        login('farmer', phone, pin);
        navigate('/farmlog');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      padding: 'var(--spacing-4)'
    }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '50%', 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)',
            marginBottom: 'var(--spacing-4)'
          }}>
            <Sprout size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>AgriPro</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Hệ thống Quản lý & Số hóa Nông nghiệp</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Vai trò</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-2)' }}>
              <button 
                type="button"
                onClick={() => setRole('farmer')}
                className={`btn ${role === 'farmer' ? 'btn-primary' : 'btn-outline'}`}
                style={{ width: '100%' }}
              >
                Nông dân
              </button>
              <button 
                type="button"
                onClick={() => setRole('admin')}
                className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                style={{ width: '100%' }}
              >
                Quản lý
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Số điện thoại</label>
            <input 
              type="tel" 
              className="input-field" 
              placeholder="Nhập số điện thoại..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Mã PIN (4 số)</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Nhập mã PIN..."
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%', marginTop: 'var(--spacing-4)' }}>
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
