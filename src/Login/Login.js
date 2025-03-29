import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faLock, 
  faEye, 
  faEyeSlash, 
  faSpinner,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { auth } from '../api';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setError('Tüm alanları doldurunuz.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await auth.login({
        email: formData.email.trim(),
        password: formData.password
      });

      if (response && response.access_token) {
        const userData = {
          name: response.name || formData.email.split('@')[0],
          surname: response.surname || '',
          email: formData.email,
        };

        authLogin(userData, response.access_token);
        
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Giriş işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Giriş Yap</h1>
        <p className="auth-subtitle">Hesabınıza giriş yapın</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-container">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Email"
              className="input-field"
            />
          </div>

          <div className="input-container">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Şifre"
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

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>Giriş Yapılıyor...</span>
              </>
            ) : (
              'Giriş Yap'
            )}
          </button>

          <div className="auth-links">
            <Link to="/forgot-password" className="auth-link">
              Şifremi Unuttum
            </Link>
            <Link to="/register" className="auth-link">
              Hesabınız yok mu? Kayıt Olun
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 