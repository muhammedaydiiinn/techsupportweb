import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, 
  faEye, 
  faEyeSlash, 
  faSpinner,
  faExclamationCircle,
  faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import { authService } from '../../api';
import './AuthStyles.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL'den token parametresini al
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [formData, setFormData] = useState({
    password: '',
    password_confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [validating, setValidating] = useState(true);

  // Token doğrulama
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setTokenValid(false);
        setValidating(false);
        setError('Geçersiz şifre sıfırlama linki. Lütfen tekrar şifre sıfırlama talebinde bulunun.');
        return;
      }

      try {
        const response = await authService.validateResetToken(token, email);
        setTokenValid(response.success);
        setValidating(false);
        
        if (!response.success) {
          setError(response.message || 'Şifre sıfırlama linkiniz geçersiz veya süresi dolmuş.');
        }
      } catch (err) {
        console.error('Token doğrulama hatası:', err);
        setTokenValid(false);
        setValidating(false);
        setError('Token doğrulanırken bir hata oluştu. Lütfen tekrar şifre sıfırlama talebinde bulunun.');
      }
    };

    validateToken();
  }, [token, email]);

  const validateForm = () => {
    if (!formData.password || !formData.password_confirm) {
      setError('Tüm alanları doldurunuz.');
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
    
    try {
      const response = await authService.resetPassword({
        token,
        email,
        password: formData.password,
        password_confirm: formData.password_confirm
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || 'Şifre sıfırlama işlemi başarısız oldu.');
      }
    } catch (err) {
      console.error('Şifre sıfırlama hatası:', err);
      setError('Şifre sıfırlanırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Yükleniyor durumu
  if (validating) {
    return (
      <div className="auth-container">
        <div className="auth-layout">
          <div className="auth-sidebar">
            <div className="auth-sidebar-content">
              <h2>Şifre Sıfırlama</h2>
              <p>
                Şifre sıfırlama bağlantınız doğrulanıyor. Lütfen bekleyin...
              </p>
            </div>
          </div>
  
          <div className="auth-card">
            <div className="auth-header">
              <h1>Şifre Sıfırlama</h1>
              <p>Token doğrulanıyor...</p>
            </div>
            <div className="loading-container">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
              <p>Lütfen bekleyin...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Token geçersiz
  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-layout">
          <div className="auth-sidebar">
            <div className="auth-sidebar-content">
              <h2>Şifre Sıfırlama</h2>
              <p>
                Şifre sıfırlama işlemi için yeni bir bağlantı talep edin.
              </p>
            </div>
          </div>
  
          <div className="auth-card">
            <div className="auth-header">
              <h1>Geçersiz Bağlantı</h1>
              <p>Şifre sıfırlama bağlantınız geçersiz veya süresi dolmuş.</p>
            </div>
            <div className="auth-error">
              <FontAwesomeIcon icon={faExclamationCircle} />
              <span>{error}</span>
            </div>
            <div className="auth-footer">
              <Link to="/forgot-password" className="auth-button">
                Yeni Şifre Sıfırlama Bağlantısı Talep Et
              </Link>
              <Link to="/login" className="auth-link">
                Giriş Sayfasına Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-layout">
        <div className="auth-sidebar">
          <div className="auth-sidebar-content">
            <h2>Şifre Sıfırlama</h2>
            <p>
              Hesabınız için yeni bir şifre belirleyin. Güvenliğiniz için güçlü bir 
              şifre seçmenizi öneririz.
            </p>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h1>Yeni Şifre Oluştur</h1>
            <p>Lütfen yeni şifrenizi belirleyin</p>
          </div>
          
          {error && !success && (
            <div className="auth-error">
              <FontAwesomeIcon icon={faExclamationCircle} />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="auth-success">
              <FontAwesomeIcon icon={faCheckCircle} />
              Şifreniz başarıyla sıfırlandı! Giriş sayfasına yönlendiriliyorsunuz...
            </div>
          )}
          
          {!success && (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="password">
                  <FontAwesomeIcon icon={faLock} /> Yeni Şifre
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Yeni şifreniz (en az 8 karakter)"
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
                  <FontAwesomeIcon icon={faLock} /> Şifre Tekrar
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password_confirm"
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
              
              <button 
                type="submit" 
                className="auth-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>İşleniyor...</span>
                  </>
                ) : (
                  'Şifreyi Sıfırla'
                )}
              </button>
            </form>
          )}
          
          <div className="auth-footer">
            <Link to="/login" className="auth-link">Giriş Sayfasına Dön</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 