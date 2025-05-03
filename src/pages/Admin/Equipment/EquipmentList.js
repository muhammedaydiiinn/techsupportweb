import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDesktop,
  faPlus,
  faEdit,
  faTrash,
  faSpinner,
  faArrowLeft,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { equipmentService } from '../../../services/equipmentService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './EquipmentList.css';

const EquipmentList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin yetkisi kontrolü
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Ekipmanları getir
  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getAllEquipment();
      
      if (response && response.data) {
        setEquipment(response.data);
        setError('');
      } else {
        setError('Ekipman bilgileri alınamadı');
      }
    } catch (err) {
      console.error('Ekipman listesi yüklenirken hata:', err);
      setError('Ekipmanlar yüklenirken bir hata oluştu');
      toast.error('Ekipmanlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Geçici olarak ekipman ekle/düzenle/sil işlevleri burada atlanmıştır
  // Daha sonra bu işlevler eklenebilir

  if (loading) {
    return (
      <div className="equipment-list-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="equipment-list-error">
        <FontAwesomeIcon icon={faExclamationCircle} />
        <span>{error}</span>
        <button onClick={() => navigate('/admin')}>Geri Dön</button>
      </div>
    );
  }

  return (
    <div className="equipment-list-container">
      <div className="equipment-list-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => navigate('/admin')}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Geri</span>
          </button>
          <h1>
            <FontAwesomeIcon icon={faDesktop} />
            <span>Ekipman Yönetimi</span>
          </h1>
        </div>
        <button 
          className="add-equipment-button"
          onClick={() => toast.info('Ekipman ekleme özelliği henüz eklenemedi.')}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Yeni Ekipman</span>
        </button>
      </div>

      {equipment.length === 0 ? (
        <div className="empty-state">
          <p>Henüz ekipman bulunmuyor</p>
          <button onClick={() => toast.info('Ekipman ekleme özelliği henüz eklenemedi.')}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Ekipman Oluştur</span>
          </button>
        </div>
      ) : (
        <div className="equipment-grid">
          {equipment.map(item => (
            <div key={item.id} className="equipment-card">
              <div className="equipment-card-header">
                <h3>{item.name}</h3>
                <div className="equipment-actions">
                  <button 
                    className="edit-button"
                    onClick={() => toast.info('Ekipman düzenleme özelliği henüz eklenemedi.')}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => toast.info('Ekipman silme özelliği henüz eklenemedi.')}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
              <div className="equipment-card-body">
                <p>{item.description || 'Açıklama yok'}</p>
                <div className="equipment-meta">
                  <span>Seri No: {item.serial_number || '-'}</span>
                  <span>Departman: {item.department?.name || '-'}</span>
                  <span>Durum: {item.status || 'Bilinmiyor'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentList; 