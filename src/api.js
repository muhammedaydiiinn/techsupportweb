import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8001/api/v1';

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
    const token = localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // API URL düzeltme kodunu kaldırıyoruz - bu sorunlu olabilir
    // if (!config.url.startsWith('http')) {
    //   if (config.url.startsWith('/')) {
    //     config.url = config.url.substring(1);
    //   }
    // }

    return config;
  },
  error => {
    toast.error('İstek gönderilirken bir hata oluştu');
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token geçersiz olduğunda
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('access_token');
      toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      toast.error('Bu işlem için yetkiniz bulunmuyor');
    }

    if (error.response?.status === 404) {
      toast.error('İstenen kaynak bulunamadı');
    }

    if (error.response?.status === 500) {
      toast.error('Sunucu hatası oluştu');
    }

    const errorData = {
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.detail || error.message
    };
    
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

      if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
        toast.success('Başarıyla giriş yapıldı');
      }

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
      
      toast.error(errorMessage);
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
      toast.success('Kayıt işlemi başarılı');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kayıt hatası:', error.response?.data);
      
      // Hatanın tipini kontrol et ve uygun mesaj döndür
      let errorMessage = 'Kayıt işlemi başarısız oldu';
      
      if (error.response?.data?.detail) {
        // detail bir array olabilir
        if (Array.isArray(error.response.data.detail)) {
          // İlk hatayı al
          const firstError = error.response.data.detail[0];
          if (firstError.msg) {
            if (firstError.loc && firstError.loc.includes("password_confirm") && firstError.type === "missing") {
              errorMessage = "Şifre tekrarı gereklidir";
            } else {
              errorMessage = firstError.msg;
            }
          }
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        }
      }
      
      toast.error(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data
      };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Şifre sıfırlama isteği başarısız oldu');
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
      toast.success('Şifreniz başarıyla sıfırlandı');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Şifre sıfırlama işlemi başarısız oldu';
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      
      // Kullanıcı rolünü loglama
     
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Profil bilgileri alma hatası:', error);
      toast.error(error.response?.data?.detail || 'Profil bilgileri alınamadı');
      return {
        success: false,
        message: error.response?.data?.detail || 'Profil bilgileri alınamadı',
        error: error.response?.data
      };
    }
  },
};

export const ticketService = {
  getTickets: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Sayfalama parametreleri
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.per_page !== undefined) queryParams.append('per_page', params.per_page);
      
      // Filtreleme parametreleri
      if (params.status) queryParams.append('status', params.status);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.category) queryParams.append('category', params.category);
      
      // Sıralama parametreleri
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);

      const response = await api.get(`/tickets/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      toast.error('Talepler yüklenirken bir hata oluştu');
      return {
        success: false,
        message: error.api?.message || 'Talepler yüklenirken bir hata oluştu',
        error: error.api
      };
    }
  },

  getTicketById: async (id) => {
    try {
      
      if (!id) {
        console.error('Geçersiz ID: null veya undefined');
        throw new Error('Geçersiz talep ID');
      }
      
      // UUID formatı kontrolü
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        console.warn(`Uyarı: ID bir UUID formatında değil: ${id}`);
      }
      
      // URL'nin başına / eklemeden API çağrısı yapıyoruz
      const response = await api.get(`/tickets/${id}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Talep detayları yüklenirken hata:', error);
      console.error('Detaylı hata:', {
        message: error.message,
        config: error.config,
        response: error.response
      });
      
      let errorMessage = 'Talep detayları yüklenirken bir hata oluştu';
      if (error.response?.status === 404) {
        errorMessage = `Talep bulunamadı: ${id}`;
      } else if (error.response?.status === 422) {
        errorMessage = `Geçersiz talep ID formatı: ${id}`;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data || error.message
      };
    }
  },

  createTicket: async (data) => {
    try {
      const response = await api.post('/tickets/', data);
      toast.success('Talep başarıyla oluşturuldu');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Talep oluşturulurken hata:', error);
      toast.error(error.api?.message || 'Talep oluşturulurken bir hata oluştu');
      return {
        success: false,
        message: error.api?.message || 'Talep oluşturulurken bir hata oluştu',
        error: error.api
      };
    }
  },

  updateTicket: async (id, data) => {
    try {
      const response = await api.put(`/tickets/${id}`, data);
      toast.success('Talep başarıyla güncellendi');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Talep güncellenirken hata:', error);
      toast.error(error.api?.message || 'Talep güncellenirken bir hata oluştu');
      return {
        success: false,
        message: error.api?.message || 'Talep güncellenirken bir hata oluştu',
        error: error.api
      };
    }
  },

  deleteTicket: async (id) => {
    try {
      const response = await api.delete(`/tickets/${id}`);
      toast.success('Talep başarıyla silindi');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Talep silinirken hata:', error);
      toast.error(error.api?.message || 'Talep silinirken bir hata oluştu');
      return {
        success: false,
        message: error.api?.message || 'Talep silinirken bir hata oluştu',
        error: error.api
      };
    }
  },

  updateTicketStatus: async (ticketId, status) => {
    try {
      const response = await api.put(`/tickets/${ticketId}/status`, { status });
      toast.success('Talep durumu güncellendi');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Talep durumu güncellenirken bir hata oluştu');
      return {
        success: false,
        message: error.response?.data?.detail || 'Talep durumu güncellenirken bir hata oluştu',
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
      toast.success('Dosya başarıyla yüklendi');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Dosya yüklenirken bir hata oluştu');
      return {
        success: false,
        message: error.response?.data?.detail || 'Dosya yüklenirken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  // İstatistik Endpoint'leri
  getStats: async () => {
    try {
      const response = await api.get('/tickets/stats/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      toast.error('İstatistikler alınırken bir hata oluştu');
      return {
        success: false,
        message: error.response?.data?.detail || 'İstatistikler alınırken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  getDepartmentStats: async () => {
    try {
      const response = await api.get('/tickets/stats/department');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      toast.error('Departman istatistikleri alınırken bir hata oluştu');
      return {
        success: false,
        message: error.response?.data?.detail || 'Departman istatistikleri alınırken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  getUserStats: async () => {
    try {
      const response = await api.get('/tickets/stats/user');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      toast.error('Kullanıcı istatistikleri alınırken bir hata oluştu');
      return {
        success: false,
        message: error.response?.data?.detail || 'Kullanıcı istatistikleri alınırken bir hata oluştu',
        error: error.response?.data
      };
    }
  }
};

export const adminService = {
  assignTicket: async (ticket_id, user_id) => {
    try {
      const response = await api.put(`/tickets/admin/tickets/${ticket_id}/assign`, {
        user_id : user_id,
        ticket_id : ticket_id
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.api?.message || 'Talep atama işlemi başarısız oldu',
        error: error.api
      };
    }
  },

  getUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.skip !== undefined) queryParams.append('skip', params.skip);
      if (params.limit !== undefined) queryParams.append('limit', params.limit);
      
      const response = await api.get(`auth/admin/users/?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.api?.message || 'Kullanıcılar yüklenirken bir hata oluştu',
        error: error.api
      };
    }
  },

  // Ticket Admin İşlemleri
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
        message: error.response?.data?.detail || 'Ticket silme işlemi başarısız oldu',
        error: error.response?.data
      };
    }
  },

  // Departman Yönetimi
  getDepartments: async (params = {}) => {
    try {
      const response = await api.get('/departments/', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Departmanlar alınırken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  createDepartment: async (departmentData) => {
    try {
      const response = await api.post('/departments/', departmentData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Departman oluşturulurken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  updateDepartment: async (departmentId, departmentData) => {
    try {
      const response = await api.put(`/departments/${departmentId}`, departmentData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Departman güncellenirken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  deleteDepartment: async (departmentId) => {
    try {
      const response = await api.delete(`/departments/${departmentId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Departman silinirken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  // Kullanıcı Yönetimi
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/users/${userId}/role`, { role });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Kullanıcı rolü güncellenirken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  updateUserDepartment: async (userId, departmentId) => {
    try {
      const response = await api.put(`/users/${userId}/department`, { department_id: departmentId });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Kullanıcı departmanı güncellenirken bir hata oluştu',
        error: error.response?.data
      };
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.put(`/users/${userId}/status`, { status });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Kullanıcı durumu güncellenirken bir hata oluştu',
        error: error.response?.data
      };
    }
  },
};

export default api;