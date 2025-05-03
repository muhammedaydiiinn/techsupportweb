import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './EditTicket.css';

const EditTicket = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    status: '',
    department_id: '',
    assigned_to_id: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!ticketId) {
        setError('Geçersiz talep ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Talep detaylarını getir
        const ticketResponse = await ticketService.getTicketById(ticketId);
        if (!ticketResponse || !ticketResponse.data) {
          throw new Error('Talep bilgileri alınamadı');
        }
        
        // Admin ise departman ve kullanıcı listelerini getir
        let departmentsData = [];
        let usersData = [];
        
        if (user.role === 'admin') {
          try {
            // Normalde burada departman ve kullanıcı listelerini alacak servis çağrıları yapılır
            // Şu an için boş liste kullanıyoruz
            departmentsData = [];
            usersData = [];
          } catch (err) {
            console.error('Yardımcı veriler yüklenemedi:', err);
          }
        }

        setFormData({
          title: ticketResponse.data.title || '',
          description: ticketResponse.data.description || '',
          category: ticketResponse.data.category || '',
          priority: ticketResponse.data.priority || '',
          status: ticketResponse.data.status || '',
          department_id: ticketResponse.data.department_id || '',
          assigned_to_id: ticketResponse.data.assigned_to ? ticketResponse.data.assigned_to.id : ''
        });
        
        setDepartments(departmentsData);
        setUsers(usersData);
        setError('');
        
      } catch (err) {
        console.error('Veri yükleme hatası:', err);
        setError(typeof err === 'string' ? err : 
          (err.message || 'Veriler yüklenirken bir hata oluştu'));
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticketId, user.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await ticketService.updateTicket(ticketId, formData);
      if (response && response.status === 200) {
        toast.success('Talep başarıyla güncellendi');
        navigate(`/tickets/${ticketId}`);
      } else {
        setError('Talep güncellenemedi');
        toast.error('Talep güncellenemedi');
      }
    } catch (err) {
      console.error('Güncelleme hatası:', err);
      setError(typeof err === 'string' ? err : 
        (err.message || 'Talep güncellenirken bir hata oluştu'));
      toast.error('Talep güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-ticket-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="edit-ticket-container">
      <div className="edit-ticket-header">
        <button 
          className="back-button"
          onClick={() => navigate(`/tickets/${ticketId}`)}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Geri</span>
        </button>
        <h1>Talebi Düzenle</h1>
      </div>

      {error && (
        <div className="error-message">
          {typeof error === 'string' ? error : 'Bilinmeyen hata'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-ticket-form">
        <div className="form-group">
          <label htmlFor="title">Başlık</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Açıklama</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows="5"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Kategori</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Seçiniz</option>
              <option value="hardware">Donanım</option>
              <option value="software">Yazılım</option>
              <option value="network">Ağ/İnternet</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Öncelik</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              required
            >
              <option value="">Seçiniz</option>
              <option value="low">Düşük</option>
              <option value="medium">Normal</option>
              <option value="high">Yüksek</option>
              <option value="critical">Acil</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Durum</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="">Seçiniz</option>
              <option value="open">Açık</option>
              <option value="in_progress">İşlemde</option>
              <option value="resolved">Çözüldü</option>
              <option value="closed">Kapandı</option>
            </select>
          </div>
        </div>

        {user.role === 'admin' && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Departman</label>
              <select
                id="department"
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              >
                <option value="">Seçiniz</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assigned_to">Atanan Kişi</label>
              <select
                id="assigned_to"
                value={formData.assigned_to_id}
                onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
              >
                <option value="">Seçiniz</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate(`/tickets/${ticketId}`)}
          >
            İptal
          </button>
          <button 
            type="submit" 
            className="save-button"
            disabled={saving}
          >
            {saving ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              'Kaydet'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTicket; 