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
import { equipmentService, equipmentStatuses } from '../../../services/equipmentService';
import { departmentService } from '../../../services/departmentService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import EquipmentForm from './EquipmentForm';
import './EquipmentList.css';

const EquipmentList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Admin yetkisi kontrolü
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      toast.error('Bu sayfaya erişmek için admin yetkisi gerekiyor');
    }
  }, [user, navigate]);

  // Ekipmanları getir
  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getAllEquipment();
      
      if (response && response.data) {
        console.log('API\'den gelen ekipman verisi:', response.data);
        
        // Her bir ekipmanın departman bilgisini detaylı görelim
        response.data.forEach((item, index) => {
          console.log(`Ekipman ${index + 1} (${item.name}) - Departman:`, item.department);
          console.log(`Ekipman ${index + 1} - department_id:`, item.department_id);
        });
        
        // Verileri işleyerek, departman bilgilerinin doğru olmasını sağlayalım
        let processedEquipment = response.data.map(item => {
          // Departman bilgisi kontrol ediliyor
          if (!item.department && item.department_id) {
            // department_id var ama department nesnesi yoksa
            console.log(`${item.name} için departman_id var (${item.department_id}) ama department nesnesi yok`);
            item.department = { name: 'Departman Yükleniyor...', id: item.department_id };
          } else if (item.department === null) {
            // API null döndüyse, görüntülenebilir bir departman objesi oluştur
            console.log(`${item.name} için department null`);
            item.department = { name: 'Atanmamış' }; 
          } else if (typeof item.department === 'string') {
            // Eğer departman bir string ID ise (department_id), görüntülenebilir bir obje yap
            console.log(`${item.name} için department string: ${item.department}`);
            item.department = { name: 'Departman Bilgisi Alınamadı', id: item.department };
          }
          
          return item;
        });
        
        // İlk ekipman listesini hemen gösterelim
        setEquipment(processedEquipment);
        
        // Departman bilgisi eksik olan ekipmanlar için departman bilgilerini çekelim
        const fetchMissingDepartments = async () => {
          // Department_id'si olup tam department bilgisi olmayan ekipmanları bulalım
          const equipmentWithMissingDepartments = processedEquipment.filter(
            item => item.department_id && (!item.department || item.department.name === 'Departman Yükleniyor...' || item.department.name === 'Departman Bilgisi Alınamadı')
          );
          
          if (equipmentWithMissingDepartments.length === 0) {
            return; // Eksik departman bilgisi yoksa işlem yapma
          }
          
          console.log('Eksik departman bilgisi olan ekipmanlar:', equipmentWithMissingDepartments);
          
          // Her bir eksik departman bilgisi için asenkron olarak departman bilgisini çekelim
          const departmentPromises = equipmentWithMissingDepartments.map(async (item) => {
            try {
              const departmentResponse = await departmentService.getDepartmentById(item.department_id);
              if (departmentResponse && departmentResponse.data) {
                // Departman bilgisini bulunan ekipmanı güncelleyelim
                const updatedEquipment = processedEquipment.map(equipment => {
                  if (equipment.id === item.id) {
                    return {
                      ...equipment,
                      department: departmentResponse.data
                    };
                  }
                  return equipment;
                });
                
                // Güncellenmiş listeyi state'e kaydedelim
                processedEquipment = updatedEquipment;
                setEquipment(updatedEquipment);
              }
            } catch (error) {
              console.error(`${item.name} için departman bilgisi alınamadı:`, error);
            }
          });
          
          // Tüm departman bilgilerinin çekilmesini bekleyelim
          await Promise.all(departmentPromises);
          console.log('Tüm departman bilgileri güncellendi:', processedEquipment);
        };
        
        // Eksik departman bilgilerini çekelim
        fetchMissingDepartments();
        
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

  // Ekipman ekle modalını aç
  const handleAddEquipment = () => {
    setCurrentEquipment(null);
    setShowForm(true);
  };

  // Ekipman düzenle
  const handleEditEquipment = (item) => {
    setCurrentEquipment(item);
    setShowForm(true);
  };

  // Form kapatıldığında
  const handleFormClose = () => {
    setShowForm(false);
    setCurrentEquipment(null);
  };

  // Form gönderildiğinde
  const handleFormSubmit = async (formData) => {
    try {
      setProcessing(true);
      let response;
      
      if (currentEquipment) {
        // Ekipman güncelleme
        response = await equipmentService.updateEquipment(currentEquipment.id, formData);
        if (response && (response.status === 200 || response.status === 204)) {
          toast.success('Ekipman başarıyla güncellendi');
        }
      } else {
        // Yeni ekipman oluşturma
        response = await equipmentService.createEquipment(formData);
        if (response && (response.status === 201 || response.status === 200)) {
          toast.success('Ekipman başarıyla oluşturuldu');
        }
      }
      
      fetchEquipment();
      setShowForm(false);
      setCurrentEquipment(null);
    } catch (err) {
      console.error('Ekipman kaydetme hatası:', err);
      
      if (err.response?.data?.detail) {
        toast.error(`Hata: ${err.response.data.detail}`);
      } else {
        toast.error('Ekipman kaydedilirken bir hata oluştu');
      }
    } finally {
      setProcessing(false);
    }
  };

  // Ekipman sil
  const handleDeleteEquipment = async (id, name) => {
    if (window.confirm(`"${name}" ekipmanını silmek istediğinizden emin misiniz?`)) {
      try {
        setProcessing(true);
        const response = await equipmentService.deleteEquipment(id);
        
        if (response && (response.status === 200 || response.status === 204)) {
          toast.success('Ekipman başarıyla silindi');
          fetchEquipment();
        } else {
          toast.error('Ekipman silme işlemi başarısız oldu');
        }
      } catch (err) {
        console.error('Ekipman silme hatası:', err);
        toast.error(err.response?.data?.detail || 'Ekipman silme işlemi başarısız oldu');
      } finally {
        setProcessing(false);
      }
    }
  };

  // Durum etiketi getir
  const getStatusBadge = (status) => {
    const statusObj = equipmentStatuses.find(s => s.value === status) || { label: 'Bilinmiyor' };
    
    let colorClass = 'default';
    if (status === 'active') colorClass = 'success';
    if (status === 'maintenance' || status === 'repair') colorClass = 'warning';
    if (status === 'broken') colorClass = 'danger';
    if (status === 'retired') colorClass = 'secondary';
    
    return (
      <span className={`status-badge ${colorClass}`}>
        {statusObj.label}
      </span>
    );
  };

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
          onClick={handleAddEquipment}
          disabled={processing}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Yeni Ekipman</span>
        </button>
      </div>

      {equipment.length === 0 ? (
        <div className="empty-state">
          <p>Henüz ekipman bulunmuyor</p>
          <button onClick={handleAddEquipment} disabled={processing}>
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
                    onClick={() => handleEditEquipment(item)}
                    disabled={processing}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteEquipment(item.id, item.name)}
                    disabled={processing}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
              <div className="equipment-card-body">
                <p>{item.description || 'Açıklama yok'}</p>
                <div className="equipment-meta">
                  <div className="meta-item">
                    <span className="meta-label">Seri No:</span>
                    <span className="meta-value">{item.serial_number || '-'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Departman:</span>
                    <span className="meta-value">
                      {item.department?.name || (item.department_id ? 'Departman Yükleniyor...' : 'Atanmamış')}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Durum:</span>
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ekipman Ekleme/Düzenleme Formu */}
      {showForm && (
        <EquipmentForm 
          equipment={currentEquipment}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default EquipmentList; 