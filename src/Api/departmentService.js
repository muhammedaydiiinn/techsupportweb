import api from './apiConfig';

const departmentService = {
  /**
   * Tüm departmanları getir
   */
  getAllDepartments: async () => {
    try {
      const response = await api.get('/departments');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      return { success: false, message: 'Departmanlar yüklenirken bir hata oluştu', data: [] };
    }
  },

  /**
   * ID'ye göre departman getir
   */
  getDepartmentById: async (id) => {
    try {
      const response = await api.get(`/departments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching department id=${id}:`, error);
      return { success: false, message: 'Departman bilgisi yüklenirken bir hata oluştu' };
    }
  },

  /**
   * Yeni departman ekle
   */
  createDepartment: async (departmentData) => {
    try {
      const response = await api.post('/departments', departmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating department:', error);
      return { success: false, message: 'Departman oluşturulurken bir hata oluştu' };
    }
  },

  /**
   * Departman güncelle
   */
  updateDepartment: async (id, departmentData) => {
    try {
      const response = await api.put(`/departments/${id}`, departmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating department id=${id}:`, error);
      return { success: false, message: 'Departman güncellenirken bir hata oluştu' };
    }
  },

  /**
   * Departman sil
   */
  deleteDepartment: async (id) => {
    try {
      const response = await api.delete(`/departments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting department id=${id}:`, error);
      return { success: false, message: 'Departman silinirken bir hata oluştu' };
    }
  }
};

export default departmentService; 