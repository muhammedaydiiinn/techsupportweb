import axiosInstance from './axiosConfig';
import { SupportLevelLabels } from '../constants/supportLevels';

const ticketService = {
  // Yapay zeka yanıtlarını getir
  getTicketAiResponses: async (ticketId) => {
    try {
      if (!ticketId) {
        throw new Error('Geçersiz talep ID');
      }

      const response = await axiosInstance.get(`/ai/ticket/${ticketId}/ai-responses`);
      
      // Yanıtları oluşturulma tarihine göre sırala
      const sortedResponses = response.data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      return {
        success: true,
        data: sortedResponses
      };
    } catch (error) {
      console.error('Yapay zeka yanıtları getirilirken hata:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Yapay zeka yanıtları getirilirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },
  // Son destek taleplerini getir
  getRecentTickets: async () => {
    try {
      // Parametre olarak limit ekleyerek son birkaç talebi getirebiliriz
      const response = await axiosInstance.get(`/tickets`, { 
        params: { 
          limit: 5,
          sort: 'created_at:desc' 
        } 
      });
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Son talepler getirilirken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Son talepler getirilirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Genel talep istatistiklerini getir
  getTicketStats: async () => {
    try {
      const response = await axiosInstance.get(`/tickets/stats/`);
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Talep istatistikleri getirilirken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Talep istatistikleri getirilirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Departman bazlı istatistikleri getir
  getDepartmentStats: async () => {
    try {
      const response = await axiosInstance.get(`/tickets/stats/department`);
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Departman istatistikleri getirilirken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Departman istatistikleri getirilirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Kullanıcı bazlı istatistikleri getir
  getUserStats: async () => {
    try {
      const response = await axiosInstance.get(`/tickets/stats/user`);
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Kullanıcı istatistikleri getirilirken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Kullanıcı istatistikleri getirilirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Tüm talepleri getir
  getAllTickets: async (params) => {
    try {
      const response = await axiosInstance.get(`/tickets`, { params });
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Talepler getirilirken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Talepler getirilirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Admin için tüm talepleri getir
  getAllTicketsAdmin: async (params) => {
    try {
      const response = await axiosInstance.get(`/tickets/admin/tickets`, { params });
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Admin talepleri getirilirken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Admin talepleri getirilirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Talep detayını getir
  getTicketById: async (id) => {
    try {
      // ID parametresinin kontrolü
      if (!id || id === 'undefined' || id === 'error' || id === 'null') {
        throw new Error(`Geçersiz talep ID: ${id}`);
      }
      
      // UUID formatı kontrolü (çoğu durumda UUID olacak)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUuid = uuidRegex.test(id);
      
      if (!isUuid) {
        console.warn(`Uyarı: ID bir UUID formatında değil: ${id}`);
        // Burada sayısal ID kontrolü de yapabilirsiniz
        // const isNumeric = !isNaN(parseInt(id));
        // if (!isNumeric) {...}
      }
      
      // API çağrısı - URL, axiosInstance içindeki baseURL ile birleştirilecek
      
      // UUID olarak istek gönder (bu API için önemli)
      const response = await axiosInstance.get(`/tickets/${id}`);
      
      
      // Yanıt kontrolü
      if (!response || !response.data) {
        throw new Error(`ID: ${id} için talep bulunamadı`);
      }
      
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Talep detayı getirilirken hata:', error);
      console.error('Hata detayları:', {
        message: error.message,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : null,
        request: error.request ? {
          responseURL: error.request.responseURL,
          status: error.request.status,
          responseText: error.request.responseText
        } : null,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          baseURL: error.config.baseURL,
          headers: error.config.headers
        } : null
      });
      
      // Hata mesajını belirle
      let errorMessage = 'Talep detayları yüklenirken bir hata oluştu';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = `ID: ${id} için talep bulunamadı`;
        } else if (error.response.status === 403) {
          errorMessage = 'Bu talebi görüntüleme yetkiniz yok';
        } else if (error.response.status === 401) {
          errorMessage = 'Oturum süresi dolmuş, lütfen tekrar giriş yapın';
        } else if (error.response.status === 422) {
          errorMessage = `Geçersiz talep ID formatı: ${id}`;
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data || error.message
      };
    }
  },

  // Yeni talep oluştur
  createTicket: async (ticketData) => {
    try {
      let headers = {};
      
      // Eğer FormData kullanılıyorsa, Content-Type header'ını ayarlama (browser otomatik ekler)
      if (!(ticketData instanceof FormData)) {
        headers = {
          'Content-Type': 'application/json'
        };
      }
      console.log('Yeni talep verisi:', ticketData);
      
      const response = await axiosInstance.post(`/tickets`, ticketData, { headers });
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Talep oluşturulurken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Talep oluşturulurken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Talep güncelle
  updateTicket: async (id, ticketData) => {
    try {
      const response = await axiosInstance.put(`/tickets/${id}`, ticketData);
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Talep güncellenirken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Talep güncellenirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Talep durumunu güncelle
  updateTicketStatus: async (id, status) => {
    try {
      const response = await axiosInstance.put(`/tickets/${id}/status`, { status });
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Talep durumu güncellenirken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Talep durumu güncellenirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Talebi sil (admin)
  deleteTicket: async (id) => {
    try {
      const response = await axiosInstance.delete(`/tickets/admin/tickets/${id}`);
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Talep silinirken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Talep silinirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Talep dosya ekle
  uploadAttachment: async (ticketId, formData) => {
    try {
      const response = await axiosInstance.post(`/tickets/${ticketId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Dosya yüklenirken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Dosya yüklenirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Ticket'a ekipman ilişkilendirme
  addEquipmentToTicket: async (ticketId, equipmentId) => {
    try {
      const response = await axiosInstance.post(`/tickets/${ticketId}/equipment`, { equipment_id: equipmentId });
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Ekipman ilişkilendirme sırasında hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Ekipman ilişkilendirme sırasında bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Ticket'tan ekipman ilişkisini kaldırma
  removeEquipmentFromTicket: async (ticketId, equipmentId) => {
    try {
      const response = await axiosInstance.delete(`/tickets/${ticketId}/equipment/${equipmentId}`);
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Ekipman ilişkisi kaldırılırken hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Ekipman ilişkisi kaldırılırken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Talep atama işlemi (admin)
  assignTicket: async (id, assignedToId, note = '') => {
    try {
      const response = await axiosInstance.put(`/tickets/admin/tickets/${id}/assign`, { 
        user_id: assignedToId,
        ticket_id: id,
        note
      });
      // API.js servisinde kullanılan success formatına uygun yanıt döndür
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Talep atama işlemi sırasında hata:', error);
      // API.js servisinde kullanılan hata formatına uygun yanıt döndür
      return {
        success: false,
        message: error.response?.data?.message || 'Talep atama işlemi sırasında bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Destek seviyesini güncelle
  updateSupportLevel: async (ticketId, supportLevel) => {
    try {
      // Support level değerini büyük harfe çevir
      const formattedSupportLevel = supportLevel.toUpperCase();

      // API endpoint'ine göre query parameter olarak gönder
      const response = await axiosInstance.put(`/tickets/${ticketId}/support-level`, null, {
        params: {
          support_level: formattedSupportLevel
        }
      });

      // Başarılı yanıt kontrolü
      if (response.status === 200) {
        // Activity log oluştur
        await ticketService.createActivityLog(
          ticketId,
          'support_level_changed',
          `Destek seviyesi ${SupportLevelLabels[supportLevel]} olarak güncellendi`
        );

        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error('Destek seviyesi güncellenirken beklenmeyen bir hata oluştu');
      }
    } catch (error) {
      console.error('Destek seviyesi güncellenirken hata:', error);
      
      // Hata durumlarına göre özel mesajlar
      let errorMessage = 'Destek seviyesi güncellenirken bir hata oluştu';
      
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = 'Talep bulunamadı';
            break;
          case 403:
            errorMessage = 'Bu işlem için yetkiniz bulunmuyor';
            break;
          case 422:
            errorMessage = 'Geçersiz destek seviyesi değeri';
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      }

      return {
        success: false,
        message: errorMessage,
        error: error.response?.data || error.message
      };
    }
  },

  // AI analizi başlat
  startAIAnalysis: async (ticketId) => {
    try {
      const response = await axiosInstance.post(`/tickets/${ticketId}/ai-analysis`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('AI analizi başlatılırken hata:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'AI analizi başlatılırken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Timeline'ı getir
  getTicketTimeline: async (ticketId) => {
    try {
      const response = await axiosInstance.get(`/tickets/${ticketId}/timeline`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Timeline getirilirken hata:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Timeline getirilirken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  },

  // Activity log oluştur
  createActivityLog: async (ticketId, activityType, description) => {
    try {
      const response = await axiosInstance.post(`/tickets/${ticketId}/activity-log`, {
        activity_type: activityType,
        description: description
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Activity log oluşturulurken hata:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Activity log oluşturulurken bir hata oluştu',
        error: error.response?.data || error.message
      };
    }
  }
};

export { ticketService };