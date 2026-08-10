// Mock Data for AgriPro

export const initialPlantingZones = [
  {
    id: '1',
    puc_code: 'PUC-VN-2023-001',
    zone_name: 'Lô số 1 - Khu A',
    location_address: 'Xã Phú Hòa, Huyện Định Quán, Đồng Nai',
    gps_coordinates: '11.1345, 107.2341',
    area_size: 2.5, // ha
    crop_type: 'Sầu riêng',
    target_market: 'Xuất khẩu Trung Quốc',
    estimated_yield: 40000, // kg
    status: 'Active'
  },
  {
    id: '2',
    puc_code: 'PUC-VN-2023-002',
    zone_name: 'Lô số 2 - Khu B',
    location_address: 'Xã Phú Hòa, Huyện Định Quán, Đồng Nai',
    gps_coordinates: '11.1350, 107.2355',
    area_size: 1.8,
    crop_type: 'Bưởi da xanh',
    target_market: 'Tiêu dùng nội địa',
    estimated_yield: 25000,
    status: 'Active'
  }
];

export const initialInventory = [
  {
    id: 'inv-1',
    item_name: 'Phân bón NPK 20-20-15',
    category: 'Phân bón',
    active_ingredient: 'N, P, K',
    unit: 'bao',
    current_stock: 150,
    min_threshold: 20,
    expiry_date: '2025-12-31',
    supplier: 'Công ty CP Phân Bón Bình Điền',
    phi_days: 0 // Thời gian cách ly 0 ngày
  },
  {
    id: 'inv-2',
    item_name: 'Thuốc trừ sâu Regent 800WG',
    category: 'Thuốc BVTV',
    active_ingredient: 'Fipronil',
    unit: 'gói',
    current_stock: 5, // Dưới ngưỡng
    min_threshold: 10,
    expiry_date: '2024-10-15',
    supplier: 'Bayer',
    phi_days: 14
  },
  {
    id: 'inv-3',
    item_name: 'Thuốc trừ cỏ Glyphosan',
    category: 'Thuốc BVTV',
    active_ingredient: 'Glyphosate',
    unit: 'lít',
    current_stock: 50,
    min_threshold: 5,
    expiry_date: '2026-01-01',
    supplier: 'Agro Chem',
    phi_days: 21
  }
];

export const initialFarmLogs = [
  {
    log_id: 'log-1',
    puc_code: 'PUC-VN-2023-001',
    action_type: 'Bón phân',
    timestamp: '2023-10-01T08:00:00Z',
    inventory_item_id: 'inv-1',
    quantity_used: 10,
    operator_name: 'Nguyễn Văn A',
    photo_url: '',
    notes: 'Bón phân đợt 1'
  }
];

export const bannedIngredients = [
  {
    id: 'ban-1',
    ingredient_name: 'Glyphosate',
    reason_banned: 'Quyết định 1186/QĐ-BNN-BVTV',
    effective_date: '2021-06-30'
  },
  {
    id: 'ban-2',
    ingredient_name: 'Paraquat',
    reason_banned: 'Quyết định 278/QĐ-BNN-BVTV',
    effective_date: '2019-02-08'
  },
  {
    id: 'ban-3',
    ingredient_name: 'Chlorpyrifos Ethyl',
    reason_banned: 'Quyết định 501/QĐ-BNN-BVTV',
    effective_date: '2021-02-12'
  }
];
