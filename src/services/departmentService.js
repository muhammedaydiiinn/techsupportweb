import axiosInstance from './axiosConfig';

// Departman tipleri enum
export const departmentTypes = [
  { value: "it", label: "Bilgi Teknolojileri" },
  { value: "hr", label: "İnsan Kaynakları" },
  { value: "finance", label: "Finans" },
  { value: "marketing", label: "Pazarlama" },
  { value: "sales", label: "Satış" },
  { value: "operations", label: "Operasyon" },
  { value: "customer_service", label: "Müşteri Hizmetleri" },
  { value: "legal", label: "Hukuk" },
  { value: "research", label: "Araştırma" },
  { value: "development", label: "Geliştirme" },
  { value: "other", label: "Diğer" }
];

const departmentService = {
  // Tüm departmanları getir
  getAllDepartments: async (params = {}) => {
    try {
      const response = await axiosInstance.get('departments', { params });
      return response;
    } catch (error) {
      console.error('Departmanlar getirilirken hata:', error);
      throw error;
    }
  },

  // Departman detayını getir
  getDepartmentById: async (id) => {
    try {
      const response = await axiosInstance.get(`departments/${id}`);
      return response;
    } catch (error) {
      console.error('Departman detayı getirilirken hata:', error);
      throw error;
    }
  },

  // Yeni departman oluştur (Admin)
  createDepartment: async (departmentData) => {
    try {
      // department_type değerinin geçerli bir enum değeri olduğundan emin ol
      const data = { ...departmentData };
      
      // Eğer department_type belirtilmişse küçük harfe çevir, yoksa 'other' kullan
      if (data.department_type) {
        data.department_type = data.department_type.toLowerCase();
      } else {
        data.department_type = 'other';
      }
      
      console.log('Departman oluşturuluyor:', data);
      
      // Departman oluştur (admin prefix'i olabilir veya olmayabilir - backend yapısına bağlı)
      const response = await axiosInstance.post('departments', data);
      return response;
    } catch (error) {
      console.error('Departman oluşturulurken hata:', error);
      throw error;
    }
  },

  // Departman bilgilerini güncelle (Admin)
  updateDepartment: async (id, departmentData) => {
    try {
      // department_type değerinin geçerli bir enum değeri olduğundan emin ol
      const data = { ...departmentData };
      
      // Eğer department_type belirtilmişse küçük harfe çevir
      if (data.department_type) {
        data.department_type = data.department_type.toLowerCase();
      }
      
      // Departman güncelle
      const response = await axiosInstance.put(`departments/${id}`, data);
      return response;
    } catch (error) {
      console.error('Departman güncellenirken hata:', error);
      throw error;
    }
  },

  // Departman sil (Admin)
  deleteDepartment: async (id) => {
    try {
      // Departman sil
      const response = await axiosInstance.delete(`departments/${id}`);
      return response;
    } catch (error) {
      console.error('Departman silinirken hata:', error);
      throw error;
    }
  },

  // Departmandaki kullanıcıları getir
  getDepartmentUsers: async (departmentId, params = {}) => {
    try {
      const response = await axiosInstance.get(`departments/${departmentId}/users`, { params });
      return response;
    } catch (error) {
      console.error('Departman kullanıcıları getirilirken hata:', error);
      throw error;
    }
  }
};

export { departmentService }; 