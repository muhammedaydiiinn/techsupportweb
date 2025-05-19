import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.first_name + ' ' + user.last_name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Profil güncelleme işlemi burada yapılacak
  };

  return (
    <div className="profile">
      <h1 className="profile-title">Profil Ayarları</h1>

      <div className="profile-content">
        <div className="profile-section">
          <h2>Kişisel Bilgiler</h2>
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faUser} />
                <span>Ad Soyad</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ad Soyad"
              />
            </div>

            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faEnvelope} />
                <span>E-posta</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="E-posta"
              />
            </div>

            <button type="submit" className="save-button">
              Değişiklikleri Kaydet
            </button>
          </form>
        </div>

        <div className="profile-section">
          <h2>Şifre Değiştir</h2>
          <form className="profile-form">
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faKey} />
                <span>Mevcut Şifre</span>
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Mevcut Şifre"
              />
            </div>

            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faKey} />
                <span>Yeni Şifre</span>
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Yeni Şifre"
              />
            </div>

            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faKey} />
                <span>Yeni Şifre (Tekrar)</span>
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Yeni Şifre (Tekrar)"
              />
            </div>

            <button type="submit" className="save-button">
              Şifreyi Değiştir
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 