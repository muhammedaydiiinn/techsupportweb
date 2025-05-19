import axiosInstance from './axiosConfig';


// EKİPMAN TİPLERİ ENUM
export const equipmentTypes = [
  { value: "COMPUTER", label: "Bilgisayar" },
  { value: "LAPTOP", label: "Dizüstü Bilgisayar" },
  { value: "PRINTER", label: "Yazıcı" },
  { value: "SERVER", label: "Sunucu" },
  { value: "NETWORK", label: "Ağ Cihazı" },
  { value: "MOBILE", label: "Mobil Cihaz" },
  { value: "OTHER", label: "Diğer" }
];

// EKİPMAN DURUMLARI ENUM
export const equipmentStatuses = [
  { value: "ACTIVE", label: "Aktif" },
  { value: "MAINTENANCE", label: "Bakımda" },
  { value: "REPAIR", label: "Tamirde" },
  { value: "BROKEN", label: "Arızalı" },
  { value: "RETIRED", label: "Kullanım Dışı" }
];


const equipmentService = {
  // Tüm ekipmanları getir
  getAllEquipment: async (params = {}) => {
    try {
      // Sayfalama, filtreleme ve sıralama parametreleri
      const queryParams = { ...params };
      
      const response = await axiosInstance.get(`/equipment`, { params: queryParams });
      return response;
    } catch (error) {
      console.error('Ekipmanlar getirilirken hata:', error);
      throw error;
    }
  },

  // Ekipman detayını getir
  getEquipmentById: async (id) => {
    try {
      const response = await axiosInstance.get(`/equipment/${id}`);
      return response;
    } catch (error) {
      console.error('Ekipman detayı getirilirken hata:', error);
      throw error;
    }
  },

  // Yeni ekipman oluştur
  createEquipment: async (equipmentData) => {
    try {
      // API'nin beklediği formatta veri gönderilmesini sağla
      const data = {
        name: equipmentData.name,
        description: equipmentData.description || '',
        equipment_type: equipmentData.equipment_type || 'computer',
        status: equipmentData.status || 'active',
        serial_number: equipmentData.serial_number || '',
        model: equipmentData.model || '',
        manufacturer: equipmentData.manufacturer || '',
        purchase_date: equipmentData.purchase_date || null,
        warranty_expiry: equipmentData.warranty_expiry || null,
        department_id: equipmentData.department_id, // Zorunlu alan
        assigned_to_id: equipmentData.assigned_to_id === '' ? null : equipmentData.assigned_to_id
      };
      
      const response = await axiosInstance.post(`/equipment`, data);
      return response;
    } catch (error) {
      console.error('Ekipman oluşturulurken hata:', error);
      throw error;
    }
  },

  // Ekipman bilgilerini güncelle
  updateEquipment: async (id, equipmentData) => {
    try {
      // Sadece güncellenecek alanları içeren veri oluştur
      const data = {};
      
      if (equipmentData.name !== undefined) data.name = equipmentData.name;
      if (equipmentData.description !== undefined) data.description = equipmentData.description;
      if (equipmentData.equipment_type !== undefined) data.equipment_type = equipmentData.equipment_type;
      if (equipmentData.status !== undefined) data.status = equipmentData.status;
      if (equipmentData.serial_number !== undefined) data.serial_number = equipmentData.serial_number;
      if (equipmentData.model !== undefined) data.model = equipmentData.model;
      if (equipmentData.manufacturer !== undefined) data.manufacturer = equipmentData.manufacturer;
      if (equipmentData.purchase_date !== undefined) data.purchase_date = equipmentData.purchase_date;
      if (equipmentData.warranty_expiry !== undefined) data.warranty_expiry = equipmentData.warranty_expiry;
      if (equipmentData.department_id !== undefined) data.department_id = equipmentData.department_id;
      if (equipmentData.assigned_to_id !== undefined) {
        // Boş string ise null olarak gönder, API UUID bekliyor
        data.assigned_to_id = equipmentData.assigned_to_id === '' ? null : equipmentData.assigned_to_id;
      }
      
      const response = await axiosInstance.put(`/equipment/${id}`, data);
      return response;
    } catch (error) {
      console.error('Ekipman güncellenirken hata:', error);
      throw error;
    }
  },

  // Ekipman sil
  deleteEquipment: async (id) => {
    try {
      const response = await axiosInstance.delete(`/equipment/${id}`);
      return response;
    } catch (error) {
      console.error('Ekipman silinirken hata:', error);
      throw error;
    }
  },

  // Ekipman durumunu güncelle
  updateEquipmentStatus: async (id, status) => {
    try {
      const response = await axiosInstance.put(`/equipment/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Ekipman durumu güncellenirken hata:', error);
      throw error;
    }
  },

  // Ekipman departman ataması
  assignEquipmentToDepartment: async (equipmentId, departmentId) => {
    try {
      const response = await axiosInstance.put(`/equipment/${equipmentId}/department`, { department_id: departmentId });
      return response;
    } catch (error) {
      console.error('Ekipman departman ataması yapılırken hata:', error);
      throw error;
    }
  },

  // Ekipman kullanıcı ataması
  assignEquipmentToUser: async (equipmentId, userId) => {
    try {
      const response = await axiosInstance.put(`/equipment/${equipmentId}/assign`, { user_id: userId });
      return response;
    } catch (error) {
      console.error('Ekipman kullanıcı ataması yapılırken hata:', error);
      throw error;
    }
  },

  // Departmana göre ekipman listesini getir
  getEquipmentByDepartment: async (departmentId, params = {}) => {
    try {
      const queryParams = { ...params, department_id: departmentId };
      const response = await axiosInstance.get(`/equipment`, { params: queryParams });
      return response;
    } catch (error) {
      console.error('Departman ekipmanları getirilirken hata:', error);
      throw error;
    }
  },

  // Ekipman tipine göre ekipmanları getir
  getEquipmentByType: async (equipmentType, params = {}) => {
    try {
      const queryParams = { ...params, equipment_type: equipmentType };
      const response = await axiosInstance.get(`/equipment`, { params: queryParams });
      return response;
    } catch (error) {
      console.error('Ekipman tipi filtrelenirken hata:', error);
      throw error;
    }
  },

  // Duruma göre ekipmanları getir
  getEquipmentByStatus: async (status, params = {}) => {
    try {
      const queryParams = { ...params, status: status };
      const response = await axiosInstance.get(`/equipment`, { params: queryParams });
      return response;
    } catch (error) {
      console.error('Ekipman durumu filtrelenirken hata:', error);
      throw error;
    }
  }
};

export { equipmentService }; 