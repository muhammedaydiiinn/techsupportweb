import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faSpinner,
  faExclamationCircle,
  faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import { authService } from '../api';
import '../styles/auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email adresi boş olamaz.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Geçerli bir email adresi giriniz.');
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
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Şifre sıfırlama işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Şifre Sıfırlama</h1>
        <p className="auth-subtitle">Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-container">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email adresiniz"
              className="input-field"
            />
          </div>

          {error && (
            <div className="error-message">
              <FontAwesomeIcon icon={faExclamationCircle} />
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <FontAwesomeIcon icon={faCheckCircle} />
              Şifre sıfırlama bağlantısı email adresinize gönderildi.
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
                <span>Gönderiliyor...</span>
              </>
            ) : (
              'Şifre Sıfırlama Bağlantısı Gönder'
            )}
          </button>

          <Link to="/login" className="auth-link">
            Giriş sayfasına dön
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 