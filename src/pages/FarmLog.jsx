import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Camera, Mic, Tractor, Droplet, Bug, Scissors, Wheat, X, MapPin } from 'lucide-react';
import Tesseract from 'tesseract.js';

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
    cropName: '',
    puc_code: '',
    detected_item_name: '',
    quantity_used: '',
    notes: '',
    photo_url: '',
    location: null,
  });
  const [isScanning, setIsScanning] = useState(false);

  const activeZones = plantingZones.filter(z => z.status === 'Active');

  // Auto-fetch GPS and set default PUC when action is selected
  useEffect(() => {
    if (showAddLog && selectedAction) {
      if (activeZones.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          puc_code: activeZones[0].puc_code, 
          cropName: activeZones[0].crop_type 
        }));
      }

      if (navigator.geolocation && !formData.location) {
        setFormData(prev => ({ ...prev, location: 'loading' }));
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFormData(prev => ({ 
              ...prev, 
              location: { 
                lat: position.coords.latitude, 
                lng: position.coords.longitude 
              } 
            }));
          },
          (error) => {
            setFormData(prev => ({ ...prev, location: null }));
          },
          { enableHighAccuracy: true }
        );
      }
    }
  }, [showAddLog, selectedAction, activeZones]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addFarmLog({
        cropName: formData.cropName,
        puc_code: formData.puc_code,
        action_type: selectedAction.name,
        timestamp: new Date().toISOString(),
        inventory_item_id: formData.detected_item_name || null,
        quantity_used: Number(formData.quantity_used) || 0,
        operator_name: user?.name,
        photo_url: formData.photo_url,
        notes: formData.notes,
        location: formData.location !== 'loading' ? formData.location : null
      });
      setShowAddLog(false);
      setSelectedAction(null);
      setErrorMsg('');
      setFormData({ cropName: '', puc_code: '', detected_item_name: '', quantity_used: '', notes: '', photo_url: '', location: null });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setFormData(prev => ({ ...prev, notes: prev.notes ? prev.notes + ' ' + transcript : transcript }));
        };
        
        recognition.onerror = (event) => {
          alert(`Lỗi nhận diện giọng nói: ${event.error}. Vui lòng cấp quyền Micro hoặc thử lại.`);
        };
        
        recognition.start();
      } catch (err) {
        alert("Có lỗi xảy ra khi khởi động Micro. Vui lòng thử lại.");
      }
    } else {
      alert("Trình duyệt điện thoại của bạn không hỗ trợ nhận diện giọng nói (Ví dụ: một số bản iOS cũ hoặc trình duyệt nhúng). Vui lòng gõ tay.");
    }
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image using canvas to fit in Firestore 1MB limit
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 70% quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setFormData(prev => ({ ...prev, photo_url: compressedDataUrl }));

          if (['Bón phân', 'Phun thuốc'].includes(selectedAction?.name)) {
            setIsScanning(true);
            setFormData(prev => ({ ...prev, detected_item_name: 'AI đang phân tích ảnh...' }));
            Tesseract.recognize(
              compressedDataUrl,
              'vie+eng'
            ).then(({ data: { text } }) => {
              setIsScanning(false);
              const detected = text.split('\n').filter(t => t.trim().length > 2).slice(0, 2).join(' - ');
              setFormData(prev => ({ ...prev, detected_item_name: detected || '[Không nhận diện được tên]' }));
            }).catch(err => {
              setIsScanning(false);
              setFormData(prev => ({ ...prev, detected_item_name: '[Lỗi phân tích AI]' }));
            });
          }
        };
      };
      reader.readAsDataURL(file);
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
            
            {needsInventory && (
              <>
                <div className="input-group">
                  <label className="input-label" style={{ fontSize: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    Tên vật tư (AI tự động nhận diện)
                    {isScanning && <span style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>Đang quét AI...</span>}
                  </label>
                  <input type="text" className="input-field" style={{ padding: '12px', fontSize: '1rem', backgroundColor: 'var(--surface-hover)' }} value={formData.detected_item_name} onChange={e => setFormData({...formData, detected_item_name: e.target.value})} placeholder="Vui lòng chụp ảnh bao bì để AI nhận diện..." />
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

            <div className="input-group" style={{ display: 'none' }}>
              <label className="input-label" style={{ fontSize: '1rem', display: 'flex', flexDirection: 'column' }}>
                Định vị bản đồ (GPS)
              </label>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ fontSize: '1rem', display: 'flex', flexDirection: 'column' }}>
                Ảnh minh chứng
                {formData.photo_url && (
                  <img src={formData.photo_url} alt="Minh chứng" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} />
                )}
              </label>
              
              <label className="btn btn-outline" style={{ width: '100%', padding: '16px', display: 'flex', gap: '8px', borderStyle: 'dashed', cursor: 'pointer', justifyContent: 'center' }}>
                <Camera size={24} /> {formData.photo_url ? 'Chụp lại ảnh' : 'Chụp ảnh minh chứng'}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  style={{ display: 'none' }} 
                  onChange={handlePhotoCapture}
                />
              </label>
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
                <p><strong>Sản phẩm:</strong> {log.cropName || zone?.crop_type || 'N/A'}</p>
                <p><strong>Người thực hiện:</strong> {log.operator_name}</p>
                {item ? (
                  <p><strong>Vật tư:</strong> {item.item_name} (Dùng: {log.quantity_used} {item.unit})</p>
                ) : log.inventory_item_id ? (
                  <p><strong>Vật tư:</strong> {log.inventory_item_id} (Dùng: {log.quantity_used})</p>
                ) : null}
                {log.location && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                    <MapPin size={16} /> 
                    <a href={`https://www.google.com/maps/search/?api=1&query=${log.location.lat},${log.location.lng}`} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                      Xem vị trí trên bản đồ
                    </a>
                  </p>
                )}
                {log.notes && (
                  <p style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{log.notes}"</p>
                )}
                {log.photo_url && (
                  <img src={log.photo_url} alt="Hình ảnh minh chứng" style={{ width: '100%', maxWidth: '200px', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginTop: '8px', border: '1px solid var(--border)' }} />
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
