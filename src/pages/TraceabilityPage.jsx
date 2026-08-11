import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Sprout, ShieldCheck, CheckCircle2 } from 'lucide-react';

const TraceabilityPage = () => {
  const { hash } = useParams();
  const [searchParams] = useSearchParams();
  const { plantingZones, farmLogs, inventory, batches, addBatch } = useAppContext();

  // Retrieve data from URL query params (if scanned by phone) or local storage
  const urlPuc = searchParams.get('puc');
  const urlYield = searchParams.get('yield');
  const urlDate = searchParams.get('date');
  const urlStart = searchParams.get('start');
  const urlFarmer = searchParams.get('farmer');
  const urlCrop = searchParams.get('crop');

  const currentBatch = batches?.find(b => b.hash === hash) || {
    cropName: urlCrop,
    pucCode: urlPuc,
    yieldAmt: urlYield,
    harvestDate: urlDate,
    startDate: urlStart,
    farmerName: urlFarmer
  };
  
  const activePucCode = currentBatch?.pucCode || plantingZones[0]?.puc_code;
  const zone = plantingZones.find(z => z.puc_code === activePucCode) || plantingZones[0];
  const logs = farmLogs.filter(l => l.puc_code === zone?.puc_code).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  const calculateDefaultStartDate = (pucCode) => {
    const zoneLogs = farmLogs.filter(l => l.puc_code === pucCode && l.action_type === 'Thu hoạch').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (zoneLogs.length > 0) {
      return new Date(zoneLogs[0].timestamp).toISOString().split('T')[0];
    }
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split('T')[0];
  };

  const [generatedHash, setGeneratedHash] = React.useState('BATCH-DEMO123');
  const [formData, setFormData] = React.useState({
    cropName: zone?.crop_type || '',
    pucCode: zone?.puc_code || '',
    harvestDate: new Date().toISOString().split('T')[0],
    startDate: calculateDefaultStartDate(zone?.puc_code || ''),
    yieldAmt: 1000,
    farmerName: ''
  });

  const availableFarmers = [...new Set(farmLogs.filter(l => l.puc_code === formData.pucCode).map(l => l.operator_name).filter(Boolean))];

  React.useEffect(() => {
    if (availableFarmers.length > 0 && !availableFarmers.includes(formData.farmerName)) {
      setFormData(prev => ({ ...prev, farmerName: availableFarmers[0] }));
    }
  }, [formData.pucCode, farmLogs]);

  React.useEffect(() => {
    setFormData(prev => ({ ...prev, startDate: calculateDefaultStartDate(prev.pucCode) }));
  }, [formData.pucCode, farmLogs]);

  React.useEffect(() => {
    const selectedZone = plantingZones.find(z => z.puc_code === formData.pucCode);
    if (selectedZone && selectedZone.crop_type) {
      setFormData(prev => ({ ...prev, cropName: selectedZone.crop_type }));
    }
  }, [formData.pucCode, plantingZones]);

  // Check if we are viewing the public page (not logged in) or generating it
  const isGenerating = !hash;
  
  // Embed data directly into the QR URL so the phone can read it without a backend database
  const qrUrl = isGenerating 
    ? `${window.location.origin}/trace/${generatedHash}?puc=${formData.pucCode}&yield=${formData.yieldAmt}&date=${formData.harvestDate}&start=${formData.startDate}&farmer=${encodeURIComponent(formData.farmerName)}&crop=${encodeURIComponent(formData.cropName)}`
    : window.location.href;

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_Code_${generatedHash}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (isGenerating) {
    return (
      <div className="animate-fade-in">
        <h2 style={{ marginBottom: 'var(--spacing-6)' }}>Tạo Mã QR Truy Xuất Nguồn Gốc</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Thông tin lô hàng</h3>
            <div className="input-group">
              <label className="input-label">Tên trái cây / Sản phẩm</label>
              <input type="text" className="input-field" value={formData.cropName} onChange={e => setFormData({...formData, cropName: e.target.value})} placeholder="VD: Sầu riêng Ri6" />
            </div>
            <div className="input-group">
              <label className="input-label">Mã Vùng Trồng (PUC)</label>
              <select className="input-field" value={formData.pucCode} onChange={e => setFormData({...formData, pucCode: e.target.value})}>
                {plantingZones.map(z => <option key={z.id} value={z.puc_code}>{z.puc_code} - {z.zone_name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Tên người trồng</label>
              <select className="input-field" value={formData.farmerName} onChange={e => setFormData({...formData, farmerName: e.target.value})}>
                <option value="">-- Chọn người trồng --</option>
                {availableFarmers.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Ngày bắt đầu chu kỳ</label>
              <input type="date" className="input-field" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Ngày thu hoạch</label>
              <input type="date" className="input-field" value={formData.harvestDate} onChange={e => setFormData({...formData, harvestDate: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Sản lượng đóng gói (kg)</label>
              <input type="number" className="input-field" value={formData.yieldAmt} onChange={e => setFormData({...formData, yieldAmt: Number(e.target.value)})} />
            </div>
            <button 
              type="button"
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
              onClick={() => {
                const newHash = 'BATCH-' + Date.now().toString(36).toUpperCase();
                setGeneratedHash(newHash);
                addBatch({
                  hash: newHash,
                  cropName: formData.cropName,
                  pucCode: formData.pucCode,
                  startDate: formData.startDate,
                  harvestDate: formData.harvestDate,
                  yieldAmt: formData.yieldAmt,
                  farmerName: formData.farmerName
                });
                alert('Khởi tạo Lô hàng và Mã QR thành công!');
              }}
            >
              Tạo lô & Mã QR
            </button>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ marginBottom: 'var(--spacing-4)', alignSelf: 'flex-start' }}>Mã QR của lô hàng</h3>
            <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: 'var(--spacing-4)' }}>
              <QRCodeCanvas id="qr-canvas" value={qrUrl} size={200} />
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-4)' }}>
              Quét mã này để xem thông tin truy xuất nguồn gốc.
            </p>
            <div className="flex gap-2" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to={`/trace/${generatedHash}?puc=${formData.pucCode}&yield=${formData.yieldAmt}&date=${formData.harvestDate}&start=${formData.startDate}&farmer=${encodeURIComponent(formData.farmerName)}&crop=${encodeURIComponent(formData.cropName)}`} target="_blank" className="btn btn-outline">Mở trang truy xuất</Link>
              <button className="btn btn-outline" onClick={downloadQRCode}>Tải ảnh QR</button>
              <button className="btn btn-primary" onClick={() => window.print()}>In Tem Nhãn</button>
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
              <h2 style={{ color: 'var(--primary-dark)', marginBottom: '4px', fontSize: '1.5rem' }}>{currentBatch?.cropName || zone?.crop_type || 'N/A'}</h2>
              <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={16} /> {zone?.location_address || 'N/A'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 600, backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '4px 12px', borderRadius: '50px' }}>
                <ShieldCheck size={18} /> An toàn (Đạt chuẩn PHI)
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Mã lô: {hash?.toUpperCase() || 'N/A'}</p>
            </div>
          </div>
          
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Mã vùng trồng</p>
              <p style={{ fontWeight: 600 }}>{zone?.puc_code}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sản lượng</p>
              <p style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>{currentBatch?.yieldAmt ? `${currentBatch.yieldAmt} kg` : 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Người trồng</p>
              <p style={{ fontWeight: 600 }}>{currentBatch?.farmerName || [...new Set(logs.map(log => log.operator_name).filter(Boolean))].join(', ') || 'Đang cập nhật'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Ngày thu hoạch</p>
              <p style={{ fontWeight: 600 }}>{currentBatch?.harvestDate ? new Date(currentBatch.harvestDate).toLocaleDateString('vi-VN') : '10/08/2026'}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tiêu chuẩn</p>
              <p style={{ fontWeight: 600 }}>VietGAP</p>
            </div>
            
            <div style={{ gridColumn: '1 / -1', backgroundColor: 'var(--surface)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Chu kỳ chăm sóc lô hàng</p>
              <p style={{ fontWeight: 600, color: 'var(--primary-dark)', marginTop: '4px' }}>
                {currentBatch?.startDate ? new Date(currentBatch.startDate).toLocaleDateString('vi-VN') : 'Đang cập nhật'} - {currentBatch?.harvestDate ? new Date(currentBatch.harvestDate).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <h3 style={{ marginBottom: 'var(--spacing-4)', paddingLeft: 'var(--spacing-2)' }}>Nhật ký quá trình canh tác lô hàng</h3>
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ position: 'relative', borderLeft: '2px solid var(--border)', paddingLeft: '24px', marginLeft: '12px' }}>
            
            {logs.filter(log => {
              const batchStartDate = currentBatch?.startDate;
              const batchHarvestDate = currentBatch?.harvestDate;
              if (!batchStartDate || !batchHarvestDate) return true;
              const logTime = new Date(log.timestamp).getTime();
              const startTime = new Date(batchStartDate).getTime();
              const endTime = new Date(batchHarvestDate).getTime() + 86400000; // plus 1 day to include end of day
              return logTime >= startTime && logTime <= endTime;
            }).map((log, index, arr) => {
              const item = inventory.find(i => i.id === log.inventory_item_id);
              const date = new Date(log.timestamp).toLocaleDateString('vi-VN');
              return (
                <div key={log.log_id} style={{ position: 'relative', marginBottom: index === arr.length - 1 ? 0 : '32px' }}>
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
