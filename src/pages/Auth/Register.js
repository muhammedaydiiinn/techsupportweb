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
    <div className="auth-container">
      <div className="auth-layout">
        <div className="auth-sidebar">
          <div className="auth-sidebar-content">
            <h2>Yeni Hesap Oluştur</h2>
            <p>
              Teknik destek portalımıza üye olarak, sorunlarınızı hızlı ve etkin 
              bir şekilde çözüme kavuşturabilirsiniz.
            </p>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h1>Hesap Oluştur</h1>
            <p>Tech Support'a hoş geldiniz!</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  <FontAwesomeIcon icon={faUser} /> Ad
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Adınız"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="surname">
                  <FontAwesomeIcon icon={faUser} /> Soyad
                </label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={(e) => setFormData({...formData, surname: e.target.value})}
                  placeholder="Soyadınız"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <FontAwesomeIcon icon={faEnvelope} /> E-posta
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="E-posta adresiniz"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <FontAwesomeIcon icon={faLock} /> Şifre
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Şifreniz (en az 8 karakter)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password_confirm">
                <FontAwesomeIcon icon={faLock} /> Şifre (Tekrar)
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password_confirm"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={(e) => setFormData({...formData, password_confirm: e.target.value})}
                  placeholder="Şifrenizi tekrar girin"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <FontAwesomeIcon icon={faExclamationCircle} />
                <span>{typeof error === 'string' ? error : 'Kayıt işlemi başarısız oldu'}</span>
              </div>
            )}
            
            {success && (
              <div className="auth-success">
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
          </form>
          
          <div className="auth-footer">
            <p>Zaten hesabınız var mı? <Link to="/login" className="auth-link">Giriş Yap</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 