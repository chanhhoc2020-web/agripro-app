import React from 'react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Package, ClipboardList, AlertTriangle, ShieldAlert } from 'lucide-react';

const Dashboard = () => {
  const { plantingZones, inventory, farmLogs, user, appConfig, updateAppConfig } = useAppContext();

  const activeZones = plantingZones.filter(z => z.status === 'Active').length;
  const lowStockItems = inventory.filter(i => i.current_stock <= i.min_threshold).length;
  
  if (user?.role === 'farmer') {
    const farmerLogsCount = farmLogs.filter(log => log.operator_name === user?.name).length;
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
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{farmerLogsCount}</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ margin: 0 }}>Tổng quan Hệ thống</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', backgroundColor: 'var(--surface)', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: appConfig?.strict_mode ? 'var(--danger)' : 'var(--text-secondary)' }}>
            Kỷ luật Nghiêm ngặt
          </span>
          <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
            <input 
              type="checkbox" 
              style={{ opacity: 0, width: 0, height: 0 }} 
              checked={appConfig?.strict_mode || false}
              onChange={(e) => updateAppConfig({ strict_mode: e.target.checked })}
            />
            <span style={{
              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: appConfig?.strict_mode ? 'var(--danger)' : '#ccc',
              transition: '.4s', borderRadius: '34px'
            }}>
              <span style={{
                position: 'absolute', content: '""', height: '18px', width: '18px', left: '3px', bottom: '3px',
                backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                transform: appConfig?.strict_mode ? 'translateX(20px)' : 'translateX(0)'
              }}></span>
            </span>
          </label>
        </div>
      </div>
      
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

      <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Cảnh báo hệ thống</h3>
        {lowStockItems > 0 ? (
          <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <AlertTriangle size={20} />
            <p>Có {lowStockItems} loại vật tư đang dưới ngưỡng an toàn, cần nhập kho thêm.</p>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>Không có cảnh báo nào.</p>
        )}
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert color="var(--danger)" /> Bảng Phong Thần (Giám sát Vi phạm)
        </h3>
        {(() => {
          const violations = farmLogs.filter(log => log.is_violation);
          if (violations.length === 0) {
            return <p style={{ color: 'var(--text-secondary)' }}>Không có nông dân nào vi phạm quy định.</p>;
          }
          return (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--background)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Thời gian</th>
                    <th style={{ padding: '12px' }}>Nông dân</th>
                    <th style={{ padding: '12px' }}>Vùng trồng</th>
                    <th style={{ padding: '12px' }}>Vật tư liên quan</th>
                    <th style={{ padding: '12px' }}>Lỗi vi phạm</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map(v => (
                    <tr key={v.log_id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}>{new Date(v.timestamp).toLocaleString('vi-VN')}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{v.operator_name}</td>
                      <td style={{ padding: '12px' }}>{v.puc_code}</td>
                      <td style={{ padding: '12px' }}>{v.item_name_text || v.inventory_item_id}</td>
                      <td style={{ padding: '12px', color: 'var(--danger)', fontWeight: 500 }}>{v.violation_reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Thống kê sử dụng vật tư theo Nông dân</h3>
        {(() => {
          const farmerStats = {};
          farmLogs.forEach(log => {
            if (log.operator_name && log.inventory_item_id) {
              if (!farmerStats[log.operator_name]) farmerStats[log.operator_name] = {};
              const itemId = log.inventory_item_id;
              if (!farmerStats[log.operator_name][itemId]) farmerStats[log.operator_name][itemId] = 0;
              farmerStats[log.operator_name][itemId] += Number(log.quantity_used) || 0;
            }
          });

          if (Object.keys(farmerStats).length === 0) {
            return <p style={{ color: 'var(--text-secondary)' }}>Chưa có dữ liệu ghi nhận sử dụng vật tư từ nông dân.</p>;
          }

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-4)' }}>
              {Object.entries(farmerStats).map(([farmerName, usageMap]) => (
                <div key={farmerName} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-4)' }}>
                  <h4 style={{ color: 'var(--primary-dark)', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    {farmerName}
                    <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--surface)', padding: '2px 8px', borderRadius: '50px', color: 'var(--text-secondary)' }}>
                      Dùng {Object.keys(usageMap).length} loại
                    </span>
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {Object.entries(usageMap).map(([itemId, totalQty]) => {
                      const itemInfo = inventory.find(i => i.id === itemId);
                      const displayName = itemInfo ? itemInfo.item_name : itemId;
                      const unit = itemInfo ? itemInfo.unit : '';
                      return (
                        <li key={itemId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                          <span>{displayName}</span>
                          <span style={{ fontWeight: 600 }}>{totalQty} {unit}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Dashboard;
