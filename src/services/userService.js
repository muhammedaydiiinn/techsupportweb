import axiosInstance from './axiosConfig';

// Kullanıcı rolleri enum
export const userRoles = [
  { value: 'admin', label: 'Yönetici' },
  { value: 'support', label: 'Destek Personeli' },
  { value: 'user', label: 'Kullanıcı' },
  { value: 'department_manager', label: 'Departman Yöneticisi' },
  { value: 'department_employee', label: 'Departman Çalışanı' }
];

const userService = {
  // Kullanıcı listesini getir
  getAllUsers: async (params = {}) => {
    try {
      // Sayfalama veya filtreleme parametreleri
      const queryParams = { ...params };
      
      const response = await axiosInstance.get(`/users`, { params: queryParams });
      return response;
    } catch (error) {
      console.error('Kullanıcılar getirilirken hata:', error);
      throw error;
    }
  },

  // Kullanıcı detayını getir
  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Kullanıcı detayı getirilirken hata:', error);
      throw error;
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
      // Sadece güncellenecek alanları içeren veri oluştur
      const data = {};
      
      if (userData.first_name !== undefined) data.first_name = userData.first_name;
      if (userData.last_name !== undefined) data.last_name = userData.last_name;
      if (userData.password !== undefined) data.password = userData.password;
      if (userData.old_password !== undefined) data.old_password = userData.old_password;
      if (userData.role !== undefined) data.role = userData.role;
      if (userData.department_id !== undefined) data.department_id = userData.department_id;
      
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
      const response = await axiosInstance.put(`/users/${userId}/role`, { role });
      return response;
    } catch (error) {
      console.error('Kullanıcı rolü güncellenirken hata:', error);
      throw error;
    }
  },

  // Kullanıcı departmanını güncelle (Admin veya departman yöneticisi işlemi)
  updateUserDepartment: async (userId, departmentId) => {
    try {
      const response = await axiosInstance.put(`/users/${userId}/department`, { department_id: departmentId });
      return response;
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