import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { bannedIngredients as mockBannedIngredients } from '../mockData';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [plantingZones, setPlantingZones] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [farmLogs, setFarmLogs] = useState([]);
  const [batches, setBatches] = useState([]);
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

    return () => {
      unsubZones();
      unsubInventory();
      unsubLogs();
      unsubBatches();
    };
  }, []);

  // Auth functions
  const login = (role, name) => {
    setUser({ role, name });
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

  // Farm Log functions
  const addFarmLog = async (log) => {
    // 1. If using inventory item
    if (log.inventory_item_id) {
      const item = inventory.find(i => i.id === log.inventory_item_id);
      if (item) {
        const isBanned = bannedIngredients.some(b => 
          item.active_ingredient.toLowerCase().includes(b.ingredient_name.toLowerCase())
        );
        if (isBanned) {
          throw new Error(`CẢNH BÁO: Thuốc này chứa hoạt chất cấm. Không thể lưu nhật ký!`);
        }
        await updateStock(item.id, -log.quantity_used);
      }
    }

    // 2. If harvesting, check PHI
    if (log.action_type === 'Thu hoạch') {
      const pesticideLogs = farmLogs.filter(
        l => l.puc_code === log.puc_code && 
        l.inventory_item_id && 
        inventory.find(i => i.id === l.inventory_item_id && i.category === 'Thuốc BVTV')
      );

      for (const pLog of pesticideLogs) {
        const item = inventory.find(i => i.id === pLog.inventory_item_id);
        const sprayDate = new Date(pLog.timestamp);
        const harvestDate = new Date(log.timestamp);
        const safeHarvestDate = new Date(sprayDate);
        safeHarvestDate.setDate(safeHarvestDate.getDate() + (item.phi_days || 0));

        if (harvestDate < safeHarvestDate) {
          const daysLeft = Math.ceil((safeHarvestDate - harvestDate) / (1000 * 60 * 60 * 24));
          throw new Error(`CẢNH BÁO: Vùng trồng này vừa phun thuốc ${item.item_name}. Chưa đủ thời gian cách ly PHI (Còn thiếu ${daysLeft} ngày). Sản phẩm thu hoạch có thể bị vi phạm tiêu chuẩn an toàn!`);
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
      inventory, addInventoryItem, updateStock,
      farmLogs, addFarmLog,
      batches, addBatch,
      bannedIngredients
    }}>
      {children}
    </AppContext.Provider>
  );
};
