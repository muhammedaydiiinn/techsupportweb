import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { authService } from '../../api';
import './AuthStyles.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Lütfen e-posta adresinizi girin');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setSuccess(true);
        toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
      } else {
        setError(response.message || 'Şifre sıfırlama isteği gönderilemedi');
        toast.error(response.message || 'İşlem başarısız');
      }
    } catch (err) {
      console.error('Şifre sıfırlama hatası:', err);
      setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      toast.error('İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Şifremi Unuttum</h1>
          <p>Şifre sıfırlama bağlantısı için e-posta adresinizi girin</p>
        </div>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        {success ? (
          <div className="auth-success">
            <p>Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.</p>
            <p>Lütfen e-postanızı kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın.</p>
            <Link to="/login" className="auth-button">
              Giriş Sayfasına Dön
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                <FontAwesomeIcon icon={faEnvelope} /> E-posta
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> İşleniyor...
                </>
              ) : 'Şifre Sıfırlama Bağlantısı Gönder'}
            </button>
            
            <div className="auth-footer">
              <Link to="/login" className="auth-link">
                Giriş Sayfasına Dön
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 