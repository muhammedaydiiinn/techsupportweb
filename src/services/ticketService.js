import axiosInstance from './axiosConfig';

const ticketService = {
  // Son destek taleplerini getir - Bu endpoint olmadığı için normal tickets endpoint'ini kullanıyoruz
  getRecentTickets: async () => {
    try {
      // Parametre olarak limit ekleyerek son birkaç talebi getirebiliriz
      const response = await axiosInstance.get(`/tickets`, { 
        params: { 
          limit: 5,
          sort: 'created_at:desc' 
        } 
      });
      return response;
    } catch (error) {
      console.error('Son talepler getirilirken hata:', error);
      throw error;
    }
  },

  // Talep istatistiklerini getir - Bu endpoint olmadığı için dashboard verilerini başka şekilde oluşturmalıyız
  getTicketStats: async () => {
    try {
      // Tüm talepleri getirip frontend'de istatistiklerini hesaplayalım
      const response = await axiosInstance.get(`/tickets`);
      
      // Eğer backend'de özel bir endpoint yoksa, frontend'de hesaplama yapacağız
      // İstatistikler olmadığından varsayılan değerler döndürelim
      const mockStats = {
        total: response.data.length || 0,
        open: response.data.filter(ticket => ticket.status === 'OPEN').length || 0,
        inProgress: response.data.filter(ticket => ticket.status === 'IN_PROGRESS').length || 0,
        closed: response.data.filter(ticket => ticket.status === 'CLOSED').length || 0
      };
      
      return {
        ...response,
        data: mockStats
      };
    } catch (error) {
      console.error('Talep istatistikleri getirilirken hata:', error);
      throw error;
    }
  },

  // Tüm talepleri getir
  getAllTickets: async (params) => {
    try {
      const response = await axiosInstance.get(`/tickets`, { params });
      return response;
    } catch (error) {
      console.error('Talepler getirilirken hata:', error);
      throw error;
    }
  },

  // Admin için tüm talepleri getir
  getAllTicketsAdmin: async (params) => {
    try {
      const response = await axiosInstance.get(`/tickets/admin/tickets`, { params });
      return response;
    } catch (error) {
      console.error('Admin talepleri getirilirken hata:', error);
      throw error;
    }
  },

  // Talep detayını getir
  getTicketById: async (id) => {
    try {
      // ID parametresinin kontrolü
      if (!id || id === 'undefined') {
        throw new Error('Geçersiz talep ID');
      }
      
      // API path'ini düzelt
      const response = await axiosInstance.get(`/tickets/${id}`);
      
      // Yanıt kontrolü
      if (!response || !response.data) {
        throw new Error('Talep bulunamadı');
      }
      
      return response;
    } catch (error) {
      console.error('Talep detayı getirilirken hata:', error);
      
      // Daha açıklayıcı hata mesajları
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error('Talep bulunamadı');
        } else if (error.response.status === 403) {
          throw new Error('Bu talebi görüntüleme yetkiniz yok');
        } else if (error.response.status === 401) {
          throw new Error('Oturum süresi dolmuş, lütfen tekrar giriş yapın');
        } else if (error.response.status === 422) {
          throw new Error('Geçersiz talep ID formatı');
        }
      }
      
      throw error;
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
      
      const response = await axiosInstance.post(`/tickets`, ticketData, { headers });
      return response;
    } catch (error) {
      console.error('Talep oluşturulurken hata:', error);
      throw error;
    }
  },

  // Talep güncelle
  updateTicket: async (id, ticketData) => {
    try {
      const response = await axiosInstance.put(`/tickets/${id}`, ticketData);
      return response;
    } catch (error) {
      console.error('Talep güncellenirken hata:', error);
      throw error;
    }
  },

  // Talep durumunu güncelle
  updateTicketStatus: async (id, status) => {
    try {
      const response = await axiosInstance.put(`/tickets/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Talep durumu güncellenirken hata:', error);
      throw error;
    }
  },

  // Talebi sil (admin)
  deleteTicket: async (id) => {
    try {
      const response = await axiosInstance.delete(`/tickets/admin/tickets/${id}`);
      return response;
    } catch (error) {
      console.error('Talep silinirken hata:', error);
      throw error;
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
      return response;
    } catch (error) {
      console.error('Dosya yüklenirken hata:', error);
      throw error;
    }
  },

  // Ticket'a ekipman ilişkilendirme
  addEquipmentToTicket: async (ticketId, equipmentId) => {
    try {
      const response = await axiosInstance.post(`/tickets/${ticketId}/equipment`, { equipment_id: equipmentId });
      return response;
    } catch (error) {
      console.error('Ekipman ilişkilendirme sırasında hata:', error);
      throw error;
    }
  },

  // Ticket'tan ekipman ilişkisini kaldırma
  removeEquipmentFromTicket: async (ticketId, equipmentId) => {
    try {
      const response = await axiosInstance.delete(`/tickets/${ticketId}/equipment/${equipmentId}`);
      return response;
    } catch (error) {
      console.error('Ekipman ilişkisi kaldırılırken hata:', error);
      throw error;
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
      return response;
    } catch (error) {
      console.error('Talep atama işlemi sırasında hata:', error);
      throw error;
    }
  }
};

export { ticketService }; 