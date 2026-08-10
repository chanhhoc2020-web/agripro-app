import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Edit2, Trash2, Map } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const PUCList = () => {
  const { plantingZones, addZone, deleteZone } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    puc_code: '', zone_name: '', location_address: '',
    gps_coordinates: '', area_size: '', crop_type: '',
    target_market: '', estimated_yield: '', status: 'Active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addZone({
      ...formData,
      area_size: Number(formData.area_size),
      estimated_yield: Number(formData.estimated_yield)
    });
    setShowModal(false);
    setFormData({
      puc_code: '', zone_name: '', location_address: '',
      gps_coordinates: '', area_size: '', crop_type: '',
      target_market: '', estimated_yield: '', status: 'Active'
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2>Quản lý Mã Vùng Trồng (PUC)</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Thêm vùng trồng
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plantingZones.map((zone) => {
          const [lat, lng] = zone.gps_coordinates.split(',').map(Number);
          const hasValidCoords = !isNaN(lat) && !isNaN(lng);

          return (
            <div key={zone.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-2)' }}>
                <h3 style={{ fontSize: '1.125rem', color: 'var(--primary)' }}>{zone.puc_code}</h3>
                <span className={`badge ${zone.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                  {zone.status}
                </span>
              </div>
              <p style={{ fontWeight: 600, marginBottom: 'var(--spacing-2)' }}>{zone.zone_name}</p>
              
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)', flex: 1 }}>
                <p><strong>Cây trồng:</strong> {zone.crop_type}</p>
                <p><strong>Diện tích:</strong> {zone.area_size} ha</p>
                <p><strong>Sản lượng:</strong> {zone.estimated_yield.toLocaleString()} kg</p>
                <p><strong>Thị trường:</strong> {zone.target_market}</p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Map size={14} /> {zone.location_address}
                </p>
              </div>

              {hasValidCoords && (
                <div style={{ height: '150px', marginBottom: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[lat, lng]}>
                      <Popup>{zone.zone_name}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)', marginTop: 'auto' }}>
                <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}>
                  <Edit2 size={16} />
                </button>
                <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => deleteZone(zone.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm Vùng Trồng Mới</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                <div className="input-group">
                  <label className="input-label">Mã PUC</label>
                  <input type="text" className="input-field" required value={formData.puc_code} onChange={e => setFormData({...formData, puc_code: e.target.value})} placeholder="VD: PUC-VN-..." />
                </div>
                <div className="input-group">
                  <label className="input-label">Tên lô/vùng</label>
                  <input type="text" className="input-field" required value={formData.zone_name} onChange={e => setFormData({...formData, zone_name: e.target.value})} />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Địa chỉ</label>
                  <input type="text" className="input-field" required value={formData.location_address} onChange={e => setFormData({...formData, location_address: e.target.value})} />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Tọa độ GPS (Vĩ độ, Kinh độ)</label>
                  <input type="text" className="input-field" required value={formData.gps_coordinates} onChange={e => setFormData({...formData, gps_coordinates: e.target.value})} placeholder="11.1345, 107.2341" />
                </div>
                <div className="input-group">
                  <label className="input-label">Loại cây trồng</label>
                  <input type="text" className="input-field" required value={formData.crop_type} onChange={e => setFormData({...formData, crop_type: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Thị trường mục tiêu</label>
                  <input type="text" className="input-field" required value={formData.target_market} onChange={e => setFormData({...formData, target_market: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Diện tích (ha)</label>
                  <input type="number" step="0.1" className="input-field" required value={formData.area_size} onChange={e => setFormData({...formData, area_size: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Sản lượng dự kiến (kg)</label>
                  <input type="number" className="input-field" required value={formData.estimated_yield} onChange={e => setFormData({...formData, estimated_yield: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PUCList;
