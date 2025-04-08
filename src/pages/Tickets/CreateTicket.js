import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faExclamationCircle,
  faCheckCircle,
  faPaperclip,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/tickets.css';

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    category: 'general',
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

    // Şimdilik sadece başarılı mesajı gösterelim
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      // Form verilerini sıfırla
      setFormData({
        title: '',
        description: '',
        priority: 'normal',
        category: 'general',
        attachments: []
      });
    }, 1500);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
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
              <option value="general">Genel</option>
              <option value="technical">Teknik</option>
              <option value="billing">Fatura</option>
              <option value="other">Diğer</option>
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
              <option value="normal">Normal</option>
              <option value="high">Yüksek</option>
              <option value="urgent">Acil</option>
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="attachments">Dosya Ekle</label>
            <div className="file-upload">
              <input
                type="file"
                id="attachments"
                onChange={handleFileChange}
                multiple
                className="file-input"
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
                    <span>{file.name}</span>
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
              <span>{error}</span>
            </div>
          )}
          
          {success && (
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