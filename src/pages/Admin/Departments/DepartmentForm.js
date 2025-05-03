import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { departmentTypes } from '../../../services/departmentService';
import './DepartmentForm.css';

const DepartmentForm = ({ department, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department_type: 'it' // Varsayılan tip
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Düzenleme modunda formu doldur
  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        description: department.description || '',
        department_type: department.department_type || 'it'
      });
    }
  }, [department]);

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
      newErrors.name = 'Departman adı zorunludur';
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
    <div className="department-form-modal">
      <div className="department-form-container">
        <div className="department-form-header">
          <h2>{department ? 'Departman Düzenle' : 'Yeni Departman'}</h2>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={saving}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="department-form">
          <div className="form-group">
            <label htmlFor="name">Departman Adı</label>
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
              rows="4"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="department_type">Departman Tipi</label>
            <select
              id="department_type"
              name="department_type"
              value={formData.department_type}
              onChange={handleChange}
              disabled={saving}
            >
              {departmentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
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

DepartmentForm.propTypes = {
  department: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default DepartmentForm; 