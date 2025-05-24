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
  const [selectedFiles, setSelectedFiles] = useState([]);

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
      // Form verilerini hazırla ve API'nin beklediği formata dönüştür
      const ticketData = {
        title: formData.title,
        description: formData.description,
        category: formData.category.toUpperCase(), // API büyük harf bekliyor
        priority: formData.priority.toUpperCase(), // API büyük harf bekliyor
        status: formData.status.toUpperCase(), // API büyük harf bekliyor
        department_id: formData.department_id,
        equipment_id: formData.equipment_id === '' ? null : formData.equipment_id,
        assigned_to_id: formData.assigned_to_id === '' ? null : formData.assigned_to_id
      };

      const response = await ticketService.updateTicket(ticketId, ticketData);
      console.log('Talep güncellendi:', response);
      
      // Dosya ekleri varsa yükle
      if (selectedFiles.length > 0) {
        await uploadAttachments(ticketId, selectedFiles);
      }

      toast.success('Talep başarıyla güncellendi!');
      navigate(`/tickets/${ticketId}`);
    } catch (error) {
      console.error('Talep güncellenirken hata:', error);
      toast.error('Talep güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  // Dosya yükleme fonksiyonu
  const uploadAttachments = async (ticketId, files) => {
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await ticketService.uploadAttachment(ticketId, formData);
      }
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      toast.error('Dosyalar yüklenirken bir hata oluştu');
    }
  };

  // Dosya ekleme işlevi
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  // Dosya kaldırma işlevi
  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
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
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="form-control"
            >
              <option value="">Kategori Seçin</option>
              <option value="HARDWARE">Donanım</option>
              <option value="SOFTWARE">Yazılım</option>
              <option value="NETWORK">Ağ/İnternet</option>
              <option value="TECHNICAL">Teknik</option>
              <option value="OTHER">Diğer</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Öncelik</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              required
              className="form-control"
            >
              <option value="">Öncelik Seçin</option>
              <option value="LOW">Düşük</option>
              <option value="MEDIUM">Normal</option>
              <option value="HIGH">Yüksek</option>
              <option value="CRITICAL">Acil</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Durum</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              className="form-control"
            >
              <option value="">Durum Seçin</option>
              <option value="OPEN">Açık</option>
              <option value="IN_PROGRESS">İşlemde</option>
              <option value="WAITING">Beklemede</option>
              <option value="RESOLVED">Çözüldü</option>
              <option value="CLOSED">Kapandı</option>
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