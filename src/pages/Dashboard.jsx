import React from 'react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Package, ClipboardList, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { plantingZones, inventory, farmLogs, user } = useAppContext();

  const activeZones = plantingZones.filter(z => z.status === 'Active').length;
  const lowStockItems = inventory.filter(i => i.current_stock <= i.min_threshold).length;
  
  if (user?.role === 'farmer') {
    return (
      <div className="animate-fade-in">
        <h2 style={{ marginBottom: 'var(--spacing-6)' }}>Tổng quan - Nông dân</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', borderRadius: 'var(--radius-lg)' }}>
              <ClipboardList size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nhật ký đã ghi</p>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{farmLogs.length}</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: 'var(--spacing-6)' }}>Tổng quan Hệ thống</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}>
            <MapPin size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Vùng trồng (PUC) Đang hoạt động</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{activeZones} / {plantingZones.length}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-lg)' }}>
            <Package size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Vật tư dưới ngưỡng</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{lowStockItems}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', borderRadius: 'var(--radius-lg)' }}>
            <ClipboardList size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tổng số nhật ký</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{farmLogs.length}</h3>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Cảnh báo hệ thống</h3>
        {lowStockItems > 0 ? (
          <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)' }}>
            <AlertTriangle size={20} />
            <p>Có {lowStockItems} loại vật tư đang dưới ngưỡng an toàn, cần nhập kho thêm.</p>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Không có cảnh báo nào.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
