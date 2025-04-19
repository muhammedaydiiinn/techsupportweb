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

export const ticketService = {
  createTicket: async (ticketData) => {
    try {
      const response = await api.post('/tickets/', ticketData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Ticket oluşturulurken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  getTickets: async (params = {}) => {
    try {
      const response = await api.get('/tickets/', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Ticketlar alınırken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  getTicketById: async (ticketId) => {
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Ticket detayları alınırken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  updateTicket: async (ticketId, ticketData) => {
    try {
      const response = await api.put(`/tickets/${ticketId}`, ticketData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Ticket güncellenirken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  updateTicketStatus: async (ticketId, status) => {
    try {
      const response = await api.put(`/tickets/${ticketId}/status`, { status });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Ticket durumu güncellenirken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  assignTicket: async (ticketId, userId) => {
    try {
      const response = await api.put('/tickets/admin/assign', {
        ticket_id: ticketId,
        user_id: userId
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Ticket atanırken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  deleteTicket: async (ticketId) => {
    try {
      const response = await api.delete(`/tickets/admin/tickets/${ticketId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Ticket silinirken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  uploadAttachment: async (ticketId, file, description = '') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (description) {
        formData.append('description', description);
      }

      const response = await api.post(
        `/tickets/${ticketId}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Dosya yüklenirken bir hata oluştu',
        error: error.response?.data
      };
    }
  }
};

export default api;