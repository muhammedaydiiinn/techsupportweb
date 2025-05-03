import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faDesktop,
  faUsers,
  faTicketAlt,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Admin yetkisi kontrolü
  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const adminMenuItems = [
    {
      title: 'Departman Yönetimi',
      description: 'Departmanları görüntüle, ekle, düzenle ve sil',
      icon: faBuilding,
      path: '/admin/departments'
    },
    {
      title: 'Ekipman Yönetimi',
      description: 'Ekipmanları görüntüle, ekle, düzenle ve sil',
      icon: faDesktop,
      path: '/admin/equipment'
    },
    {
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcıları görüntüle, ekle, düzenle ve sil',
      icon: faUsers,
      path: '/admin/users'
    },
    {
      title: 'Destek Talepleri',
      description: 'Tüm destek taleplerini yönet',
      icon: faTicketAlt,
      path: '/tickets'
    },
    {
      title: 'İstatistikler',
      description: 'Sistem istatistiklerini görüntüle',
      icon: faChartLine,
      path: '/admin/statistics'
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Yönetim Paneli</h1>
        <p>Hoş geldiniz, {user.first_name} {user.last_name}</p>
      </div>

      <div className="admin-menu-grid">
        {adminMenuItems.map((item, index) => (
          <div
            key={index}
            className="admin-menu-card"
            onClick={() => navigate(item.path)}
          >
            <div className="admin-menu-icon">
              <FontAwesomeIcon icon={item.icon} />
            </div>
            <div className="admin-menu-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard; 