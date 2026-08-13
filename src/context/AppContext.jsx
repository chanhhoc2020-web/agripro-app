import React, { createContext, useState, useContext, useEffect } from 'react';
console.log('App Context Loaded - v2 (Export Feature included)');
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { bannedIngredients as mockBannedIngredients } from '../mockData';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [plantingZones, setPlantingZones] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [farmerInventory, setFarmerInventory] = useState([]);
  const [farmLogs, setFarmLogs] = useState([]);
  const [batches, setBatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agripro_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  // We keep banned ingredients hardcoded for now, or fetch if needed
  const bannedIngredients = mockBannedIngredients;

  // Sync User to localStorage (Mock Auth for now, can upgrade to Firebase Auth later)
  useEffect(() => {
    if (user) {
      localStorage.setItem('agripro_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('agripro_user');
    }
  }, [user]);

  // Firestore Realtime Listeners
  useEffect(() => {
    const unsubZones = onSnapshot(collection(db, 'planting_zones'), (snapshot) => {
      setPlantingZones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubLogs = onSnapshot(collection(db, 'farm_logs'), (snapshot) => {
      setFarmLogs(snapshot.docs.map(doc => ({ log_id: doc.id, ...doc.data() })));
    });
    const unsubBatches = onSnapshot(collection(db, 'batches'), (snapshot) => {
      setBatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubFarmerInventory = onSnapshot(collection(db, 'farmer_inventory'), (snapshot) => {
      setFarmerInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubZones();
      unsubInventory();
      unsubLogs();
      unsubBatches();
      unsubUsers();
      unsubFarmerInventory();
    };
  }, []);

  // Auth functions
  const login = (role, inputPhone, inputPin) => {
    if (role === 'admin') {
      if (inputPin === '1234') {
        setUser({ role: 'admin', name: 'Ban Quản Lý' });
        return true;
      }
      throw new Error('Mã PIN Admin không chính xác!');
    } else {
      const farmerAcc = users.find(u => u.phone === inputPhone && u.pin === inputPin && u.role === 'farmer');
      if (farmerAcc) {
        setUser(farmerAcc);
        return true;
      }
      throw new Error('Số điện thoại hoặc mã PIN không đúng, hoặc tài khoản chưa được cấp!');
    }
  };
  
  const logout = () => {
    setUser(null);
  };

  // Planting Zone functions
  const addZone = async (zone) => {
    await addDoc(collection(db, 'planting_zones'), zone);
  };

  const updateZone = async (id, updatedZone) => {
    await updateDoc(doc(db, 'planting_zones', id), updatedZone);
  };

  const deleteZone = async (id) => {
    await deleteDoc(doc(db, 'planting_zones', id));
  };

  // User Management (Admin)
  const addUser = async (userData) => {
    // Check if phone already exists
    if (users.find(u => u.phone === userData.phone)) {
      throw new Error('Số điện thoại này đã được đăng ký!');
    }
    await addDoc(collection(db, 'users'), userData);
  };
  const updateUser = async (id, userData) => {
    await updateDoc(doc(db, 'users', id), userData);
  };
  const deleteUser = async (id) => {
    await deleteDoc(doc(db, 'users', id));
  };

  // Inventory functions
  const addInventoryItem = async (item) => {
    const isBanned = bannedIngredients.some(b => 
      item.active_ingredient.toLowerCase().includes(b.ingredient_name.toLowerCase())
    );
    if (isBanned) {
      throw new Error(`CẢNH BÁO: Hoạt chất có trong danh mục CẤM sử dụng theo quy định hiện hành. Hành động bị hủy!`);
    }
    await addDoc(collection(db, 'inventory'), item);
  };

  const updateStock = async (id, quantityChange) => {
    const item = inventory.find(i => i.id === id);
    if (item) {
      await updateDoc(doc(db, 'inventory', id), {
        current_stock: item.current_stock + quantityChange
      });
    }
  };

  const updateInventoryItem = async (id, updatedData) => {
    if (updatedData.active_ingredient) {
      const isBanned = bannedIngredients.some(b => 
        updatedData.active_ingredient.toLowerCase().includes(b.ingredient_name.toLowerCase())
      );
      if (isBanned) {
        throw new Error(`CẢNH BÁO: Hoạt chất có trong danh mục CẤM sử dụng theo quy định hiện hành. Hành động bị hủy!`);
      }
    }
    await updateDoc(doc(db, 'inventory', id), updatedData);
  };

  const addFarmerInventoryItem = async (item) => {
    // Check banned ingredients against the new item (which should be derived from global)
    const isBanned = bannedIngredients.some(b => 
      item.active_ingredient && item.active_ingredient.toLowerCase().includes(b.ingredient_name.toLowerCase())
    );
    if (isBanned) {
      throw new Error(`CẢNH BÁO: Hoạt chất có trong danh mục CẤM sử dụng theo quy định hiện hành. Hành động bị hủy!`);
    }
    await addDoc(collection(db, 'farmer_inventory'), item);
  };

  const updateFarmerStock = async (id, quantityChange) => {
    const item = farmerInventory.find(i => i.id === id);
    if (item) {
      await updateDoc(doc(db, 'farmer_inventory', id), {
        current_stock: item.current_stock + quantityChange
      });
    }
  };

  const exportInventoryItem = async (exportData) => {
    // 1. Fetch global item
    const globalItem = inventory.find(i => i.id === exportData.global_inventory_id);
    if (!globalItem) throw new Error("Vật tư không tồn tại trong kho HTX!");
    if (globalItem.current_stock < exportData.quantity) {
      throw new Error("Số lượng xuất vượt quá tồn kho hiện tại!");
    }

    // 2. Trừ tồn kho Admin
    await updateStock(globalItem.id, -exportData.quantity);

    // 3. Ghi log xuất kho
    const exportRecord = {
      ...exportData,
      item_name: globalItem.item_name,
      timestamp: new Date().toISOString()
    };
    await addDoc(collection(db, 'inventory_exports'), exportRecord);

    // 4. Cộng vào kho cá nhân của Nông dân (nếu có chọn nông dân)
    if (exportData.farmer_id) {
      // Tìm xem nông dân đã có mặt hàng này trong kho cá nhân chưa (so khớp tên)
      const existingFarmerItem = farmerInventory.find(
        i => i.farmer_id === exportData.farmer_id && i.item_name === globalItem.item_name
      );

      if (existingFarmerItem) {
        // Cập nhật tồn kho
        await updateFarmerStock(existingFarmerItem.id, exportData.quantity);
      } else {
        // Tạo mới vật tư trong kho cá nhân
        const newFarmerItem = {
          farmer_id: exportData.farmer_id,
          item_name: globalItem.item_name,
          category: globalItem.category || '',
          active_ingredient: globalItem.active_ingredient || '',
          unit: globalItem.unit || '',
          current_stock: exportData.quantity,
          min_threshold: 0,
          expiry_date: globalItem.expiry_date || '',
          supplier: globalItem.supplier || '',
          phi_days: globalItem.phi_days || 0,
          dosage: globalItem.dosage || '',
          purpose: globalItem.purpose || '',
          usage_method: globalItem.usage_method || ''
        };
        await addDoc(collection(db, 'farmer_inventory'), newFarmerItem);
      }
    }
  };

  // Farm Log functions
  const addFarmLog = async (log) => {
    // 1. If using inventory item (now points to farmer_inventory)
    if (log.inventory_item_id) {
      const fItem = farmerInventory.find(i => i.id === log.inventory_item_id);
      if (fItem) {
        const isBanned = bannedIngredients.some(b => 
          fItem.active_ingredient && fItem.active_ingredient.toLowerCase().includes(b.ingredient_name.toLowerCase())
        );
        if (isBanned) {
          throw new Error(`CẢNH BÁO: Thuốc này chứa hoạt chất cấm. Không thể lưu nhật ký!`);
        }
        await updateFarmerStock(fItem.id, -log.quantity_used);
      }
    }

    // 2. If harvesting, check PHI
    if (log.action_type === 'Thu hoạch') {
      const pesticideLogs = farmLogs.filter(
        l => l.puc_code === log.puc_code && 
        (l.inventory_item_id || l.item_name_text) && 
        l.action_type === 'Phun thuốc'
      );

      for (const pLog of pesticideLogs) {
        let phiDays = 0;
        let itemName = pLog.item_name_text || 'Thuốc không xác định';
        
        if (pLog.inventory_item_id) {
          const fItem = farmerInventory.find(i => i.id === pLog.inventory_item_id);
          if (fItem) {
            phiDays = fItem.phi_days || 0;
            itemName = fItem.item_name;
          }
        }
        // If they just typed text, we don't know the exact PHI unless we look it up in global inventory,
        // but for safety, we could assume 14 days, or just skip if we don't know. Let's just use what we have.

        const sprayDate = new Date(pLog.timestamp);
        const harvestDate = new Date(log.timestamp);
        const safeHarvestDate = new Date(sprayDate);
        safeHarvestDate.setDate(safeHarvestDate.getDate() + phiDays);

        if (phiDays > 0 && harvestDate < safeHarvestDate) {
          const daysLeft = Math.ceil((safeHarvestDate - harvestDate) / (1000 * 60 * 60 * 24));
          throw new Error(`CẢNH BÁO: Vùng trồng này vừa phun thuốc ${itemName}. Chưa đủ thời gian cách ly PHI (Còn thiếu ${daysLeft} ngày).`);
        }
      }
    }

    await addDoc(collection(db, 'farm_logs'), log);
  };

  const addBatch = async (batch) => {
    await addDoc(collection(db, 'batches'), batch);
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      plantingZones, addZone, updateZone, deleteZone,
      inventory, addInventoryItem, updateStock, exportInventoryItem, updateInventoryItem,
      farmerInventory, addFarmerInventoryItem, updateFarmerStock,
      farmLogs, addFarmLog,
      batches, addBatch,
      users, addUser, updateUser, deleteUser,
      bannedIngredients
    }}>
      {children}
    </AppContext.Provider>
  );
};
