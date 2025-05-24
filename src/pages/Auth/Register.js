import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faLock, 
  faEye, 
  faEyeSlash, 
  faSpinner,
  faExclamationCircle,
  faCheckCircle,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { authService } from '../../api';
import './AuthStyles.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    name: '',
    surname: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!formData.email.trim() || !formData.password || !formData.password_confirm || !formData.name || !formData.surname) {
      setError('Tüm alanları doldurunuz.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Geçerli bir email adresi giriniz.');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return false;
    }

    if (formData.password !== formData.password_confirm) {
      setError('Şifreler eşleşmiyor.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await authService.register({
        email: formData.email.trim(),
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.name.trim(),
        last_name: formData.surname.trim()
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Kayıt hatası:', err);
      setError(err.message || 'Kayıt işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Hesap Oluştur</h1>
        <p className="auth-subtitle">Tech Support'a hoş geldiniz!</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-container">
            <FontAwesomeIcon icon={faUser} className="input-icon" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Adınız"
              className="input-field"
            />
          </div>

          <div className="input-container">
            <FontAwesomeIcon icon={faUser} className="input-icon" />
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={(e) => setFormData({...formData, surname: e.target.value})}
              placeholder="Soyadınız"
              className="input-field"
            />
          </div>

          <div className="input-container">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Email adresiniz"
              className="input-field"
            />
          </div>

          <div className="input-container">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Şifreniz"
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
              name="password_confirm"
              value={formData.password_confirm}
              onChange={(e) => setFormData({...formData, password_confirm: e.target.value})}
              placeholder="Şifrenizi tekrar girin"
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
              <span>{typeof error === 'string' ? error : 'Kayıt işlemi başarısız oldu'}</span>
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <FontAwesomeIcon icon={faCheckCircle} />
              Kayıt başarılı! Yönlendiriliyorsunuz...
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
                <span>Kaydediliyor...</span>
              </>
            ) : (
              'Kayıt Ol'
            )}
          </button>

          <Link to="/login" className="auth-link">
            Zaten hesabınız var mı? Giriş yapın
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Register; 