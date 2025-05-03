import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { equipmentTypes, equipmentStatuses } from '../../../services/equipmentService';
import { departmentService } from '../../../services/departmentService';
import './EquipmentForm.css';

const EquipmentForm = ({ equipment, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    equipment_type: 'computer',
    status: 'active',
    serial_number: '',
    model: '',
    manufacturer: '',
    purchase_date: '',
    warranty_expiry: '',
    department_id: '',
    assigned_to_id: ''
  });
  
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Düzenleme modunda formu doldur
  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        description: equipment.description || '',
        equipment_type: equipment.equipment_type || 'computer',
        status: equipment.status || 'active',
        serial_number: equipment.serial_number || '',
        model: equipment.model || '',
        manufacturer: equipment.manufacturer || '',
        purchase_date: equipment.purchase_date ? equipment.purchase_date.split('T')[0] : '',
        warranty_expiry: equipment.warranty_expiry ? equipment.warranty_expiry.split('T')[0] : '',
        department_id: equipment.department_id || '',
        assigned_to_id: equipment.assigned_to_id || ''
      });
    }
  }, [equipment]);

  // Departmanları getir
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const response = await departmentService.getAllDepartments();
        if (response && response.data) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error('Departmanlar yüklenirken hata:', error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Alanı değiştirdiğinde o alana ait hatayı temizle
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ekipman adı zorunludur';
    }
    
    if (!formData.department_id) {
      newErrors.department_id = 'Departman seçimi zorunludur';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Form gönderme hatası:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="equipment-form-modal">
      <div className="equipment-form-container">
        <div className="equipment-form-header">
          <h2>{equipment ? 'Ekipman Düzenle' : 'Yeni Ekipman'}</h2>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={saving}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-group">
            <label htmlFor="name">Ekipman Adı</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={saving}
              required
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Açıklama</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={saving}
              rows="2"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="equipment_type">Ekipman Tipi</label>
              <select
                id="equipment_type"
                name="equipment_type"
                value={formData.equipment_type}
                onChange={handleChange}
                disabled={saving}
              >
                {equipmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Durum</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={saving}
              >
                {equipmentStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="serial_number">Seri Numarası</label>
              <input
                type="text"
                id="serial_number"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="model">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="manufacturer">Üretici</label>
            <input
              type="text"
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="purchase_date">Satın Alma Tarihi</label>
              <input
                type="date"
                id="purchase_date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="warranty_expiry">Garanti Bitiş Tarihi</label>
              <input
                type="date"
                id="warranty_expiry"
                name="warranty_expiry"
                value={formData.warranty_expiry}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="department_id">Departman</label>
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              disabled={saving || loadingDepartments}
              required
            >
              <option value="">Departman Seçiniz</option>
              {departments.map(department => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            {errors.department_id && <span className="error-message">{errors.department_id}</span>}
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={onClose}
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
    </div>
  );
};

EquipmentForm.propTypes = {
  equipment: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default EquipmentForm; 