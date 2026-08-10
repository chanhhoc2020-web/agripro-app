import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Sprout, ShieldCheck, CheckCircle2 } from 'lucide-react';

const TraceabilityPage = () => {
  const { hash } = useParams();
  const { plantingZones, farmLogs, inventory } = useAppContext();

  // Mocking data retrieval based on hash
  // In a real app, we would fetch a HarvestBatch by public_hash_token
  // For demo, we just get the first PUC and its logs
  const zone = plantingZones[0];
  const logs = farmLogs.filter(l => l.puc_code === zone?.puc_code).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  const qrUrl = `${window.location.origin}/trace/${hash || 'demo-hash-123'}`;

  // Check if we are viewing the public page (not logged in) or generating it
  const isGenerating = !hash;

  if (isGenerating) {
    return (
      <div className="animate-fade-in">
        <h2 style={{ marginBottom: 'var(--spacing-6)' }}>Tạo Mã QR Truy Xuất Nguồn Gốc</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Thông tin lô hàng</h3>
            <div className="input-group">
              <label className="input-label">Mã Vùng Trồng (PUC)</label>
              <select className="input-field" defaultValue={zone?.puc_code}>
                {plantingZones.map(z => <option key={z.id} value={z.puc_code}>{z.puc_code} - {z.zone_name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Ngày thu hoạch</label>
              <input type="date" className="input-field" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="input-group">
              <label className="input-label">Sản lượng đóng gói (kg)</label>
              <input type="number" className="input-field" defaultValue={1000} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--spacing-2)' }}>Tạo lô & Mã QR</button>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ marginBottom: 'var(--spacing-4)', alignSelf: 'flex-start' }}>Mã QR của lô hàng</h3>
            <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: 'var(--spacing-4)' }}>
              <QRCodeSVG value={qrUrl} size={200} />
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)' }}>
              Quét mã này để xem thông tin truy xuất nguồn gốc.
            </p>
            <div className="flex gap-2">
              <Link to={`/trace/demo-hash-123`} target="_blank" className="btn btn-outline">Mở trang truy xuất</Link>
              <button className="btn btn-primary">In Tem Nhãn</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Public View
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', padding: '0', fontFamily: 'sans-serif' }}>
      {/* Header Banner */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: 'var(--spacing-8) var(--spacing-4)', textAlign: 'center', backgroundImage: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
        <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', marginBottom: '16px' }}>
          <Sprout size={48} color="white" />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>AgriPro Traceability</h1>
        <p style={{ opacity: 0.9 }}>Thông tin truy xuất nguồn gốc sản phẩm nông nghiệp</p>
      </div>

      <div className="container" style={{ maxWidth: '800px', marginTop: '-30px', position: 'relative', zIndex: 10 }}>
        {/* Product Info */}
        <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ color: 'var(--primary-dark)', marginBottom: '4px', fontSize: '1.5rem' }}>{zone?.crop_type || 'N/A'}</h2>
              <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={16} /> {zone?.location_address || 'N/A'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 600, backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '4px 12px', borderRadius: '50px' }}>
                <ShieldCheck size={18} /> An toàn (Đạt chuẩn PHI)
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Mã lô: BATCH-{hash?.substring(0,6).toUpperCase()}</p>
            </div>
          </div>
          
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Mã vùng trồng</p>
              <p style={{ fontWeight: 600 }}>{zone?.puc_code}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Ngày thu hoạch</p>
              <p style={{ fontWeight: 600 }}>10/08/2026</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tiêu chuẩn</p>
              <p style={{ fontWeight: 600 }}>VietGAP</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <h3 style={{ marginBottom: 'var(--spacing-4)', paddingLeft: 'var(--spacing-2)' }}>Nhật ký quá trình canh tác</h3>
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ position: 'relative', borderLeft: '2px solid var(--border)', paddingLeft: '24px', marginLeft: '12px' }}>
            
            {logs.map((log, index) => {
              const item = inventory.find(i => i.id === log.inventory_item_id);
              const date = new Date(log.timestamp).toLocaleDateString('vi-VN');
              return (
                <div key={log.log_id} style={{ position: 'relative', marginBottom: index === logs.length - 1 ? 0 : '32px' }}>
                  <div style={{ position: 'absolute', left: '-36px', top: 0, backgroundColor: 'var(--surface)', padding: '2px' }}>
                    <CheckCircle2 size={24} color="var(--primary)" fill="white" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{date}</span>
                    <h4 style={{ fontSize: '1.125rem', color: 'var(--text-primary)', marginTop: '4px' }}>{log.action_type}</h4>
                    {item && (
                      <p style={{ fontSize: '0.875rem', marginTop: '4px', backgroundColor: 'var(--background)', padding: '8px', borderRadius: '4px', display: 'inline-block' }}>
                        Sử dụng: {item.item_name}
                      </p>
                    )}
                    {log.notes && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            
            {logs.length === 0 && (
              <p style={{ color: 'var(--text-secondary)' }}>Chưa có nhật ký nào được ghi lại.</p>
            )}

          </div>
        </div>
      </div>
      
      <footer style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '32px' }}>
        <p>© 2026 AgriPro - Minh bạch & An toàn</p>
      </footer>
    </div>
  );
};

export default TraceabilityPage;
