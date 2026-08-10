import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Camera, Mic, Tractor, Droplet, Bug, Scissors, Wheat, X } from 'lucide-react';

const ACTION_TYPES = [
  { id: 'lam_dat', name: 'Làm đất', icon: Tractor, color: '#3B82F6' },
  { id: 'gieo_hat', name: 'Gieo hạt', icon: Sprout, color: '#10B981' },
  { id: 'bon_phan', name: 'Bón phân', icon: Droplet, color: '#F59E0B' },
  { id: 'phun_thuoc', name: 'Phun thuốc', icon: Bug, color: '#EF4444' },
  { id: 'tia_canh', name: 'Tỉa cành', icon: Scissors, color: '#6366F1' },
  { id: 'thu_hoach', name: 'Thu hoạch', icon: Wheat, color: '#F59E0B' },
];

// Helper icon component since Sprout wasn't imported properly above for the array
import { Sprout } from 'lucide-react';

const FarmLog = () => {
  const { farmLogs, addFarmLog, plantingZones, inventory, user } = useAppContext();
  const [showAddLog, setShowAddLog] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    puc_code: '',
    inventory_item_id: '',
    quantity_used: '',
    notes: '',
  });

  const activeZones = plantingZones.filter(z => z.status === 'Active');

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      addFarmLog({
        puc_code: formData.puc_code,
        action_type: selectedAction.name,
        timestamp: new Date().toISOString(),
        inventory_item_id: formData.inventory_item_id || null,
        quantity_used: Number(formData.quantity_used) || 0,
        operator_name: user?.name,
        photo_url: '',
        notes: formData.notes
      });
      setShowAddLog(false);
      setSelectedAction(null);
      setErrorMsg('');
      setFormData({ puc_code: '', inventory_item_id: '', quantity_used: '', notes: '' });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setFormData(prev => ({ ...prev, notes: prev.notes + ' ' + transcript }));
      };
      recognition.onerror = () => {
        alert("Lỗi nhận diện giọng nói");
      };
    } else {
      alert("Trình duyệt không hỗ trợ nhập liệu bằng giọng nói");
    }
  };

  if (showAddLog && !selectedAction) {
    return (
      <div className="animate-fade-in" style={{ padding: 'var(--spacing-4)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2>Chọn công việc</h2>
          <button className="btn btn-outline" onClick={() => setShowAddLog(false)} style={{ borderRadius: '50%', padding: '8px' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--spacing-4)' }}>
          {ACTION_TYPES.map(action => (
            <button 
              key={action.id}
              onClick={() => setSelectedAction(action)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: 'var(--spacing-6)', backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
                gap: 'var(--spacing-3)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: `${action.color}20`, color: action.color }}>
                <action.icon size={32} />
              </div>
              <span style={{ fontWeight: 600, fontSize: '1rem' }}>{action.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (showAddLog && selectedAction) {
    const needsInventory = ['Bón phân', 'Phun thuốc'].includes(selectedAction.name);
    const filterCategory = selectedAction.name === 'Bón phân' ? 'Phun bón' : (selectedAction.name === 'Phun thuốc' ? 'Thuốc BVTV' : null);
    const availableItems = filterCategory ? inventory.filter(i => i.category === filterCategory || (selectedAction.name === 'Bón phân' && i.category === 'Phân bón')) : [];

    return (
      <div className="animate-fade-in" style={{ padding: 'var(--spacing-4)', maxWidth: '600px', margin: '0 auto' }}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button className="btn btn-outline" onClick={() => setSelectedAction(null)} style={{ borderRadius: '50%', padding: '8px' }}>
              <X size={20} />
            </button>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <selectedAction.icon color={selectedAction.color} /> 
              {selectedAction.name}
            </h2>
          </div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {errorMsg && (
              <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', fontWeight: 500 }}>
                {errorMsg}
              </div>
            )}
            
            <div className="input-group">
              <label className="input-label" style={{ fontSize: '1rem' }}>Chọn vùng trồng (PUC)</label>
              <select className="input-field" style={{ padding: '12px', fontSize: '1rem' }} required value={formData.puc_code} onChange={e => setFormData({...formData, puc_code: e.target.value})}>
                <option value="">-- Chọn lô đất --</option>
                {activeZones.map(zone => (
                  <option key={zone.id} value={zone.puc_code}>{zone.puc_code} - {zone.zone_name}</option>
                ))}
              </select>
            </div>

            {needsInventory && (
              <>
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: '1rem' }}>Sử dụng vật tư</label>
                  <select className="input-field" style={{ padding: '12px', fontSize: '1rem' }} required value={formData.inventory_item_id} onChange={e => setFormData({...formData, inventory_item_id: e.target.value})}>
                    <option value="">-- Chọn loại vật tư --</option>
                    {availableItems.map(item => (
                      <option key={item.id} value={item.id}>{item.item_name} (Tồn: {item.current_stock} {item.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: '1rem' }}>Số lượng/Liều lượng</label>
                  <input type="number" className="input-field" style={{ padding: '12px', fontSize: '1rem' }} required step="0.1" value={formData.quantity_used} onChange={e => setFormData({...formData, quantity_used: e.target.value})} />
                </div>
              </>
            )}

            <div className="input-group">
              <label className="input-label" style={{ fontSize: '1rem' }}>Ghi chú / Nhập bằng giọng nói</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="input-field" style={{ padding: '12px', fontSize: '1rem' }} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Ghi chú thêm..." />
                <button type="button" className="btn btn-outline" onClick={startVoiceInput} style={{ padding: '12px' }} title="Nhập giọng nói">
                  <Mic size={24} color="var(--primary)" />
                </button>
              </div>
            </div>

            <div className="input-group">
              <button type="button" className="btn btn-outline" style={{ width: '100%', padding: '16px', display: 'flex', gap: '8px', borderStyle: 'dashed' }}>
                <Camera size={24} /> Chụp ảnh minh chứng
              </button>
            </div>

            <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%', marginTop: 'var(--spacing-4)', padding: '16px', fontSize: '1.125rem' }}>
              Lưu Nhật Ký
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2>Nhật ký Canh tác (FarmLog)</h2>
        <button className="btn btn-primary btn-large" onClick={() => setShowAddLog(true)} style={{ borderRadius: '50px', boxShadow: 'var(--shadow-md)' }}>
          <Plus size={20} /> Ghi nhật ký
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {farmLogs.slice().reverse().map(log => {
          const zone = plantingZones.find(z => z.puc_code === log.puc_code);
          const item = inventory.find(i => i.id === log.inventory_item_id);
          const date = new Date(log.timestamp).toLocaleString('vi-VN');
          
          let actionIcon = ACTION_TYPES.find(a => a.name === log.action_type)?.icon || Tractor;
          let actionColor = ACTION_TYPES.find(a => a.name === log.action_type)?.color || '#3B82F6';
          const IconComponent = actionIcon;

          return (
            <div key={log.log_id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ padding: '10px', borderRadius: '50%', backgroundColor: `${actionColor}20`, color: actionColor }}>
                  <IconComponent size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', margin: 0 }}>{log.action_type}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{date}</p>
                </div>
              </div>
              
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'grid', gap: '4px' }}>
                <p><strong>Vùng trồng:</strong> {zone ? `${zone.puc_code} - ${zone.zone_name}` : log.puc_code}</p>
                <p><strong>Người thực hiện:</strong> {log.operator_name}</p>
                {item && (
                  <p><strong>Vật tư:</strong> {item.item_name} (Dùng: {log.quantity_used} {item.unit})</p>
                )}
                {log.notes && (
                  <p style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{log.notes}"</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FarmLog;
