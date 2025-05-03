import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faPlus,
  faEdit,
  faTrash,
  faSpinner,
  faArrowLeft,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { departmentService } from '../../../services/departmentService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './DepartmentList.css';
import DepartmentForm from './DepartmentForm';

const DepartmentList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);

  // Admin yetkisi kontrolü
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      toast.error('Bu sayfaya erişmek için admin yetkisi gerekiyor');
    }
  }, [user, navigate]);

  // Departmanları getir
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getAllDepartments();
      
      if (response && response.data) {
        setDepartments(response.data);
        setError('');
      } else {
        setError('Departman bilgileri alınamadı');
      }
    } catch (err) {
      console.error('Departman listesi yüklenirken hata:', err);
      setError('Departmanlar yüklenirken bir hata oluştu');
      toast.error('Departmanlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Eğer kullanıcı admin ise departmanları getir
    if (user && user.role === 'admin') {
      fetchDepartments();
    }
  }, [user]);

  // Departman ekle/düzenle modalı aç
  const handleAddDepartment = () => {
    setCurrentDepartment(null);
    setShowForm(true);
  };

  // Departman düzenle
  const handleEditDepartment = (department) => {
    setCurrentDepartment(department);
    setShowForm(true);
  };

  // Departman sil
  const handleDeleteDepartment = async (id, name) => {
    if (window.confirm(`"${name}" departmanını silmek istediğinizden emin misiniz?`)) {
      try {
        const response = await departmentService.deleteDepartment(id);
        
        if (response && (response.status === 200 || response.status === 204)) {
          toast.success('Departman başarıyla silindi');
          fetchDepartments();
        } else {
          toast.error('Departman silinirken bir hata oluştu');
        }
      } catch (err) {
        console.error('Departman silme hatası:', err);
        toast.error('Departman silinirken bir hata oluştu');
      }
    }
  };

  // Form kapatıldığında
  const handleFormClose = () => {
    setShowForm(false);
    setCurrentDepartment(null);
  };

  // Form gönderildiğinde
  const handleFormSubmit = async (formData) => {
    try {
      let response;
      
      // Departman veri formatını API'ye uygun hale getir
      const departmentData = {
        name: formData.name,
        description: formData.description,
        department_type: formData.department_type || 'other' // Geçerli enum değeri
      };
      
      if (currentDepartment) {
        // Departman güncelleme
        response = await departmentService.updateDepartment(currentDepartment.id, departmentData);
        if (response && (response.status === 200 || response.status === 204)) {
          toast.success('Departman başarıyla güncellendi');
        }
      } else {
        // Yeni departman oluşturma
        response = await departmentService.createDepartment(departmentData);
        if (response && (response.status === 201 || response.status === 200)) {
          toast.success('Departman başarıyla oluşturuldu');
        }
      }
      
      fetchDepartments();
      setShowForm(false);
      setCurrentDepartment(null);
    } catch (err) {
      console.error('Departman kaydetme hatası:', err);
      
      if (err.response?.data?.detail) {
        toast.error(`Hata: ${err.response.data.detail}`);
      } else {
        toast.error('Departman kaydedilirken bir hata oluştu');
      }
    }
  };

  if (loading) {
    return (
      <div className="department-list-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="department-list-error">
        <FontAwesomeIcon icon={faExclamationCircle} />
        <span>{error}</span>
        <button onClick={() => navigate('/admin')}>Geri Dön</button>
      </div>
    );
  }

  return (
    <div className="department-list-container">
      <div className="department-list-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => navigate('/admin')}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Geri</span>
          </button>
          <h1>
            <FontAwesomeIcon icon={faBuilding} />
            <span>Departman Yönetimi</span>
          </h1>
        </div>
        <button 
          className="add-department-button"
          onClick={handleAddDepartment}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Yeni Departman</span>
        </button>
      </div>

      {departments.length === 0 ? (
        <div className="empty-state">
          <p>Henüz departman bulunmuyor</p>
          <button onClick={handleAddDepartment}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Departman Oluştur</span>
          </button>
        </div>
      ) : (
        <div className="department-grid">
          {departments.map(department => (
            <div key={department.id} className="department-card">
              <div className="department-card-header">
                <h3>{department.name}</h3>
                <div className="department-actions">
                  <button 
                    className="edit-button"
                    onClick={() => handleEditDepartment(department)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteDepartment(department.id, department.name)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
              <div className="department-card-body">
                <p>{department.description || 'Açıklama yok'}</p>
                <div className="department-meta">
                  <span>Kullanıcı Sayısı: {department.user_count || 0}</span>
                  <span>Ekipman Sayısı: {department.equipment_count || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Departman Ekleme/Düzenleme Formu */}
      {showForm && (
        <DepartmentForm 
          department={currentDepartment}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default DepartmentList; 