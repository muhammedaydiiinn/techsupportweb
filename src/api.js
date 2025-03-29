import axios from 'axios';

// Axios instance oluştur ve baseURL'yi ayarla
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request interceptor - token ekleme
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - token yenileme ve hata yönetimi
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth işlemleri
export const auth = {
  // Kayıt
  register: async (userData) => {
    try {
      const response = await api.post('/api/v1/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Giriş
  login: async (credentials) => {
    try {
      const response = await api.post('/api/v1/auth/login', credentials);
      localStorage.setItem('access_token', response.data.access_token);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Şifre sıfırlama isteği
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/api/v1/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Yeni şifre belirleme
  resetPassword: async (token, newPassword, newPasswordConfirm) => {
    try {
      const response = await api.post('/api/v1/auth/reset-password', {
        token,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Profil bilgilerini getir
  getProfile: async () => {
    try {
      const response = await api.get('/api/v1/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Admin işlemleri
export const admin = {
  // Kullanıcı oluştur
  createUser: async (userData) => {
    try {
      const response = await api.post('/api/v1/auth/admin/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Kullanıcıları listele
  getUsers: async (skip = 0, limit = 10) => {
    try {
      const response = await api.get(`/api/v1/auth/admin/users?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tek kullanıcı görüntüle
  getUser: async (userId) => {
    try {
      const response = await api.get(`/api/v1/auth/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Kullanıcı güncelle
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/api/v1/auth/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Kullanıcı sil
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/v1/auth/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // API erişimini aç/kapat
  toggleApiAccess: async (userId) => {
    try {
      const response = await api.post(`/api/v1/auth/toggle-api-access/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default api;