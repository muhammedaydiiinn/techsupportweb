import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ticketService } from '../../services/ticketService'; // adminService'i de import et
import { departmentService } from '../../services/departmentService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './EditTicket.css';

const EditTicket = () => {
  const { id } = useParams();
  const ticketId = id;
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
      // URL'den gelen ticketId parametresini kontrol et
      if (!ticketId || ticketId === 'undefined' || ticketId === 'null') {
        console.error(`Geçersiz talep ID: ${ticketId || 'boş değer'}`);
        setError(`Geçersiz talep ID: ${ticketId || 'boş değer'}. Lütfen talep listesine dönün ve geçerli bir talep seçin.`);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // ID kontrolü - UUID formatı kontrolü
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(ticketId)) {
          console.warn(`Uyarı: ID bir UUID formatında değil: ${ticketId}`);
        }
        
        // Talep detaylarını getir - api.js'den ticketService kullanılıyor
        const ticketResult = await ticketService.getTicketById(ticketId);
        
        
        if (!ticketResult.success || !ticketResult.data) {
          throw new Error(ticketResult.message || 'Talep bilgileri alınamadı');
        }
        
        // Departman ve kullanıcı listelerini getir
        let departmentsData = [];
        let usersData = [];
        
        try {
          // Departmanları getir
          const deptResponse = await departmentService.getAllDepartments();
          
          if (deptResponse && deptResponse.data) {
            departmentsData = deptResponse.data;
          }
          
          // Kullanıcıları getir (yetki varsa)
          if (user.role === 'admin' || user.role === 'support') {
            const userResponse = await userService.getAllUsers();
            
            if (userResponse && userResponse.data) {
              usersData = userResponse.data;
            }
          }
        } catch (err) {
          console.error('Yardımcı veriler yüklenemedi:', err);
          console.error('Yardımcı veri hata detayları:', {
            message: err.message,
            stack: err.stack,
            response: err.response
          });
        }

        
        setFormData({
          title: ticketResult.data.title || '',
          description: ticketResult.data.description || '',
          category: ticketResult.data.category || '',
          priority: ticketResult.data.priority || '',
          status: ticketResult.data.status || '',
          department_id: ticketResult.data.department_id || '',
          assigned_to_id: ticketResult.data.assigned_to ? ticketResult.data.assigned_to.id : ''
        });
        
        setDepartments(departmentsData);
        setUsers(usersData);
        setError('');
        
      } catch (err) {
        console.error('Veri yükleme hatası:', err);
        console.error('Hata detayları:', {
          message: err.message,
          stack: err.stack,
          response: err.response
        });
        
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
      const result = await ticketService.updateTicket(ticketId, formData);
      
      if (result.success) {
        toast.success('Talep başarıyla güncellendi');
        navigate(`/tickets/${ticketId}`);
      } else {
        setError(result.message || 'Talep güncellenemedi');
        toast.error(result.message || 'Talep güncellenemedi');
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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="department_id">Departman</label>
            <select
              id="department_id"
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
            >
              <option value="">Departmansız</option>
              {departments.map(department => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            {departments.length === 0 && !loading && <div className="info-message">Departman bulunamadı</div>}
          </div>

          {(user.role === 'admin' || user.role === 'support') && (
            <div className="form-group">
              <label htmlFor="assigned_to_id">Atanmış Kişi</label>
              <select
                id="assigned_to_id"
                value={formData.assigned_to_id}
                onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
              >
                <option value="">Atanmamış</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
              {users.length === 0 && !loading && <div className="info-message">Kullanıcı bulunamadı</div>}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(`/tickets/${ticketId}`)}
            disabled={saving}
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