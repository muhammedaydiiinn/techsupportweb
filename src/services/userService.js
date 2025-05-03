import axiosInstance from './axiosConfig';

const userService = {
  // Kullanıcı listesini getir
  getAllUsers: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`/users`, { params });
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
      const response = await axiosInstance.post(`/users`, userData);
      return response;
    } catch (error) {
      console.error('Kullanıcı oluşturulurken hata:', error);
      throw error;
    }
  },

  // Kullanıcı bilgilerini güncelle
  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.put(`/users/${id}`, userData);
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
  }
};

export { userService }; 