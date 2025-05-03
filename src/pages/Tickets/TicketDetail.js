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
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './TicketDetail.css';
import AssignTicketModal from '../../components/AssignTicketModal/AssignTicketModal';

const TicketDetail = () => {
  const { ticketId } = useParams();
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
      // Bu kısmı servisler oluşturulduktan sonra düzeltebiliriz
      const response = await fetch(`http://127.0.0.1:8001/api/v1/departments/${departmentId}`);
      const data = await response.json();
      if (data) {
        setDepartment(data);
      }
    } catch (err) {
      console.error('Departman bilgisi alınamadı:', err);
    }
  }, []);

  const fetchTicketDetails = useCallback(async () => {
    if (!ticketId || ticketId === 'undefined' || ticketId === 'error') {
      setError('Geçersiz talep ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(''); // Önceki hataları temizle
      
      const response = await ticketService.getTicketById(ticketId);
      
      if (response && response.data) {
        console.log('Talep detayları:', response.data);
        setTicket(response.data);
        
        // Departman bilgisini çek
        if (response.data.department_id) {
          fetchDepartment(response.data.department_id);
        }
      } else {
        setError('Talep verisi alınamadı');
      }
    } catch (err) {
      console.error('Talep detayları yüklenirken hata:', err);
      
      // Kullanıcı dostu hata mesajı
      if (err.message) {
        setError(err.message);
      } else if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Talep detayları yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  }, [ticketId, fetchDepartment]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  const handleDelete = async () => {
    if (window.confirm('Bu talebi silmek istediğinizden emin misiniz?')) {
      try {
        const response = await ticketService.deleteTicket(ticketId);
        if (response && response.status === 200) {
          toast.success('Talep başarıyla silindi');
          navigate('/tickets');
        } else {
          toast.error('Talep silinirken bir hata oluştu');
        }
      } catch (err) {
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