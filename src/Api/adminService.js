import api from './api';

export const getUsers = async () => {
  try {
    const response = await api.get('/auth/admin/users');
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Kullanıcılar yüklenirken bir hata oluştu'
    };
  }
};

export const deleteTicket = async (ticketId) => {
  try {
    const response = await api.delete(`/auth/admin/tickets/${ticketId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Talep silinirken bir hata oluştu'
    };
  }
}; 

export const assignTicket = async (ticketId, userId) => {
  try {
    const response = await api.put(`/tickets/admin/tickets/${ticketId}/assign`, {
      ticket_id: ticketId,
      user_id: userId
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Talep atama işlemi başarısız oldu'
    };
  }
}; 