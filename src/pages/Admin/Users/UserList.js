import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faPlus,
  faEdit,
  faTrash,
  faSpinner,
  faArrowLeft,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { userService } from '../../../services/userService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './UserList.css';
import { departmentService } from '../../../services/departmentService';

const UserList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  // Admin yetkisi kontrolü
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      toast.error('Bu sayfaya erişmek için admin yetkisi gerekiyor');
    }
  }, [user, navigate]);

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      
      if (response && response.data) {
        setUsers(response.data);
        setError('');
      } else {
        setError('Kullanıcı bilgileri alınamadı');
      }
    } catch (err) {
      console.error('Kullanıcı listesi yüklenirken hata:', err);
      setError('Kullanıcılar yüklenirken bir hata oluştu');
      toast.error('Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Departmanları getir
  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAllDepartments();
      if (response && response.data) {
        setDepartments(response.data);
      }
    } catch (err) {
      console.error('Departman listesi yüklenirken hata:', err);
      toast.error('Departmanlar yüklenirken bir hata oluştu');
    }
  };

  useEffect(() => {
    // Eğer kullanıcı admin ise kullanıcıları ve departmanları getir
    if (user && user.role === 'admin') {
      fetchUsers();
      fetchDepartments();
    }
  }, [user]);

  // Kullanıcı rolünü değiştir
  const handleRoleChange = async (userId, newRole) => {
    if (user?.role !== 'admin') {
      toast.error('Bu işlem için admin yetkisi gerekiyor');
      return;
    }

    // Kendini admin olmaktan çıkarmaya çalışıyorsa engelle
    if (userId === user.id && newRole !== 'admin') {
      toast.error('Kendi admin yetkinizi kaldıramazsınız');
      return;
    }

    try {
      setProcessing(true);
      const response = await userService.updateUserRole(userId, newRole);
      
      if (response.status === 200 || response.status === 204) {
        toast.success('Kullanıcı rolü güncellendi');
        fetchUsers(); // Listeyi yenile
      } else {
        toast.error('Rol değiştirme işlemi başarısız oldu');
      }
    } catch (err) {
      console.error('Rol değiştirme hatası:', err);
      toast.error(err.response?.data?.detail || 'Rol değiştirme işlemi başarısız oldu');
    } finally {
      setProcessing(false);
    }
  };



  // Kullanıcı sil
  const handleDeleteUser = async (userId, name) => {
    if (user?.role !== 'admin') {
      toast.error('Bu işlem için admin yetkisi gerekiyor');
      return;
    }

    // Kendini silmeye çalışıyorsa engelle
    if (userId === user.id) {
      toast.error('Kendi hesabınızı silemezsiniz');
      return;
    }

    if (window.confirm(`"${name}" kullanıcısını silmek istediğinizden emin misiniz?`)) {
      try {
        setProcessing(true);
        const response = await userService.deleteUser(userId);
        
        if (response.status === 200 || response.status === 204) {
          toast.success('Kullanıcı başarıyla silindi');
          fetchUsers(); // Listeyi yenile
        } else {
          toast.error('Kullanıcı silme işlemi başarısız oldu');
        }
      } catch (err) {
        console.error('Kullanıcı silme hatası:', err);
        toast.error(err.response?.data?.detail || 'Kullanıcı silme işlemi başarısız oldu');
      } finally {
        setProcessing(false);
      }
    }
  };

  // Kullanıcı departmanını güncelle
  const handleDepartmentChange = async (userId, departmentId) => {
    if (user?.role !== 'admin') {
      toast.error('Bu işlem için admin yetkisi gerekiyor');
      return;
    }

    try {
      setProcessing(true);
      const response = await userService.updateUserDepartment(userId, departmentId);
      
      if (response.status === 200 || response.status === 204) {
        toast.success('Kullanıcı departmanı güncellendi');
        fetchUsers(); // Listeyi yenile
      } else {
        toast.error('Departman değiştirme işlemi başarısız oldu');
      }
    } catch (err) {
      console.error('Departman değiştirme hatası:', err);
      toast.error(err.response?.data?.detail || 'Departman değiştirme işlemi başarısız oldu');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="user-list-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <span>Yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-list-error">
        <FontAwesomeIcon icon={faExclamationCircle} />
        <span>{error}</span>
        <button onClick={() => navigate('/admin')}>Geri Dön</button>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => navigate('/admin')}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Geri</span>
          </button>
          <h1>
            <FontAwesomeIcon icon={faUsers} />
            <span>Kullanıcı Yönetimi</span>
          </h1>
        </div>
        <button 
          className="add-user-button"
          onClick={() => toast.info('Kullanıcı ekleme özelliği henüz eklenemedi.')}
          disabled={processing}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Yeni Kullanıcı</span>
        </button>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <p>Henüz kullanıcı bulunmuyor</p>
          <button onClick={() => toast.info('Kullanıcı ekleme özelliği henüz eklenemedi.')}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Kullanıcı Oluştur</span>
          </button>
        </div>
      ) : (
        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ad Soyad</th>
                <th>E-posta</th>
                <th>Departman</th>
                <th>Rol</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map(userData => (
                <tr key={userData.id}>
                  <td>{userData.id}</td>
                  <td>{userData.first_name} {userData.last_name}</td>
                  <td>{userData.email}</td>
                  <td>
                    {user?.role === 'admin' ? (
                      <select
                        value={userData.department?.id || ''}
                        onChange={(e) => handleDepartmentChange(userData.id, e.target.value || null)}
                        className="department-select"
                        disabled={processing}
                      >
                        <option value="">Departmansız</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{userData.department?.name || 'Departmansız'}</span>
                    )}
                  </td>
                  <td>
                    {user?.role === 'admin' ? (
                      <select
                        value={userData.role}
                        onChange={(e) => handleRoleChange(userData.id, e.target.value)}
                        className="role-select"
                        disabled={processing || userData.id === user.id}
                        title={userData.id === user.id ? "Kendi rolünüzü değiştiremezsiniz" : ""}
                      >
                        <option value="admin">Admin</option>
                        <option value="user">Kullanıcı</option>
                      </select>
                    ) : (
                      <span className={`role-badge ${userData.role}`}>
                        {userData.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-button"
                        onClick={() => navigate(`/admin/users/${userData.id}/edit`)}
                        disabled={processing}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteUser(userData.id, `${userData.first_name} ${userData.last_name}`)}
                        disabled={processing || userData.id === user.id}
                        title={userData.id === user.id ? "Kendinizi silemezsiniz" : ""}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList; 