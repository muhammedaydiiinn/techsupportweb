import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './AuthStyles.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect sonrası dönülecek sayfa
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const result = await login(email, password);
      
      if (result.success) {
        toast.success('Giriş başarılı!');
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
        toast.error(result.message || 'Giriş yapılamadı');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Giriş sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      toast.error('Giriş yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-layout">
        <div className="auth-sidebar">
          <div className="auth-sidebar-content">
            <h2>Teknik Destek Portalı</h2>
            <p>
              Teknik destek taleplerini oluşturmak, takip etmek ve çözüme kavuşturmak 
              için tasarlanmış modern platformumuza hoş geldiniz.
            </p>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h1>Giriş Yap</h1>
            <p>Teknik destek sistemine hoş geldiniz</p>
          </div>
          
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
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
            
            <div className="form-group">
              <label htmlFor="password">
                <FontAwesomeIcon icon={faLock} /> Şifre
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifreniz"
                required
              />
            </div>
            
            <div className="form-actions">
              <div className="auth-links">
                <Link to="/forgot-password" className="auth-link">
                  Şifremi Unuttum
                </Link>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="auth-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Giriş Yapılıyor...
                </>
              ) : 'Giriş Yap'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Hesabınız yok mu? <Link to="/register" className="auth-link">Kayıt Ol</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 