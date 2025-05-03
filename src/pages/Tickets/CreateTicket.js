import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faPaperclip,
  faTimes,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import '../../styles/tickets.css';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    department_id: '',
    attachments: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (user.role === 'admin') {
          setDepartments([]);
        }
        
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
  }, [user.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Dosya ekleri varsa FormData kullanarak göndermeliyiz
      const hasAttachments = formData.attachments && formData.attachments.length > 0;
      
      let requestData;
      let response;
      
      if (hasAttachments) {
        // FormData oluştur
        requestData = new FormData();
        
        // Form verilerini ekle
        requestData.append('title', formData.title);
        requestData.append('description', formData.description);
        requestData.append('category', formData.category);
        requestData.append('priority', formData.priority);
        
        if (formData.department_id) {
          requestData.append('department_id', formData.department_id);
        }
        
        // Dosyaları ekle
        formData.attachments.forEach((file, index) => {
          requestData.append(`attachments[${index}]`, file);
        });
        
        // Multipart/form-data olarak gönder
        response = await ticketService.createTicket(requestData);
      } else {
        // Dosya yoksa normal JSON olarak gönder
        const dataToSend = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          department_id: formData.department_id || undefined
        };
        
        response = await ticketService.createTicket(dataToSend);
      }
      
      if (response && response.status >= 200 && response.status < 300 && response.data) {
        toast.success('Talep başarıyla oluşturuldu');
        
        // ID kontrolü eklenmiş yönlendirme
        if (response.data.id) {
          navigate(`/tickets/${response.data.id}`);
        } else {
          toast.error('Talep oluşturuldu, ancak ID bilgisi alınamadı');
          navigate('/tickets');
        }
      } else {
        setError('Talep oluşturulamadı');
        toast.error('Talep oluşturulamadı');
      }
    } catch (err) {
      console.error('Talep oluşturma hatası:', err);
      setError(typeof err === 'string' ? err : 
        (err.message || 'Talep oluşturulurken bir hata oluştu'));
      toast.error('Talep oluşturulurken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Dosya boyutu ve tip kontrolü
    const validFiles = files.filter(file => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (file.size > maxSize) {
        setError(`${file.name} dosyası çok büyük. Maksimum dosya boyutu 5MB olmalıdır.`);
        return false;
      }
      
      if (!validTypes.includes(file.type)) {
        setError(`${file.name} desteklenmeyen bir dosya türü.`);
        return false;
      }
      
      return true;
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="create-ticket-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="create-ticket-container">
      <div className="create-ticket-header">
        <button 
          className="back-button"
          onClick={() => navigate('/tickets')}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Geri</span>
        </button>
        <h1>Yeni Talep Oluştur</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
        
      <form onSubmit={handleSubmit} className="create-ticket-form">
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

          {user.role === 'admin' && (
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
          )}
          </div>

          <div className="form-group">
          <label htmlFor="attachments">Dosya Ekle (Maks. 5MB)</label>
            <div className="file-upload">
              <input
                type="file"
                id="attachments"
                onChange={handleFileChange}
                multiple
                className="file-input"
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
              />
              <label htmlFor="attachments" className="file-label">
                <FontAwesomeIcon icon={faPaperclip} />
                <span>Dosya Seç</span>
              </label>
            </div>
            {formData.attachments.length > 0 && (
              <div className="attachments-list">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="attachment-item">
                  <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="remove-attachment"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate('/tickets')}
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
              'Oluştur'
            )}
          </button>
        </div>
        </form>
    </div>
  );
};

export default CreateTicket; 