import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faArrowLeft,
  faEdit,
  faUserPlus,
  faTrash,
  faExclamationCircle,
  faHistory,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import { ticketService } from '../../services/ticketService';
import { departmentService } from '../../services/departmentService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './TicketDetail.css';
import AssignTicketModal from '../../components/AssignTicketModal/AssignTicketModal';
import { SupportLevelLabels, SupportLevelDescriptions } from '../../constants/supportLevels';

const TicketDetail = () => {
  const params = useParams();
  const ticketId = params.id;
  
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [aiResponses, setAiResponses] = useState([]);
  const [loadingAiResponses, setLoadingAiResponses] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [ticketImages, setTicketImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

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
      
    
      // api.js'deki ticketService kullanılıyor
      const result = await ticketService.getTicketById(ticketId);
      
      
      if (result.success && result.data) {
        setTicket(result.data);
        
        // Departman bilgisini çek
        if (result.data.department_id) {
          fetchDepartment(result.data.department_id);
        }

        // Yapay zeka yanıtlarını getir
        try {
          setLoadingAiResponses(true);
          const aiResult = await ticketService.getTicketAiResponses(ticketId);
          if (aiResult.success) {
            setAiResponses(aiResult.data);
          }
        } catch (err) {
          console.error('Yapay zeka yanıtları yüklenirken hata:', err);
        } finally {
          setLoadingAiResponses(false);
        }

        // Timeline'ı getir
        const timelineResult = await ticketService.getTicketTimeline(ticketId);
        if (timelineResult.success) {
          setTimeline(timelineResult.data);
        }
        
        // Resimleri getir
        try {
          setLoadingImages(true);
          const imagesResult = await ticketService.getTicketImages(ticketId);
          if (imagesResult.success) {
            setTicketImages(imagesResult.data);
          }
        } catch (err) {
          console.error('Talep resimleri yüklenirken hata:', err);
        } finally {
          setLoadingImages(false);
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
   
    
    fetchTicketDetails();
  }, [fetchTicketDetails, ticketId]);

  const handleDelete = async () => {
    if (window.confirm('Bu talebi silmek istediğinizden emin misiniz?')) {
      try {
    
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

  const getPriorityBadge = (priority) => {
    const priorityValue = typeof priority === 'string' ? priority.toUpperCase() : priority;
    
    const styles = {
      LOW: { backgroundColor: '#F0FFF4', color: '#38A169', borderColor: '#9AE6B4' },
      MEDIUM: { backgroundColor: '#FFFAF0', color: '#DD6B20', borderColor: '#FBD38D' },
      HIGH: { backgroundColor: '#FFF5F5', color: '#E53E3E', borderColor: '#FEB2B2' },
      CRITICAL: { backgroundColor: '#FAF5FF', color: '#805AD5', borderColor: '#D6BCFA' }
    };

    const style = styles[priorityValue] || { backgroundColor: '#F7FAFC', color: '#4A5568', borderColor: '#CBD5E0' };

    return (
      <div style={{
        ...style,
        padding: '0.35rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '500',
        display: 'inline-block',
        border: '1px solid',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}>
        {priorityValue === 'LOW' ? 'Düşük' : 
         priorityValue === 'MEDIUM' ? 'Normal' : 
         priorityValue === 'HIGH' ? 'Yüksek' : 
         priorityValue === 'CRITICAL' ? 'Acil' : priority}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const statusValue = typeof status === 'string' ? status.toUpperCase() : status;
    
    return (
      <div className={`status-badge status-${statusValue?.toLowerCase()}`}>
        {statusValue === 'OPEN' ? 'Açık' : 
         statusValue === 'IN_PROGRESS' ? 'İşlemde' : 
         statusValue === 'WAITING' ? 'Beklemede' : 
         statusValue === 'RESOLVED' ? 'Çözüldü' : 
         statusValue === 'CLOSED' ? 'Kapandı' : status}
      </div>
    );
  };

  const getCategoryBadge = (category) => {
    const categoryValue = typeof category === 'string' ? category.toUpperCase() : category;
    const categories = {
      'HARDWARE': 'Donanım',
      'SOFTWARE': 'Yazılım',
      'NETWORK': 'Ağ/İnternet',
      'TECHNICAL': 'Teknik',
      'OTHER': 'Diğer'
    };
    
    return (
      <div className="category-badge">
        {categories[categoryValue] || categoryValue}
      </div>
    );
  };

  const handleSupportLevelChange = async (newLevel) => {
    try {
      // Yetki kontrolü
      if (!user || (user.role !== 'admin' && user.role !== 'support')) {
        toast.error('Bu işlem için yetkiniz bulunmuyor');
        return;
      }

      // Destek seviyesi değişikliği
      const response = await ticketService.updateSupportLevel(ticketId, newLevel);
      
      if (response.success) {
        // Ticket detaylarını yenile
        await fetchTicketDetails();
        toast.success('Destek seviyesi güncellendi');
      } else {
        toast.error(response.message || 'Destek seviyesi güncellenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Destek seviyesi güncelleme hatası:', err);
      toast.error('Destek seviyesi güncellenirken bir hata oluştu');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!ticket || !newStatus) return;
    
    try {
      // API'nin beklediği formatta durum gönder (büyük harflerle)
      const status = newStatus.toUpperCase();
      await ticketService.updateTicketStatus(ticketId, status);
      
      // Durumu güncelle ve yeni aktiviteyi göster
      setTicket(prev => ({ ...prev, status }));
      fetchTicketDetails();
      toast.success(`Talep durumu "${newStatus === 'IN_PROGRESS' ? 'İşlemde' : 
                                    newStatus === 'WAITING' ? 'Beklemede' : 
                                    newStatus === 'RESOLVED' ? 'Çözüldü' : 
                                    newStatus === 'CLOSED' ? 'Kapandı' : 
                                    newStatus === 'OPEN' ? 'Açık' : newStatus}" olarak güncellendi`);
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      toast.error('Durum güncellenirken bir hata oluştu');
    }
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
            <div className="status-badge-container">
              {user && (user.role === 'admin' || user.role === 'support') ? (
                <select
                  value={(ticket.status || '').toUpperCase()}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="status-select"
                >
                  <option value="OPEN">Açık</option>
                  <option value="IN_PROGRESS">İşlemde</option>
                  <option value="WAITING">Beklemede</option>
                  <option value="RESOLVED">Çözüldü</option>
                  <option value="CLOSED">Kapandı</option>
                </select>
              ) : (
                getStatusBadge(ticket.status)
              )}
            </div>
            <div className="priority-badge-container">
              {getPriorityBadge(ticket.priority)}
            </div>
            <div className="category-badge-container">
              {getCategoryBadge(ticket.category)}
            </div>
            <div className={`support-level-badge ${ticket.support_level}`}>
              {SupportLevelLabels[ticket.support_level]}
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
            
            <div className="info-item">
              <label>Destek Seviyesi:</label>
              
              {user && (user.role === 'admin' || user.role === 'support') ? (
                <select
                  value={ticket.current_support_level || ticket.support_level}
                  onChange={(e) => handleSupportLevelChange(e.target.value)}
                  className="support-level-select"
                >
                  {Object.entries(SupportLevelLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              ) : (
                
                <span>
                  {SupportLevelLabels[ticket.current_support_level || ticket.support_level]}
                  <small className="support-level-description">
                    {SupportLevelDescriptions[ticket.current_support_level || ticket.support_level]}
                  </small>
                </span>
              )}
            </div>
          </div>

          <div className="ticket-actions">
            <button
              className="timeline-button"
              onClick={() => setShowTimeline(!showTimeline)}
            >
              <FontAwesomeIcon icon={faHistory} />
              <span>Timeline</span>
            </button>
          </div>

          {showTimeline && (
            <div className="ticket-timeline">
              <h3>Timeline</h3>
              <div className="timeline-items">
                {timeline.map((item, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-date">
                      {new Date(item.created_at).toLocaleString('tr-TR')}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-type">{item.activity_type}</div>
                      <div className="timeline-description">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="ticket-description">
            <h2>Açıklama</h2>
            <p>{safeRender(ticket.description)}</p>
          </div>
          
          {/* Ticket Resimleri Bölümü */}
          <div className="ticket-images-section">
            <h2>
              <FontAwesomeIcon icon={faImage} style={{ marginRight: '8px' }} />
              Talep Resimleri
            </h2>
            {loadingImages ? (
              <div className="loading-spinner">
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Resimler yükleniyor...</span>
              </div>
            ) : ticketImages.length > 0 ? (
              <div className="ticket-images-grid">
                {ticketImages.map((image, index) => (
                  <div key={index} className="ticket-image-item">
                    <a 
                      href={image.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ticket-image-link"
                    >
                      <img 
                        src={image.file_url} 
                        alt={image.description || `Resim ${index + 1}`} 
                        className="ticket-image"
                      />
                      <div className="ticket-image-info">
                        <span className="ticket-image-name">{image.file_name}</span>
                        <span className="ticket-image-date">
                          {new Date(image.created_at).toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-images">
                Herhangi bir resim eklenmemiş.
              </div>
            )}
          </div>

          {/* Yapay Zeka Yanıtları Bölümü */}
          <div className="ai-responses-section">
            <h2>Yapay Zeka Yanıtları</h2>
            {loadingAiResponses ? (
              <div className="loading-spinner">
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Yapay zeka yanıtları yükleniyor...</span>
              </div>
            ) : aiResponses.length > 0 ? (
              <div className="ai-responses-list">
                {aiResponses.map((response, index) => (
                  <div key={index} className="ai-response-item">
                    <div className="ai-response-content">{response.content}</div>
                    <div className="ai-response-timestamp">
                      {new Date(response.created_at).toLocaleString('tr-TR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-ai-responses">
                Henüz yapay zeka yanıtı bulunmamaktadır.
              </div>
            )}
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