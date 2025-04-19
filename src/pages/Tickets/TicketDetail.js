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
import { ticketService, adminService } from '../../api';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './TicketDetail.css';

const TicketDetail = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDepartment = useCallback(async (departmentId) => {
    try {
      const response = await api.get(`/departments/${departmentId}`);
      if (response.data) {
        setDepartment(response.data);
      }
    } catch (err) {
      console.error('Departman bilgisi alınamadı:', err);
    }
  }, []);

  const fetchTicketDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketById(ticketId);
      
      if (response.success) {
        setTicket(response.data);
        if (response.data.department_id) {
          fetchDepartment(response.data.department_id);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Talep detayları yüklenirken bir hata oluştu');
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
        const response = await adminService.deleteTicket(ticketId);
        if (response.success) {
          toast.success('Talep başarıyla silindi');
          navigate('/tickets/list');
        } else {
          toast.error(response.message);
        }
      } catch (err) {
        toast.error('Talep silinirken bir hata oluştu');
      }
    }
  };

  const handleAssign = async () => {
    const userId = prompt('Atanacak kullanıcı ID:');
    if (userId) {
      try {
        const response = await adminService.assignTicket(ticketId, userId);
        if (response.success) {
          toast.success('Talep başarıyla atandı');
          fetchTicketDetails();
        } else {
          toast.error(response.message);
        }
      } catch (err) {
        toast.error('Talep atama işlemi başarısız oldu');
      }
    }
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
        <span>{error}</span>
        <button onClick={() => navigate('/tickets/list')}>Geri Dön</button>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-detail-error">
        <FontAwesomeIcon icon={faExclamationCircle} />
        <span>Talep bulunamadı</span>
        <button onClick={() => navigate('/tickets/list')}>Geri Dön</button>
      </div>
    );
  }

  return (
    <div className="ticket-detail-page">
      <div className="ticket-detail-header">
        <button 
          className="back-button"
          onClick={() => navigate('/tickets/list')}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Geri</span>
        </button>

        {user.role === 'ADMIN' && (
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
          <h1>{ticket.title}</h1>
          
          <div className="ticket-meta">
            <div className={`status-badge ${getStatusBadgeClass(ticket.status)}`}>
              {ticket.status}
            </div>
            <div className={`priority-badge ${getPriorityBadgeClass(ticket.priority)}`}>
              {ticket.priority}
            </div>
            <div className="category-badge">
              {ticket.category}
            </div>
          </div>

          <div className="ticket-info">
            <div className="info-item">
              <label>Oluşturan:</label>
              <span>
                {ticket.created_by ? 
                  `${ticket.created_by.first_name} ${ticket.created_by.last_name} (${ticket.created_by.email})` : 
                  'Bilinmiyor'}
              </span>
            </div>
            <div className="info-item">
              <label>Oluşturulma Tarihi:</label>
              <span>{new Date(ticket.created_at).toLocaleString('tr-TR')}</span>
            </div>
            {ticket.assigned_to && (
              <div className="info-item">
                <label>Atanan:</label>
                <span>
                  {`${ticket.assigned_to.first_name} ${ticket.assigned_to.last_name} (${ticket.assigned_to.email})`}
                </span>
              </div>
            )}
            {ticket.department_id && (
              <div className="info-item">
                <label>Departman:</label>
                <span>
                  {department ? department.name : 'Yükleniyor...'}
                </span>
              </div>
            )}
            <div className="info-item">
              <label>Son Güncelleme:</label>
              <span>
                {ticket.updated_at ? new Date(ticket.updated_at).toLocaleString('tr-TR') : 'Güncelleme yok'}
              </span>
            </div>
          </div>

          <div className="ticket-description">
            <h2>Açıklama</h2>
            <p>{typeof ticket.description === 'object' ? JSON.stringify(ticket.description) : ticket.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail; 