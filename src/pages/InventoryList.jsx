import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Pencil, Download, Upload, History } from 'lucide-react';
import * as XLSX from 'xlsx';

const InventoryList = () => {
  const { inventory, inventoryLogs, addInventoryItem, updateStock, farmerInventory, addFarmerInventoryItem, updateFarmerStock, user, exportInventoryItem, updateInventoryItem, users } = useAppContext();
  const displayInventory = user?.role === 'admin' ? inventory : farmerInventory.filter(i => i.farmer_id === user?.id);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const fileInputRef = useRef(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState({
    farmer_id: '',
    quantity: '',
    unit_price: '',
    payment_status: 'Đã thanh toán',
    notes: ''
  });
  const farmersList = users ? users.filter(u => u.role === 'farmer') : [];
  
  const [formData, setFormData] = useState({
    item_name: '', category: 'Phân bón', active_ingredient: '',
    unit: 'kg', current_stock: '', min_threshold: '',
    import_price: '', selling_price: '',
    expiry_date: '', supplier: '', phi_days: '0',
    dosage: '', purpose: '', usage_method: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, item_name: val });
    
    if (user?.role === 'farmer' && val.length > 1) {
      const matches = inventory.filter(i => i.item_name.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (item) => {
    setFormData({
      ...formData,
      item_name: item.item_name,
      category: item.category || '',
      active_ingredient: item.active_ingredient || '',
      unit: item.unit || '',
      phi_days: item.phi_days || '0',
      dosage: item.dosage || '',
      purpose: item.purpose || '',
      usage_method: item.usage_method || '',
      supplier: item.supplier || '',
      import_price: item.import_price || '',
      selling_price: item.selling_price || ''
    });
    setShowSuggestions(false);
  };

  const handleEditItem = (item) => {
    setFormData({
      item_name: item.item_name || '',
      category: item.category || 'Phân bón',
      active_ingredient: item.active_ingredient || '',
      unit: item.unit || 'kg',
      current_stock: item.current_stock || '',
      min_threshold: item.min_threshold || '',
      import_price: item.import_price || '',
      selling_price: item.selling_price || '',
      expiry_date: item.expiry_date || '',
      supplier: item.supplier || '',
      phi_days: item.phi_days || '0',
      dosage: item.dosage || '',
      purpose: item.purpose || '',
      usage_method: item.usage_method || ''
    });
    setEditItemId(item.id);
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const newItem = {
        ...formData,
        current_stock: Number(formData.current_stock),
        min_threshold: Number(formData.min_threshold),
        phi_days: Number(formData.phi_days),
        import_price: Number(formData.import_price) || 0,
        selling_price: Number(formData.selling_price) || 0
      };

      if (user?.role === 'admin') {
        if (isEditMode) {
          await updateInventoryItem(editItemId, newItem);
        } else {
          await addInventoryItem(newItem);
        }
      } else {
        await addFarmerInventoryItem({ ...newItem, farmer_id: user.id });
      }

      setShowAddModal(false);
      setIsEditMode(false);
      setEditItemId(null);
      setErrorMsg('');
      setFormData({
        item_name: '', category: 'Phân bón', active_ingredient: '',
        unit: 'kg', current_stock: '', min_threshold: '',
        import_price: '', selling_price: '',
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
      if (user?.role === 'admin') {
        updateStock(selectedItem.id, Number(adjustAmount));
      } else {
        updateFarmerStock(selectedItem.id, Number(adjustAmount));
      }
      setShowAdjustModal(false);
      setAdjustAmount('');
    }
  };

  const handleExportStock = async (e) => {
    e.preventDefault();
    if (selectedItem) {
      try {
        await exportInventoryItem({
          global_inventory_id: selectedItem.id,
          farmer_id: exportData.farmer_id || null,
          quantity: Number(exportData.quantity),
          unit_price: Number(exportData.unit_price) || 0,
          total_price: (Number(exportData.quantity) * (Number(exportData.unit_price) || 0)),
          payment_status: exportData.payment_status,
          notes: exportData.notes
        });
        setShowExportModal(false);
        setExportData({ farmer_id: '', quantity: '', unit_price: '', payment_status: 'Đã thanh toán', notes: '' });
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(inventory.map(i => ({
      'ID (Không sửa)': i.id,
      'Tên vật tư': i.item_name,
      'Phân loại': i.category,
      'Hoạt chất chính': i.active_ingredient,
      'Số lượng': i.current_stock,
      'Đơn vị': i.unit,
      'Ngưỡng báo động': i.min_threshold,
      'Giá nhập': i.import_price || 0,
      'Giá bán': i.selling_price || 0,
      'Hạn sử dụng': i.expiry_date,
      'Nhà cung cấp': i.supplier,
      'Thời gian cách ly PHI': i.phi_days || 0,
      'Liều lượng dùng': i.dosage || '',
      'Mục đích sử dụng': i.purpose || '',
      'Cách sử dụng': i.usage_method || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kho Vật Tư");
    XLSX.writeFile(wb, "Kho_Vat_Tu.xlsx");
  };

  const exportHistoryToExcel = (item, logs) => {
    const ws = XLSX.utils.json_to_sheet(logs.map(l => ({
      'Ngày giờ': new Date(l.timestamp).toLocaleString('vi-VN'),
      'Loại hành động': l.action_type,
      'Biến động': (l.quantity_change > 0 ? '+' : '') + l.quantity_change,
      'Tồn kho trước': l.previous_stock,
      'Tồn kho sau': l.new_stock,
      'Người thao tác': l.user_name,
      'Ghi chú': l.notes
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Thẻ Kho");
    XLSX.writeFile(wb, `The_Kho_${item.item_name}.xlsx`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        let count = 0;
        for (const row of data) {
          const id = row['ID (Không sửa)'];
          if (id) {
            await updateInventoryItem(id, {
              item_name: row['Tên vật tư'],
              category: row['Phân loại'],
              active_ingredient: row['Hoạt chất chính'],
              current_stock: Number(row['Số lượng']),
              unit: row['Đơn vị'],
              min_threshold: Number(row['Ngưỡng báo động']),
              import_price: Number(row['Giá nhập']) || 0,
              selling_price: Number(row['Giá bán']) || 0,
              expiry_date: row['Hạn sử dụng'],
              supplier: row['Nhà cung cấp'],
              phi_days: Number(row['Thời gian cách ly PHI']) || 0,
              dosage: row['Liều lượng dùng'] || '',
              purpose: row['Mục đích sử dụng'] || '',
              usage_method: row['Cách sử dụng'] || ''
            });
            count++;
          }
        }
        alert(`Đã cập nhật thành công ${count} mặt hàng từ file Excel!`);
        e.target.value = null;
      } catch (err) {
        alert("Lỗi khi đọc file Excel: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2>{user?.role === 'admin' ? 'Quản lý Kho Vật Tư (Hệ thống)' : 'Kho Vật Tư Cá Nhân'}</h2>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <>
              <button className="btn btn-outline" onClick={exportToExcel} style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
                <Download size={18} /> Xuất Excel
              </button>
              <button className="btn btn-outline" onClick={() => fileInputRef.current.click()} style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                <Upload size={18} /> Tải lên Excel
              </button>
              <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
            </>
          )}
          <button className="btn btn-primary" onClick={() => {
            setIsEditMode(false);
            setEditItemId(null);
            setFormData({
              item_name: '', category: 'Phân bón', active_ingredient: '',
              unit: 'kg', current_stock: '', min_threshold: '',
              import_price: '', selling_price: '',
              expiry_date: '', supplier: '', phi_days: '0',
              dosage: '', purpose: '', usage_method: ''
            });
            setShowAddModal(true);
          }}>
            <Plus size={18} /> Nhập lô mới
          </button>
        </div>
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
              <th style={{ padding: 'var(--spacing-4)', fontWeight: 600 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {displayInventory.map(item => {
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
                    {user?.role === 'admin' && (item.import_price || item.selling_price) && (
                      <div style={{marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed var(--border)'}}>
                        {item.import_price > 0 && <div><strong>Giá nhập:</strong> {item.import_price.toLocaleString('vi-VN')} đ</div>}
                        {item.selling_price > 0 && <div><strong style={{color: 'var(--danger)'}}>Giá bán:</strong> {item.selling_price.toLocaleString('vi-VN')} đ</div>}
                      </div>
                    )}
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
                  <td style={{ padding: 'var(--spacing-4)' }}>
                    <div className="flex gap-2">
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => { setSelectedItem(item); setShowAdjustModal(true); }}>
                        <ArrowDownToLine size={16} title="Nhập thêm" />
                      </button>
                      {user?.role === 'admin' && (
                        <>
                          <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => { setSelectedHistoryItem(item); setShowHistoryModal(true); }}>
                            <History size={16} title="Xem Thẻ kho" />
                          </button>
                          <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => handleEditItem(item)}>
                            <Pencil size={16} title="Chỉnh sửa thông tin" />
                          </button>
                          <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => { setSelectedItem(item); setExportData({ farmer_id: '', quantity: '', unit_price: item.selling_price || '', payment_status: 'Đã thanh toán', notes: '' }); setShowExportModal(true); }}>
                            <ArrowUpFromLine size={16} title="Xuất kho" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
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
              <h3>{isEditMode ? 'Sửa Thông Tin Vật Tư' : 'Nhập Vật Tư Mới'}</h3>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                {errorMsg && (
                  <div style={{ gridColumn: '1 / -1', padding: 'var(--spacing-3)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)' }}>
                    {errorMsg}
                  </div>
                )}
                <div className="input-group" style={{ gridColumn: '1 / -1', position: 'relative' }}>
                  <label className="input-label">Tên vật tư {user?.role === 'farmer' && '(Gõ để tìm kiếm từ danh mục chuẩn)'}</label>
                  <input type="text" className="input-field" required value={formData.item_name} onChange={handleNameChange} onFocus={() => user?.role === 'farmer' && formData.item_name.length > 1 && setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', zIndex: 10, listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-md)' }}>
                      {suggestions.map(s => (
                        <li key={s.id} onClick={() => selectSuggestion(s)} style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                          <strong>{s.item_name}</strong> - <span style={{fontSize:'0.85rem', color: 'var(--text-secondary)'}}>{s.active_ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  )}
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
                {user?.role === 'admin' && (
                  <>
                    <div className="input-group">
                      <label className="input-label">Giá nhập (VNĐ)</label>
                      <input type="number" className="input-field" value={formData.import_price} onChange={e => setFormData({...formData, import_price: e.target.value})} placeholder="0" />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Giá bán ra (VNĐ)</label>
                      <input type="number" className="input-field" value={formData.selling_price} onChange={e => setFormData({...formData, selling_price: e.target.value})} placeholder="0" />
                    </div>
                  </>
                )}
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

      {showExportModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Lập Phiếu Xuất Kho</h3>
            </div>
            <form onSubmit={handleExportStock}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Tên vật tư xuất</label>
                  <input type="text" className="input-field" value={selectedItem.item_name} disabled style={{ backgroundColor: 'var(--background)' }} />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Người nhận (Nông dân HTX)</label>
                  <select className="input-field" value={exportData.farmer_id} onChange={e => setExportData({...exportData, farmer_id: e.target.value})}>
                    <option value="">-- Khách lẻ / Người ngoài --</option>
                    {farmersList.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.phone})</option>
                    ))}
                  </select>
                </div>
                
                <div className="input-group">
                  <label className="input-label">Số lượng ({selectedItem.unit})</label>
                  <input type="number" className="input-field" required max={selectedItem.current_stock} placeholder={`Tối đa: ${selectedItem.current_stock}`} value={exportData.quantity} onChange={e => setExportData({...exportData, quantity: e.target.value})} />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Đơn giá (VNĐ)</label>
                  <input type="number" className="input-field" required value={exportData.unit_price} onChange={e => setExportData({...exportData, unit_price: e.target.value})} />
                </div>

                <div className="input-group">
                  <label className="input-label">Thành tiền (VNĐ)</label>
                  <input type="text" className="input-field" disabled value={((Number(exportData.quantity) || 0) * (Number(exportData.unit_price) || 0)).toLocaleString('vi-VN')} style={{ backgroundColor: 'var(--background)', fontWeight: 'bold' }} />
                </div>

                <div className="input-group">
                  <label className="input-label">Trạng thái thanh toán</label>
                  <select className="input-field" value={exportData.payment_status} onChange={e => setExportData({...exportData, payment_status: e.target.value})}>
                    <option value="Đã thanh toán">Đã thanh toán (Tiền mặt/CK)</option>
                    <option value="Ghi nợ">Ghi nợ</option>
                    <option value="Cấp phát miễn phí">Cấp phát miễn phí</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Ghi chú (Lý do / Mục đích)</label>
                  <input type="text" className="input-field" value={exportData.notes} onChange={e => setExportData({...exportData, notes: e.target.value})} placeholder="VD: Nông dân mua trả chậm..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowExportModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}>Xác nhận Xuất Kho</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistoryModal && selectedHistoryItem && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Thẻ Kho: {selectedHistoryItem.item_name}</h3>
              <button className="btn btn-outline" style={{ borderColor: 'var(--success)', color: 'var(--success)', padding: '0.25rem 0.5rem' }} onClick={() => exportHistoryToExcel(selectedHistoryItem, inventoryLogs.filter(l => l.inventory_id === selectedHistoryItem.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))}>
                <Download size={16} style={{marginRight: '4px'}}/> Xuất Excel Thẻ Kho
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--background)' }}>
                    <th style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>Thời gian</th>
                    <th style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>Hành động</th>
                    <th style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>Biến động</th>
                    <th style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>Tồn cuối</th>
                    <th style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryLogs.filter(l => l.inventory_id === selectedHistoryItem.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((log, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}><span className="badge badge-neutral">{log.action_type}</span></td>
                      <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: log.quantity_change > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                        {log.quantity_change > 0 ? '+' : ''}{log.quantity_change}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>{log.new_stock} {selectedHistoryItem.unit}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{fontSize: '0.8rem'}}>{log.notes}</div>
                        <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>Bởi: {log.user_name}</div>
                      </td>
                    </tr>
                  ))}
                  {inventoryLogs.filter(l => l.inventory_id === selectedHistoryItem.id).length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có lịch sử nhập xuất nào được ghi nhận.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowHistoryModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
