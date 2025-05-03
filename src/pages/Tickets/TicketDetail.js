import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faArrowLeft,
  faEdit,
  faUserPlus,
  faTrash,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { ticketService } from '../../services/ticketService'; // adminService'i de import et
import { departmentService } from '../../services/departmentService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './TicketDetail.css';
import AssignTicketModal from '../../components/AssignTicketModal/AssignTicketModal';

const TicketDetail = () => {
  const params = useParams();
  const ticketId = params.id;
  
  console.log('URL Parametreleri:', params);
  console.log('Çözümlenen ticketId:', ticketId);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Değerleri güvenli bir şekilde görüntülemek için yardımcı fonksiyon
  const safeRender = (value, defaultValue = 'Bilinmiyor') => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
  };

  const fetchDepartment = useCallback(async (departmentId) => {
    if (!departmentId) return;
    
    try {
      const response = await departmentService.getDepartmentById(departmentId);
      if (response && response.data) {
        setDepartment(response.data);
      }
    } catch (err) {
      console.error('Departman bilgisi alınamadı:', err);
    }
  }, []);

  const fetchTicketDetails = useCallback(async () => {
    if (!ticketId || ticketId === 'undefined' || ticketId === 'error' || ticketId === 'null') {
      setError(`Geçersiz talep ID: ${ticketId || 'boş değer'}. Lütfen talep listesine dönün ve geçerli bir talep seçin.`);
      setLoading(false);
      return;
    }

    // ID formatı kontrolü
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(ticketId)) {
      console.warn(`Uyarı: ID bir UUID formatında değil: ${ticketId}`);
    }

    try {
      setLoading(true);
      setError(''); // Önceki hataları temizle
      
      console.log(`Talep detayları yükleniyor - Talep ID: ${ticketId}`);
      
      // api.js'deki ticketService kullanılıyor
      const result = await ticketService.getTicketById(ticketId);
      
      console.log(`Talep API yanıtı:`, result);
      
      if (result.success && result.data) {
        console.log('Talep detayları:', result.data);
        setTicket(result.data);
        
        // Departman bilgisini çek
        if (result.data.department_id) {
          fetchDepartment(result.data.department_id);
        }
      } else {
        setError(result.message || 'Talep verisi alınamadı');
      }
    } catch (err) {
      console.error('Talep detayları yüklenirken hata:', err);
      
      // Hata detaylarını ayrıntılı logla
      console.error('Hata detayları:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      
      // Kullanıcı dostu hata mesajı
      setError(err.message || 'Talep detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [ticketId, fetchDepartment]);

  useEffect(() => {
    console.log(`TicketDetail useEffect çalıştı - ticketId: ${ticketId}`);
    
    // Doğru ticketService'in import edildiğini kontrol edelim
    console.log('Kullanılan ticketService:', ticketService);
    
    fetchTicketDetails();
  }, [fetchTicketDetails, ticketId]);

  const handleDelete = async () => {
    if (window.confirm('Bu talebi silmek istediğinizden emin misiniz?')) {
      try {
        console.log(`Talep siliniyor - ID: ${ticketId}`);
        // ticketService yerine adminService kullan
        const result = await ticketService.deleteTicket(ticketId);
        
        if (result.success) {
          toast.success('Talep başarıyla silindi');
          navigate('/tickets');
        } else {
          toast.error(result.message || 'Talep silinirken bir hata oluştu');
        }
      } catch (err) {
        console.error('Silme hatası:', err);
        toast.error('Talep silinirken bir hata oluştu');
      }
    }
  };

  const handleAssign = () => {
    setIsAssignModalOpen(true);
  };

  const handleAssignSuccess = () => {
    fetchTicketDetails();
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'open': 'blue',
      'in_progress': 'orange',
      'resolved': 'green',
      'closed': 'gray'
    };
    return statusMap[status] || 'gray';
  };

  const getPriorityBadgeClass = (priority) => {
    const priorityMap = {
      'low': 'green',
      'medium': 'orange',
      'high': 'red',
      'critical': 'purple'
    };
    return priorityMap[priority] || 'gray';
  };

  if (loading) {
    return (
      <div className="ticket-detail-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticket-detail-error">
        <FontAwesomeIcon icon={faExclamationCircle} />
        <span>{typeof error === 'string' ? error : 'Bilinmeyen hata'}</span>
        <button onClick={() => navigate('/tickets')}>Geri Dön</button>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-detail-error">
        <FontAwesomeIcon icon={faExclamationCircle} />
        <span>Talep bulunamadı</span>
        <button onClick={() => navigate('/tickets')}>Geri Dön</button>
      </div>
    );
  }

  return (
    <div className="ticket-detail-page">
      <div className="ticket-detail-header">
        <button 
          className="back-button"
          onClick={() => navigate('/tickets')}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Geri</span>
        </button>

        {user && (user.role === 'admin' || user.role === 'support') && (
          <div className="action-buttons">
            <button 
              className="edit-button"
              onClick={() => navigate(`/tickets/${ticketId}/edit`)}
            >
              <FontAwesomeIcon icon={faEdit} />
              <span>Düzenle</span>
            </button>
            <button 
              className="assign-button"
              onClick={handleAssign}
            >
              <FontAwesomeIcon icon={faUserPlus} />
              <span>Ata</span>
            </button>
            <button 
              className="delete-button"
              onClick={handleDelete}
            >
              <FontAwesomeIcon icon={faTrash} />
              <span>Sil</span>
            </button>
          </div>
        )}
      </div>

      <div className="ticket-detail-content">
        <div className="ticket-detail-main">
          <h1>{safeRender(ticket.title)}</h1>
          
          <div className="ticket-meta">
            <div className={`status-badge ${getStatusBadgeClass(ticket.status)}`}>
              {safeRender(ticket.status)}
            </div>
            <div className={`priority-badge ${getPriorityBadgeClass(ticket.priority)}`}>
              {safeRender(ticket.priority)}
            </div>
            <div className="category-badge">
              {safeRender(ticket.category)}
            </div>
          </div>

          <div className="ticket-info">
            <div className="info-item">
              <label>Oluşturan:</label>
              <span>
                {ticket.created_by ? 
                  `${safeRender(ticket.created_by.first_name)} ${safeRender(ticket.created_by.last_name)} (${safeRender(ticket.created_by.email)})` : 
                  'Bilinmiyor'}
              </span>
            </div>
            <div className="info-item">
              <label>Oluşturulma Tarihi:</label>
              <span>
                {ticket.created_at ? 
                  new Date(ticket.created_at).toLocaleString('tr-TR') : 
                  'Bilinmiyor'}
              </span>
            </div>
            {ticket.assigned_to && (
              <div className="info-item">
                <label>Atanan:</label>
                <span>
                  {`${safeRender(ticket.assigned_to.first_name)} ${safeRender(ticket.assigned_to.last_name)} (${safeRender(ticket.assigned_to.email)})`}
                </span>
              </div>
            )}
            {ticket.department_id && (
              <div className="info-item">
                <label>Departman:</label>
                <span>
                  {department ? safeRender(department.name) : 'Yükleniyor...'}
                </span>
              </div>
            )}
            <div className="info-item">
              <label>Son Güncelleme:</label>
              <span>
                {ticket.updated_at ? 
                  new Date(ticket.updated_at).toLocaleString('tr-TR') : 
                  'Güncelleme yok'}
              </span>
            </div>
          </div>

          <div className="ticket-description">
            <h2>Açıklama</h2>
            <p>{safeRender(ticket.description)}</p>
          </div>
        </div>
      </div>

      <AssignTicketModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        ticketId={ticketId}
        onAssign={handleAssignSuccess}
      />
    </div>
  );
};

export default TicketDetail; 