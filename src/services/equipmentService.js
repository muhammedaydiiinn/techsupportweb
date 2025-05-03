import axiosInstance from './axiosConfig';

const equipmentService = {
  // Tüm ekipmanları getir
  getAllEquipment: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`/equipment`, { params });
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
      const response = await axiosInstance.post(`/equipment`, equipmentData);
      return response;
    } catch (error) {
      console.error('Ekipman oluşturulurken hata:', error);
      throw error;
    }
  },

  // Ekipman bilgilerini güncelle
  updateEquipment: async (id, equipmentData) => {
    try {
      const response = await axiosInstance.put(`/equipment/${id}`, equipmentData);
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

  // Departmana göre ekipman listesini getir
  getEquipmentByDepartment: async (departmentId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/departments/${departmentId}/equipment`, { params });
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