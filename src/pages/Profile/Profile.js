import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { departmentService } from '../../services/departmentService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEdit, faKey } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [department, setDepartment] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });

      // Departman bilgisini yükle
      if (user.department_id) {
        fetchDepartment(user.department_id);
      }
    }
  }, [user]);

  const fetchDepartment = async (departmentId) => {
    try {
      const response = await departmentService.getDepartmentById(departmentId);
      if (response.success && response.data) {
        setDepartment(response.data);
      }
    } catch (error) {
      console.error('Departman bilgisi alınamadı:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    // Düzenleme iptal edilirse verileri sıfırla
    if (editing) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    }
  };

  const handlePasswordToggle = () => {
    setChangingPassword(!changingPassword);
    // Şifre değiştirme iptal edilirse verileri sıfırla
    if (changingPassword) {
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      const response = await userService.updateProfile(formData);
      
      if (response.success) {
        updateUser(response.data);
        toast.success('Profil başarıyla güncellendi');
        setEditing(false);
      } else {
        setError(response.message || 'Profil güncellenirken bir hata oluştu');
        toast.error(response.message || 'Profil güncellenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Profil güncelleme hatası:', err);
      setError('Profil güncellenirken bir hata oluştu');
      toast.error('Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Şifre doğrulama kontrolü
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Yeni şifreler eşleşmiyor');
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }
    
    try {
      setLoading(true);
      const response = await userService.changePassword(passwordData);
      
      if (response.success) {
        toast.success('Şifre başarıyla değiştirildi');
        setChangingPassword(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        setError(response.message || 'Şifre değiştirilirken bir hata oluştu');
        toast.error(response.message || 'Şifre değiştirilirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Şifre değiştirme hatası:', err);
      setError('Şifre değiştirilirken bir hata oluştu');
      toast.error('Şifre değiştirilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profil Bilgileri</h1>
        <div className="profile-actions">
          <button 
            className="edit-profile-button"
            onClick={handleEditToggle}
          >
            <FontAwesomeIcon icon={faEdit} />
            <span>{editing ? 'İptal' : 'Düzenle'}</span>
          </button>
          <button 
            className="change-password-button"
            onClick={handlePasswordToggle}
          >
            <FontAwesomeIcon icon={faKey} />
            <span>{changingPassword ? 'İptal' : 'Şifre Değiştir'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!changingPassword ? (
        <div className="profile-content">
          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="first_name">Ad</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Soyad</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">E-posta</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleEditToggle}
                  disabled={loading}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? (
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
          ) : (
            <div className="profile-info">
              <div className="info-group">
                <label>Ad:</label>
                <span>{user.first_name}</span>
              </div>
              <div className="info-group">
                <label>Soyad:</label>
                <span>{user.last_name}</span>
              </div>
              <div className="info-group">
                <label>E-posta:</label>
                <span>{user.email}</span>
              </div>
              <div className="info-group">
                <label>Rol:</label>
                <span>{user.role === 'admin' ? 'Yönetici' : 
                       user.role === 'support' ? 'Destek Ekibi' : 'Kullanıcı'}</span>
              </div>
              {department && (
                <div className="info-group">
                  <label>Departman:</label>
                  <span>{department.name}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="profile-content">
          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="form-group">
              <label htmlFor="current_password">Mevcut Şifre</label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="new_password">Yeni Şifre</label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
                minLength="8"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm_password">Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                required
                minLength="8"
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handlePasswordToggle}
                disabled={loading}
              >
                İptal
              </button>
              <button
                type="submit"
                className="save-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  'Şifreyi Değiştir'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile; 