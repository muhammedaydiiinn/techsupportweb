import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faUser,
  faEnvelope,
  faLock,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { departmentService } from '../../api';
import './AuthStyles.css';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        const response = await departmentService.getAllDepartments();
        if (response && response.success && response.data) {
          setDepartments(response.data);
        } else {
          console.warn('Departman verisi alınamadı:', response);
          setDepartments([]);
        }
      } catch (err) {
        console.error('Departmanlar yüklenirken hata:', err);
        setDepartments([]);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      setError('Lütfen gerekli tüm alanları doldurun');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const result = await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        department_id: formData.department_id || undefined
      });
      
      if (result.success) {
        toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
        navigate('/login');
      } else {
        setError(result.message || 'Kayıt sırasında bir hata oluştu.');
        toast.error(result.message || 'Kayıt başarısız');
      }
    } catch (err) {
      console.error('Kayıt hatası:', err);
      setError('Kayıt sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      toast.error('Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Kayıt Ol</h1>
          <p>Teknik destek sistemine erişim için kayıt olun</p>
        </div>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">
                <FontAwesomeIcon icon={faUser} /> Ad
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Adınız"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name">
                <FontAwesomeIcon icon={faUser} /> Soyad
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
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
              onChange={handleChange}
              placeholder="E-posta adresiniz"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="department_id">
              <FontAwesomeIcon icon={faBuilding} /> Departman
            </label>
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              disabled={departmentsLoading}
              className="form-select"
            >
              <option value="">Departman Seçin (Opsiyonel)</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <FontAwesomeIcon icon={faLock} /> Şifre
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Şifreniz (en az 6 karakter)"
              required
              minLength={6}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">
              <FontAwesomeIcon icon={faLock} /> Şifre (Tekrar)
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Şifrenizi tekrar girin"
              required
              minLength={6}
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Kayıt Yapılıyor...
              </>
            ) : 'Kayıt Ol'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Zaten hesabınız var mı? <Link to="/login" className="auth-link">Giriş Yap</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register; 