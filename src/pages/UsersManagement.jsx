import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, User, MapPin, Key, Trash2, Edit } from 'lucide-react';

const UsersManagement = () => {
  const { users, addUser, updateUser, deleteUser, plantingZones, farmLogs } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pin: '',
    puc_code: '',
    role: 'farmer'
  });
  
  const [errorMsg, setErrorMsg] = useState('');

  const farmers = users.filter(u => u.role === 'farmer');

  const handleOpenAdd = () => {
    setFormData({ name: '', phone: '', pin: '', puc_code: '', role: 'farmer' });
    setEditingUserId(null);
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (user) => {
    setFormData(user);
    setEditingUserId(user.id);
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.pin.length !== 4) {
        throw new Error('Mã PIN phải có đúng 4 chữ số.');
      }
      if (!formData.puc_code) {
        throw new Error('Vui lòng chọn Mã vùng trồng cho nông dân này.');
      }

      if (editingUserId) {
        await updateUser(editingUserId, formData);
      } else {
        await addUser(formData);
      }
      setShowAddModal(false);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa tài khoản của ${name}?`)) {
      await deleteUser(id);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2>Quản lý Tài khoản Nông dân</h2>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Cấp tài khoản mới
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 600 }}>Nông dân</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 600 }}>Số ĐT (Tài khoản)</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 600 }}>Mã PIN</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 600 }}>Mã vùng trồng cấp phép</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 600 }}>Điểm Tín Nhiệm</th>
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 600 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {farmers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: 'var(--spacing-4)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Chưa có tài khoản nông dân nào. Hãy cấp tài khoản mới.
                </td>
              </tr>
            ) : (
              farmers.map(user => {
                const zone = plantingZones.find(z => z.puc_code === user.puc_code);
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 'var(--spacing-4)' }}>
                      <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={16} color="var(--primary)" /> {user.name}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--spacing-4)', fontWeight: 600 }}>{user.phone}</td>
                    <td style={{ padding: 'var(--spacing-4)' }}>
                       <span className="badge badge-neutral" style={{ letterSpacing: '2px' }}>{user.pin}</span>
                    </td>
                    <td style={{ padding: 'var(--spacing-4)' }}>
                      {zone ? (
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{zone.puc_code}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{zone.crop_type} ({zone.area} ha)</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--danger)' }}>Chưa gán / Lỗi</span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--spacing-4)' }}>
                      {(() => {
                        const userLogs = farmLogs.filter(l => l.operator_name === user.name);
                        const violationsCount = userLogs.filter(l => l.is_violation).length;
                        const validCount = userLogs.length - violationsCount;
                        const creditScore = 100 + (validCount * 2) - (violationsCount * 15);
                        let scoreColor = 'var(--success)';
                        if (creditScore < 80) scoreColor = 'var(--warning)';
                        if (creditScore < 50) scoreColor = 'var(--danger)';
                        
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontWeight: 700, color: scoreColor, fontSize: '1.25rem' }}>{creditScore}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({validCount} đúng - {violationsCount} vi phạm)</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td style={{ padding: 'var(--spacing-4)' }}>
                      <div className="flex gap-2">
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleOpenEdit(user)}>
                          <Edit size={16} title="Sửa" />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(user.id, user.name)}>
                          <Trash2 size={16} title="Xóa" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUserId ? 'Chỉnh sửa Tài khoản' : 'Cấp Tài khoản Mới'}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                {errorMsg && (
                  <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)' }}>
                    {errorMsg}
                  </div>
                )}
                
                <div className="input-group">
                  <label className="input-label">Họ và tên Nông dân</label>
                  <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Nguyễn Văn A" />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Số điện thoại (Dùng để đăng nhập)</label>
                  <input type="tel" className="input-field" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="VD: 0901234567" disabled={!!editingUserId} />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Mã PIN (Mật khẩu 4 số)</label>
                  <input type="text" maxLength={4} className="input-field" required value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value.replace(/[^0-9]/g, '')})} placeholder="VD: 1234" />
                </div>

                <div className="input-group">
                  <label className="input-label">Gán Mã vùng trồng (PUC)</label>
                  <select className="input-field" required value={formData.puc_code} onChange={e => setFormData({...formData, puc_code: e.target.value})}>
                    <option value="">-- Chọn vùng trồng --</option>
                    {plantingZones.map(zone => (
                      <option key={zone.id} value={zone.puc_code}>
                        {zone.puc_code} - {zone.crop_type} ({zone.area} ha)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingUserId ? 'Cập nhật' : 'Tạo tài khoản'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
