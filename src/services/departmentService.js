import axiosInstance from './axiosConfig';

// Departman tipleri enum
export const departmentTypes = [
  { value: "IT", label: "Bilgi Teknolojileri" },
  { value: "HR", label: "İnsan Kaynakları" },
  { value: "FINANCE", label: "Finans" },
  { value: "MARKETING", label: "Pazarlama" },
  { value: "SALES", label: "Satış" },
  { value: "OPERATIONS", label: "Operasyon" },
  { value: "CUSTOMER_SERVICE", label: "Müşteri Hizmetleri" },
  { value: "LEGAL", label: "Hukuk" },
  { value: "RESEARCH", label: "Araştırma" },
  { value: "DEVELOPMENT", label: "Geliştirme" },
  { value: "OTHER", label: "Diğer" }
];

const departmentService = {
  // Tüm departmanları getir
  getAllDepartments: async (params = {}) => {
    try {
      const response = await axiosInstance.get('departments', { params });
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Departmanlar getirilirken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Departmanlar getirilirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Departman detayını getir
  getDepartmentById: async (id) => {
    try {
      const response = await axiosInstance.get(`departments/${id}`);
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Departman detayı getirilirken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Departman detayı getirilirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Yeni departman oluştur (Admin)
  createDepartment: async (departmentData) => {
    try {
      // department_type değerinin geçerli bir enum değeri olduğundan emin ol
      const data = { ...departmentData };
      
      // Eğer department_type belirtilmişse küçük harfe çevir, yoksa 'other' kullan
      if (data.department_type) {
        data.department_type = data.department_type;
      } else {
        data.department_type = 'other';
      }
      
      
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
        data.department_type = data.department_type;
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