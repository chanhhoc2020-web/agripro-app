import React, { createContext, useState, useContext, useEffect } from 'react';
import { initialPlantingZones, initialInventory, initialFarmLogs, bannedIngredients } from '../mockData';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [plantingZones, setPlantingZones] = useState(initialPlantingZones);
  const [inventory, setInventory] = useState(initialInventory);
  const [farmLogs, setFarmLogs] = useState(initialFarmLogs);
  const [user, setUser] = useState(null); // { role: 'admin' | 'farmer', name: '...' }

  // Auth functions
  const login = (role, name) => {
    setUser({ role, name });
  };
  
  const logout = () => {
    setUser(null);
  };

  // Planting Zone functions
  const addZone = (zone) => {
    setPlantingZones([...plantingZones, { ...zone, id: Date.now().toString() }]);
  };

  const updateZone = (id, updatedZone) => {
    setPlantingZones(plantingZones.map(z => z.id === id ? { ...z, ...updatedZone } : z));
  };

  const deleteZone = (id) => {
    setPlantingZones(plantingZones.filter(z => z.id !== id));
  };

  // Inventory functions
  const addInventoryItem = (item) => {
    // Check for banned ingredient before adding
    const isBanned = bannedIngredients.some(b => 
      item.active_ingredient.toLowerCase().includes(b.ingredient_name.toLowerCase())
    );
    
    if (isBanned) {
      throw new Error(`CẢNH BÁO: Hoạt chất có trong danh mục CẤM sử dụng theo quy định hiện hành. Hành động bị hủy!`);
    }

    setInventory([...inventory, { ...item, id: `inv-${Date.now()}` }]);
  };

  const updateStock = (id, quantityChange) => {
    setInventory(inventory.map(item => 
      item.id === id 
        ? { ...item, current_stock: item.current_stock + quantityChange } 
        : item
    ));
  };

  // Farm Log functions
  const addFarmLog = (log) => {
    // 1. If using inventory item (Phun thuốc / Bón phân)
    if (log.inventory_item_id) {
      const item = inventory.find(i => i.id === log.inventory_item_id);
      if (item) {
        // Check Banned Ingredient
        const isBanned = bannedIngredients.some(b => 
          item.active_ingredient.toLowerCase().includes(b.ingredient_name.toLowerCase())
        );
        if (isBanned) {
          throw new Error(`CẢNH BÁO: Thuốc này chứa hoạt chất cấm. Không thể lưu nhật ký!`);
        }
        
        // Deduct inventory
        updateStock(item.id, -log.quantity_used);
      }
    }

    // 2. If harvesting, check PHI (Pre-Harvest Interval)
    if (log.action_type === 'Thu hoạch') {
      // Find all pesticide logs for this PUC
      const pesticideLogs = farmLogs.filter(
        l => l.puc_code === log.puc_code && 
        l.inventory_item_id && 
        inventory.find(i => i.id === l.inventory_item_id && i.category === 'Thuốc BVTV')
      );

      for (const pLog of pesticideLogs) {
        const item = inventory.find(i => i.id === pLog.inventory_item_id);
        const sprayDate = new Date(pLog.timestamp);
        const harvestDate = new Date(log.timestamp);
        
        // Calculate safe harvest date
        const safeHarvestDate = new Date(sprayDate);
        safeHarvestDate.setDate(safeHarvestDate.getDate() + (item.phi_days || 0));

        if (harvestDate < safeHarvestDate) {
          const daysLeft = Math.ceil((safeHarvestDate - harvestDate) / (1000 * 60 * 60 * 24));
          throw new Error(`CẢNH BÁO: Vùng trồng này vừa phun thuốc ${item.item_name}. Chưa đủ thời gian cách ly PHI (Còn thiếu ${daysLeft} ngày). Sản phẩm thu hoạch có thể bị vi phạm tiêu chuẩn an toàn!`);
        }
      }
    }

    setFarmLogs([...farmLogs, { ...log, log_id: `log-${Date.now()}` }]);
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      plantingZones, addZone, updateZone, deleteZone,
      inventory, addInventoryItem, updateStock,
      farmLogs, addFarmLog,
      bannedIngredients
    }}>
      {children}
    </AppContext.Provider>
  );
};
