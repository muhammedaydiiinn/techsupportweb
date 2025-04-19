import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faExclamationCircle,
  faCheckCircle,
  faPaperclip,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { ticketService } from '../../api';
import '../../styles/tickets.css';

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'software',
    attachments: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Önce ticket'ı oluştur
      const ticketData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category
      };

      const response = await ticketService.createTicket(ticketData);

      if (!response.success) {
        throw { api: { message: response.message || 'Ticket oluşturulamadı' } };
      }

      if (formData.attachments.length > 0) {
        // Dosya yükleme işlemleri
        const uploadPromises = formData.attachments.map(file => 
          ticketService.uploadAttachment(response.data.id, file)
        );

        const uploadResults = await Promise.allSettled(uploadPromises);
        
        // Dosya yükleme hatalarını kontrol et
        const failedUploads = uploadResults.filter(result => result.status === 'rejected');
        if (failedUploads.length > 0) {
          setError('Bazı dosyalar yüklenirken hata oluştu. Ancak ticket başarıyla oluşturuldu.');
          setSuccess(true);
        }
      }

      if (!error) {
        setSuccess(true);
        // Form verilerini sıfırla
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          category: 'software',
          attachments: []
        });
      }
    } catch (err) {
      setSuccess(false);
      if (err.api?.data?.detail) {
        // API'den gelen detaylı hata mesajlarını işle
        const errorDetails = err.api.data.detail;
        if (Array.isArray(errorDetails)) {
          const errorMessages = errorDetails.map(error => {
            const field = error.loc[error.loc.length - 1];
            return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${error.msg}`;
          });
          setError(errorMessages.join('\n'));
        } else {
          setError(err.api.data.detail);
        }
      } else {
        setError(err.api?.message || 'Ticket oluşturulurken bir hata oluştu');
      }
    } finally {
      setLoading(false);
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

  return (
    <div className="ticket-page">
      <div className="ticket-container">
        <h1 className="ticket-title">Yeni Talep Oluştur</h1>
        <p className="ticket-subtitle">Lütfen talebinizle ilgili detayları giriniz</p>
        
        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-group">
            <label htmlFor="title">Talep Başlığı</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Talep başlığını giriniz"
              required
              minLength={5}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Kategori</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
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
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              required
            >
              <option value="low">Düşük</option>
              <option value="medium">Normal</option>
              <option value="high">Yüksek</option>
              <option value="critical">Acil</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Açıklama</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Talebinizle ilgili detaylı açıklama giriniz"
              rows="5"
              required
              minLength={20}
              maxLength={1000}
            />
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

          {error && (
            <div className="error-message">
              <FontAwesomeIcon icon={faExclamationCircle} />
              <span style={{ whiteSpace: 'pre-line' }}>{error}</span>
            </div>
          )}
          
          {success && !error && (
            <div className="success-message">
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>Talebiniz başarıyla oluşturuldu!</span>
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Gönderiliyor...</span>
              </>
            ) : (
              'Talebi Oluştur'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket; 