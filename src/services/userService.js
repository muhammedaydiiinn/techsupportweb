import axiosInstance from './axiosConfig';

// Kullanıcı rolleri enum
export const userRoles = [
  { value: 'ADMIN', label: 'Yönetici' },
  { value: 'USER', label: 'Kullanıcı' },
  { value: 'SUPPORT', label: 'Destek Personeli' },
  { value: 'DEPARTMENT_MANAGER', label: 'Departman Yöneticisi' }
];

const userService = {
  // Kullanıcı listesini getir
  getAllUsers: async (params = {}) => {
    try {
      // Sayfalama veya filtreleme parametreleri
      const queryParams = { ...params };
      
      const response = await axiosInstance.get(`/users`, { params: queryParams });
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kullanıcılar getirilirken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Kullanıcılar getirilirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Kullanıcı detayını getir
  getUserById: async (id) => {
    try {
      // Hata kontrolü
      if (!id) {
        throw new Error('Kullanıcı ID gerekli');
      }
      
      const response = await axiosInstance.get(`/users/${id}`);
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kullanıcı detayı getirilirken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Kullanıcı detayı getirilirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Yeni kullanıcı oluştur
  createUser: async (userData) => {
    try {
      // API'nin beklediği formatta veri gönderilmesini sağla
      const data = {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: userData.password,
        role: userData.role || 'user', // Varsayılan rol: user
        department_id: userData.department_id || null,
        api_access: userData.api_access || false
      };
      
      const response = await axiosInstance.post(`/users`, data);
      return response;
    } catch (error) {
      console.error('Kullanıcı oluşturulurken hata:', error);
      throw error;
    }
  },

  // Kullanıcı bilgilerini güncelle
  updateUser: async (id, userData) => {
    try {
      if (!id) {
        throw new Error('Kullanıcı ID gerekli');
      }
      
      // API'nin beklediği formatta veri oluştur
      const data = {};
      
      // Tüm olası alanları kontrol et
      if (userData.email !== undefined) data.email = userData.email;
      if (userData.first_name !== undefined) data.first_name = userData.first_name;
      if (userData.last_name !== undefined) data.last_name = userData.last_name;
      if (userData.password !== undefined) data.password = userData.password;
      if (userData.old_password !== undefined) data.old_password = userData.old_password;
      if (userData.role !== undefined) data.role = userData.role;
      if (userData.department_id !== undefined) data.department_id = userData.department_id;
      if (userData.api_access !== undefined) data.api_access = userData.api_access;
      
      const response = await axiosInstance.put(`/users/${id}`, data);
      return response;
    } catch (error) {
      console.error('Kullanıcı güncellenirken hata:', error);
      throw error;
    }
  },

  // Kullanıcı sil
  deleteUser: async (id) => {
    try {
      if (!id) {
        throw new Error('Kullanıcı ID gerekli');
      }
      
      const response = await axiosInstance.delete(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error);
      throw error;
    }
  },

  // Kullanıcı rolünü güncelle (Admin işlemi)
  updateUserRole: async (userId, role) => {
    try {
      if (!userId) {
        throw new Error('Kullanıcı ID gerekli');
      }
      
      return await userService.updateUser(userId, { role });
    } catch (error) {
      console.error('Kullanıcı rolü güncellenirken hata:', error);
      throw error;
    }
  },

  // Kullanıcı departmanını güncelle (Admin veya departman yöneticisi işlemi)
  updateUserDepartment: async (userId, departmentId) => {
    try {
      if (!userId) {
        throw new Error('Kullanıcı ID gerekli');
      }
      
      return await userService.updateUser(userId, { department_id: departmentId });
    } catch (error) {
      console.error('Kullanıcı departmanı güncellenirken hata:', error);
      throw error;
    }
  },

  // Kullanıcı durumunu güncelle (aktif/pasif)
  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await axiosInstance.put(`/users/${userId}/status`, { is_active: isActive });
      return response;
    } catch (error) {
      console.error('Kullanıcı durumu güncellenirken hata:', error);
      throw error;
    }
  },

  // Belirli bir departmana ait kullanıcıları getir
  getUsersByDepartment: async (departmentId, params = {}) => {
    try {
      if (!departmentId) {
        throw new Error('Departman ID gerekli');
      }
      
      const queryParams = { ...params, department_id: departmentId };
      const response = await axiosInstance.get(`/users`, { params: queryParams });
      return response;
    } catch (error) {
      console.error('Departman kullanıcıları getirilirken hata:', error);
      throw error;
    }
  },

  // Belirli bir role sahip kullanıcıları getir
  getUsersByRole: async (role, params = {}) => {
    try {
      if (!role) {
        throw new Error('Rol bilgisi gerekli');
      }
      
      const queryParams = { ...params, role: role };
      const response = await axiosInstance.get(`/users`, { params: queryParams });
      return response;
    } catch (error) {
      console.error('Rol bazlı kullanıcılar getirilirken hata:', error);
      throw error;
    }
  }
};

export { userService }; 