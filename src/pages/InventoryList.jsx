import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

const InventoryList = () => {
  const { inventory, addInventoryItem, updateStock, user } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  
  const [formData, setFormData] = useState({
    item_name: '', category: 'Phân bón', active_ingredient: '',
    unit: 'kg', current_stock: '', min_threshold: '',
    expiry_date: '', supplier: '', phi_days: '0',
    dosage: '', purpose: '', usage_method: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    try {
      addInventoryItem({
        ...formData,
        current_stock: Number(formData.current_stock),
        min_threshold: Number(formData.min_threshold),
        phi_days: Number(formData.phi_days)
      });
      setShowAddModal(false);
      setErrorMsg('');
      setFormData({
        item_name: '', category: 'Phân bón', active_ingredient: '',
        unit: 'kg', current_stock: '', min_threshold: '',
        expiry_date: '', supplier: '', phi_days: '0',
        dosage: '', purpose: '', usage_method: ''
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleAdjustStock = (e) => {
    e.preventDefault();
    if (selectedItem) {
      updateStock(selectedItem.id, Number(adjustAmount));
      setShowAdjustModal(false);
      setAdjustAmount('');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2>Quản lý Kho Vật Tư</h2>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Nhập lô mới
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 600 }}>Tên vật tư</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 600 }}>Phân loại</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 600 }}>Hoạt chất</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 600, minWidth: '200px' }}>Hướng dẫn sử dụng</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 600 }}>Tồn kho</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 600 }}>Hạn sử dụng</th>
              {user?.role === 'admin' && <th style={{ padding: 'var(--spacing-4)', fontWeight: 600 }}>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => {
              const isLowStock = item.current_stock <= item.min_threshold;
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 'var(--spacing-4)' }}>
                    <div style={{ fontWeight: 500 }}>{item.item_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.supplier}</div>
                  </td>
                  <td style={{ padding: 'var(--spacing-4)' }}>{item.category}</td>
                  <td style={{ padding: 'var(--spacing-4)' }}>
                    <span className="badge badge-neutral">{item.active_ingredient}</span>
                  </td>
                  <td style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem' }}>
                    {item.purpose && <div style={{marginBottom: '4px'}}><strong style={{color: 'var(--primary)'}}>Mục đích:</strong> {item.purpose}</div>}
                    {item.usage_method && <div style={{marginBottom: '4px'}}><strong style={{color: 'var(--primary)'}}>Cách dùng:</strong> {item.usage_method}</div>}
                    {item.dosage && <div><strong style={{color: 'var(--primary)'}}>Liều lượng:</strong> {item.dosage}</div>}
                  </td>
                  <td style={{ padding: 'var(--spacing-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: isLowStock ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {item.current_stock} {item.unit}
                      </span>
                      {isLowStock && <AlertTriangle size={16} color="var(--danger)" title="Dưới ngưỡng an toàn" />}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--spacing-4)' }}>{item.expiry_date}</td>
                  {user?.role === 'admin' && (
                    <td style={{ padding: 'var(--spacing-4)' }}>
                      <div className="flex gap-2">
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => { setSelectedItem(item); setShowAdjustModal(true); }}>
                          <ArrowDownToLine size={16} title="Nhập thêm" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nhập Vật Tư Mới</h3>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                {errorMsg && (
                  <div style={{ gridColumn: '1 / -1', padding: 'var(--spacing-3)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)' }}>
                    {errorMsg}
                  </div>
                )}
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Tên vật tư</label>
                  <input type="text" className="input-field" required value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Phân loại</label>
                  <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option>Phân bón</option>
                    <option>Thuốc BVTV</option>
                    <option>Hạt giống</option>
                    <option>Giá thể</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Hoạt chất chính</label>
                  <input type="text" className="input-field" required value={formData.active_ingredient} onChange={e => setFormData({...formData, active_ingredient: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Số lượng</label>
                  <input type="number" className="input-field" required value={formData.current_stock} onChange={e => setFormData({...formData, current_stock: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Đơn vị (kg, lít, chai...)</label>
                  <input type="text" className="input-field" required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Ngưỡng báo động (Min)</label>
                  <input type="number" className="input-field" required value={formData.min_threshold} onChange={e => setFormData({...formData, min_threshold: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Thời gian cách ly PHI (ngày)</label>
                  <input type="number" className="input-field" required value={formData.phi_days} onChange={e => setFormData({...formData, phi_days: e.target.value})} disabled={formData.category !== 'Thuốc BVTV' && formData.category !== 'Phân bón'} />
                </div>
                <div className="input-group">
                  <label className="input-label">Hạn sử dụng</label>
                  <input type="date" className="input-field" required value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Nhà cung cấp</label>
                  <input type="text" className="input-field" required value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Liều lượng dùng (Tùy chọn)</label>
                  <input type="text" className="input-field" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} placeholder="VD: Pha 25ml/ 25 lít nước" />
                </div>
                <div className="input-group">
                  <label className="input-label">Mục đích sử dụng (Tùy chọn)</label>
                  <input type="text" className="input-field" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} placeholder="VD: Ngừa nấm, phục hồi rễ..." />
                </div>
                <div className="input-group">
                  <label className="input-label">Cách sử dụng (Tùy chọn)</label>
                  <input type="text" className="input-field" value={formData.usage_method} onChange={e => setFormData({...formData, usage_method: e.target.value})} placeholder="VD: Phun, tưới gốc..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu kho</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdjustModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowAdjustModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Nhập thêm hàng</h3>
            </div>
            <form onSubmit={handleAdjustStock}>
              <div className="modal-body">
                <p style={{ marginBottom: 'var(--spacing-4)' }}>Vật tư: <strong>{selectedItem.item_name}</strong></p>
                <div className="input-group">
                  <label className="input-label">Số lượng nhập thêm ({selectedItem.unit})</label>
                  <input type="number" className="input-field" required value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAdjustModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
