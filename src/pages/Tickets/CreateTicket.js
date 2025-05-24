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
import { SupportLevel, SupportLevelLabels } from '../../constants/supportLevels';
import '../../styles/tickets.css';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    attachments: [],
    support_level: SupportLevel.LEVEL_1 // Varsayılan olarak Level 1
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Kritik öncelikli ticketlar için otomatik Level 3 ataması
        if (formData.priority === 'critical') {
          setFormData(prev => ({
            ...prev,
            support_level: SupportLevel.LEVEL_3
          }));
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
  }, [user.role, formData.priority]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Form verilerini hazırla
      const ticketData = {
        title: formData.title,
        description: formData.description,
        category: formData.category.toUpperCase(), // API büyük harf bekliyor
        priority: formData.priority.toUpperCase(), // API büyük harf bekliyor
        department_id: formData.department_id,
        equipment_id: formData.equipment_id === '' ? null : formData.equipment_id
      };

      const response = await ticketService.createTicket(ticketData);
      console.log('Talep oluşturuldu:', response);
      
      // Dosya ekleri varsa yükle
      if (formData.attachments.length > 0 && response.data.id) {
        await uploadAttachments(response.data.id, formData.attachments);
      }

      toast.success('Talep başarıyla oluşturuldu!');
      navigate('/tickets');
    } catch (error) {
      console.error('Talep oluşturulurken hata:', error);
      setError('Talep oluşturulurken bir hata oluştu.');
      toast.error('Talep oluşturulurken bir hata oluştu.');
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
              onChange={(e) => {
                const newPriority = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  priority: newPriority,
                  support_level: newPriority === 'CRITICAL' ? SupportLevel.LEVEL_3 : SupportLevel.LEVEL_1
                }));
              }}
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
            <label htmlFor="support_level">Destek Seviyesi</label>
            <select
              id="support_level"
              value={formData.support_level}
              onChange={(e) => setFormData({ ...formData, support_level: e.target.value })}
              required
              disabled={formData.priority === 'critical'} // Kritik öncelikli ticketlar için değiştirilemez
            >
              {Object.entries(SupportLevelLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {formData.priority === 'critical' && (
              <small className="info-text">
                Kritik öncelikli ticketlar otomatik olarak Yönetici Destek seviyesine atanır
              </small>
            )}
          </div>
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