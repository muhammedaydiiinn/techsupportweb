import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faUser, faEnvelope, faLock, faBuilding } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { userRoles } from '../../services/userService';
import { departmentService } from '../../services/departmentService';
import './UserForm.css';

const UserForm = ({ user, onClose, onSubmit, departments = [] }) => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    role: 'user',
    department_id: '',
    is_active: true
  });
  
  const [localDepartments, setLocalDepartments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingDepartments, setLoadingDepartments] = useState(departments.length === 0);

  // Eğer dışarıdan departmanlar geldiyse, onları kullan
  useEffect(() => {
    if (departments && departments.length > 0) {
      setLocalDepartments(departments);
      setLoadingDepartments(false);
    } else {
      // Dışarıdan departmanlar gelmezse, API'den getir
      fetchDepartments();
    }
  }, [departments]);

  // Departmanları yükle (dışarıdan gelmediğinde)
  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await departmentService.getAllDepartments();
      if (response && response.data) {
        setLocalDepartments(response.data);
      }
    } catch (err) {
      console.error('Departmanlar yüklenirken hata:', err);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Düzenleme modunda formu doldur
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        password: '', // Şifre alanları düzenleme modunda boş bırakılır
        password_confirm: '',
        role: user.role || 'user',
        department_id: user.department_id || user.department?.id || '',
        is_active: user.is_active !== undefined ? user.is_active : true
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'İsim zorunludur';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Soyisim zorunludur';
    }

    // Yeni kullanıcı oluşturuluyorsa şifre kontrolü yap
    if (!user) {
      if (!formData.password) {
        newErrors.password = 'Şifre zorunludur';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Şifre en az 8 karakter olmalıdır';
      }

      if (!formData.password_confirm) {
        newErrors.password_confirm = 'Şifre tekrarı zorunludur';
      } else if (formData.password !== formData.password_confirm) {
        newErrors.password_confirm = 'Şifreler eşleşmiyor';
      }
    } else if (formData.password) {
      // Şifre girilmişse doğrulamaları yap
      if (formData.password.length < 8) {
        newErrors.password = 'Şifre en az 8 karakter olmalıdır';
      }

      if (!formData.password_confirm) {
        newErrors.password_confirm = 'Şifre tekrarı zorunludur';
      } else if (formData.password !== formData.password_confirm) {
        newErrors.password_confirm = 'Şifreler eşleşmiyor';
      }
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
      // API'ye gönderilecek verileri hazırla
      const payload = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        department_id: formData.department_id || null,
        is_active: formData.is_active
      };

      // Şifre varsa ekle
      if (formData.password) {
        payload.password = formData.password;
        payload.password_confirm = formData.password_confirm;
      }

      await onSubmit(payload);
    } catch (err) {
      console.error('Form gönderme hatası:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="user-form-modal">
      <div className="user-form-container">
        <div className="user-form-header">
          <h2>{user ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</h2>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={saving}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">
                <FontAwesomeIcon icon={faUser} />
                İsim
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={saving}
                placeholder="İsim"
                required
              />
              {errors.first_name && <span className="error-message">{errors.first_name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name">
                <FontAwesomeIcon icon={faUser} />
                Soyisim
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={saving}
                placeholder="Soyisim"
                required
              />
              {errors.last_name && <span className="error-message">{errors.last_name}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">
              <FontAwesomeIcon icon={faEnvelope} />
              E-posta
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={saving}
              placeholder="E-posta adresi"
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                <FontAwesomeIcon icon={faLock} />
                {user ? 'Yeni Şifre (Opsiyonel)' : 'Şifre'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={saving}
                placeholder={user ? "Değiştirmek istemiyorsanız boş bırakın" : "Şifre en az 8 karakter"}
                required={!user}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password_confirm">
                <FontAwesomeIcon icon={faLock} />
                {user ? 'Yeni Şifre Tekrarı' : 'Şifre Tekrarı'}
              </label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                disabled={saving}
                placeholder="Şifrenizi tekrar girin"
                required={!user || formData.password !== ''}
              />
              {errors.password_confirm && <span className="error-message">{errors.password_confirm}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">
                <FontAwesomeIcon icon={faUser} />
                Rol
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="department_id">
                <FontAwesomeIcon icon={faBuilding} />
                Departman
              </label>
              <select
                id="department_id"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                disabled={saving || loadingDepartments}
              >
                <option value="">Departmansız</option>
                {loadingDepartments ? (
                  <option disabled>Departmanlar yükleniyor...</option>
                ) : (
                  localDepartments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))
                )}
              </select>
              {loadingDepartments && <span className="loading-message">Departmanlar yükleniyor...</span>}
            </div>
          </div>
          
          <div className="checkbox-group">
            <label className="checkbox-label" htmlFor="is_active">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                disabled={saving}
              />
              Aktif Kullanıcı
            </label>
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
                  Kaydediliyor...
                </>
              ) : (
                <>
                  {user ? 'Güncelle' : 'Oluştur'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

UserForm.propTypes = {
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  departments: PropTypes.array
};

export default UserForm; 