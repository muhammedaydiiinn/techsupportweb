import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    if (config.url.startsWith('auth/')) {
      config.url = `/${config.url}`;
    }
    
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const errorData = {
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.detail || error.message
    };

    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
    }
    
    return Promise.reject({
      ...error,
      api: errorData
    });
  }
);

export const authService = {
  login: async (email, password) => {
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await axios({
        method: 'post',
        url: `${API_URL}/auth/login`,
        data: params.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      });

      localStorage.setItem('access_token', response.data.access_token);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const errorMessage = 
        error.response?.data?.detail ||
        (error.response?.status === 401 ? 'Geçersiz kullanıcı adı veya şifre' : 
         error.message === 'Network Error' ? 'Sunucuya bağlanılamıyor' :
         'Giriş yapılırken bir hata oluştu');
      
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Kayıt işlemi başarısız oldu',
        error: error.response?.data
      };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Şifre sıfırlama isteği başarısız oldu',
        error: error.response?.data
      };
    }
  },

  resetPassword: async (token, newPassword, newPasswordConfirm) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Şifre sıfırlama işlemi başarısız oldu',
        error: error.response?.data
      };
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Profil bilgileri alınamadı',
        error: error.response?.data
      };
    }
  },
};

export default api;