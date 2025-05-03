import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faLink, faUnlink, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ticketService, equipmentService } from '../../services';
import { toast } from 'react-toastify';
import './EquipmentTicketRelation.css';

const EquipmentTicketRelation = ({ ticketId, departmentId }) => {
  const [loading, setLoading] = useState(true);
  const [relatedEquipment, setRelatedEquipment] = useState([]);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [processing, setProcessing] = useState(false);

  // İlişkili ekipmanları ve departman ekipmanlarını yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Talep detaylarını al
        const ticketResponse = await ticketService.getTicketById(ticketId);
        
        if (ticketResponse.status === 200) {
          const ticketData = ticketResponse.data;
          // İlişkili ekipmanları ayarla
          setRelatedEquipment(ticketData.related_equipment || []);
          
          // Departmanın ekipmanlarını getir
          if (departmentId) {
            const equipmentResponse = await equipmentService.getEquipmentByDepartment(departmentId);
            
            if (equipmentResponse.status === 200) {
              // İlişkili olmayan ekipmanları filtrele
              const relatedIds = (ticketData.related_equipment || []).map(eq => eq.id);
              const availableEq = equipmentResponse.data.filter(eq => !relatedIds.includes(eq.id));
              setAvailableEquipment(availableEq);
            } else {
              toast.error('Departman ekipmanları yüklenemedi');
            }
          }
        } else {
          toast.error('Talep detayları yüklenemedi');
        }
      } catch (error) {
        toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticketId, departmentId]);

  // Ticket'a ekipman ilişkilendirme
  const handleAddEquipment = async () => {
    if (!selectedEquipmentId) {
      toast.warning('Lütfen bir ekipman seçin');
      return;
    }

    setProcessing(true);
    try {
      const response = await ticketService.addEquipmentToTicket(ticketId, selectedEquipmentId);
      
      if (response.status === 200) {
        // Seçilen ekipmanı bul
        const selectedEquipment = availableEquipment.find(eq => eq.id === selectedEquipmentId);
        
        // State güncellemeleri
        setRelatedEquipment([...relatedEquipment, selectedEquipment]);
        setAvailableEquipment(availableEquipment.filter(eq => eq.id !== selectedEquipmentId));
        setSelectedEquipmentId('');
        setShowAddForm(false);
        
        toast.success('Ekipman başarıyla ilişkilendirildi');
      } else {
        toast.error('Ekipman ilişkilendirme işlemi başarısız oldu');
      }
    } catch (error) {
      toast.error('Ekipman ilişkilendirme sırasında bir hata oluştu');
    } finally {
      setProcessing(false);
    }
  };

  // Ticket'tan ekipman ilişkisini kaldırma
  const handleRemoveEquipment = async (equipmentId) => {
    setProcessing(true);
    try {
      const response = await ticketService.removeEquipmentFromTicket(ticketId, equipmentId);
      
      if (response.status === 200) {
        // Kaldırılan ekipmanı bul
        const removedEquipment = relatedEquipment.find(eq => eq.id === equipmentId);
        
        // State güncellemeleri
        setRelatedEquipment(relatedEquipment.filter(eq => eq.id !== equipmentId));
        setAvailableEquipment([...availableEquipment, removedEquipment]);
        
        toast.success('Ekipman ilişkisi başarıyla kaldırıldı');
      } else {
        toast.error('Ekipman ilişkisi kaldırılamadı');
      }
    } catch (error) {
      toast.error('Ekipman ilişkisi kaldırılırken bir hata oluştu');
    } finally {
      setProcessing(false);
    }
  };

  // Form iptal
  const handleCancel = () => {
    setSelectedEquipmentId('');
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="equipment-relation-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <p>Ekipmanlar yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="equipment-ticket-relation">
      <div className="section-header">
        <h3>İlişkili Ekipmanlar</h3>
        {!showAddForm && (
          <button 
            className="add-equipment-btn"
            onClick={() => setShowAddForm(true)}
            disabled={availableEquipment.length === 0 || processing}
          >
            <FontAwesomeIcon icon={faPlus} /> Ekipman Ekle
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="add-equipment-form">
          <div className="form-group">
            <select
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(e.target.value)}
              disabled={processing}
            >
              <option value="">-- Ekipman seçin --</option>
              {availableEquipment.map(equipment => (
                <option key={equipment.id} value={equipment.id}>
                  {equipment.name} ({equipment.equipment_type})
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button 
              className="cancel-btn" 
              onClick={handleCancel}
              disabled={processing}
            >
              İptal
            </button>
            <button 
              className="add-btn" 
              onClick={handleAddEquipment}
              disabled={!selectedEquipmentId || processing}
            >
              {processing ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> İşleniyor...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faLink} /> İlişkilendir
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {relatedEquipment.length > 0 ? (
        <div className="equipment-list">
          {relatedEquipment.map(equipment => (
            <div key={equipment.id} className="equipment-item">
              <div className="equipment-info">
                <h4>{equipment.name}</h4>
                <div className="equipment-details">
                  <p>Tür: {equipment.equipment_type}</p>
                  {equipment.serial_number && <p>Seri No: {equipment.serial_number}</p>}
                  {equipment.model && <p>Model: {equipment.model}</p>}
                </div>
              </div>
              <button 
                className="remove-btn"
                onClick={() => handleRemoveEquipment(equipment.id)}
                disabled={processing}
              >
                <FontAwesomeIcon icon={faUnlink} /> İlişkiyi Kaldır
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-equipment">
          <p>Bu taleple ilişkilendirilmiş ekipman bulunmamaktadır.</p>
        </div>
      )}
    </div>
  );
};

export default EquipmentTicketRelation; 