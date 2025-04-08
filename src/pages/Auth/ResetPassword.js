import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, 
  faSpinner,
  faExclamationCircle,
  faCheckCircle,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { authService } from '../../api';
import '../../styles/auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError('Tüm alanları doldurunuz.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const token = new URLSearchParams(location.search).get('token');
    if (!token) {
      setError('Geçersiz veya eksik token.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await authService.resetPassword(token, formData.password);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Şifre sıfırlama işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Şifre Sıfırlama</h1>
        <p className="auth-subtitle">
          Yeni şifrenizi belirleyin.
        </p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-container">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Yeni şifreniz"
              className="input-field"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>

          <div className="input-container">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Yeni şifrenizi tekrar girin"
              className="input-field"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
            </button>
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
              Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
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

          <Link to="/login" className="auth-link">
            Giriş sayfasına dön
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 