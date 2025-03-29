import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, 
  faEye, 
  faEyeSlash, 
  faSpinner,
  faExclamationCircle,
  faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import { auth } from '../api';
import '../styles/auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="error-message">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>Geçersiz veya eksik şifre sıfırlama bağlantısı.</span>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.new_password || !formData.new_password_confirm) {
      setError('Tüm alanları doldurunuz.');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    if (formData.new_password !== formData.new_password_confirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await auth.resetPassword(token, formData.new_password, formData.new_password_confirm);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'Şifre sıfırlama işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Yeni Şifre Oluştur</h1>
        <p className="auth-subtitle">Lütfen yeni şifrenizi belirleyin</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-container">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              value={formData.new_password}
              onChange={(e) => setFormData({...formData, new_password: e.target.value})}
              placeholder="Yeni şifre"
              className="input-field"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>

          <div className="input-container">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              value={formData.new_password_confirm}
              onChange={(e) => setFormData({...formData, new_password_confirm: e.target.value})}
              placeholder="Yeni şifre tekrar"
              className="input-field"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
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
              <span>Şifreniz başarıyla güncellendi! Yönlendiriliyorsunuz...</span>
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Güncelleniyor...</span>
              </>
            ) : (
              'Şifreyi Güncelle'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 