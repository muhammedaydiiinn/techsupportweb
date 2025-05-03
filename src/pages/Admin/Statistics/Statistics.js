import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faArrowLeft,
  faSpinner,
  faExclamationCircle,
  faTicketAlt,
  faDesktop,
  faUsers,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Statistics.css';

const Statistics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    tickets: { total: 0, open: 0, inProgress: 0, closed: 0 },
    equipment: { total: 0, active: 0, maintenance: 0 },
    users: { total: 0, active: 0, admin: 0 },
    departments: { total: 0 }
  });

  // Admin yetkisi kontrolü
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // İstatistikleri getir
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Burada gerçek API çağrıları yapılacak, şimdilik mock veriler kullanıyoruz
        // Örnek:
        // const ticketsResponse = await ticketService.getTicketStats();
        // const usersResponse = await userService.getUserStats();
        // vs.

        // Simüle edilmiş istatistik verileri
        setTimeout(() => {
          setStats({
            tickets: { total: 125, open: 45, inProgress: 32, closed: 48 },
            equipment: { total: 78, active: 65, maintenance: 13 },
            users: { total: 42, active: 38, admin: 4 },
            departments: { total: 6 }
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('İstatistikler yüklenirken hata:', err);
        setError('İstatistikler yüklenirken bir hata oluştu');
        toast.error('İstatistikler yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="statistics-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <span>İstatistikler yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-error">
        <FontAwesomeIcon icon={faExclamationCircle} />
        <span>{error}</span>
        <button onClick={() => navigate('/admin')}>Geri Dön</button>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => navigate('/admin')}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Geri</span>
          </button>
          <h1>
            <FontAwesomeIcon icon={faChartLine} />
            <span>Sistem İstatistikleri</span>
          </h1>
        </div>
      </div>

      <div className="statistics-grid">
        {/* Destek Talepleri İstatistikleri */}
        <div className="statistics-card tickets">
          <div className="card-header">
            <FontAwesomeIcon icon={faTicketAlt} />
            <h2>Destek Talepleri</h2>
          </div>
          <div className="card-body">
            <div className="stat-item">
              <span className="stat-label">Toplam</span>
              <span className="stat-value">{stats.tickets.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Açık</span>
              <span className="stat-value">{stats.tickets.open}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">İşlemde</span>
              <span className="stat-value">{stats.tickets.inProgress}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Kapalı</span>
              <span className="stat-value">{stats.tickets.closed}</span>
            </div>
          </div>
        </div>

        {/* Ekipman İstatistikleri */}
        <div className="statistics-card equipment">
          <div className="card-header">
            <FontAwesomeIcon icon={faDesktop} />
            <h2>Ekipmanlar</h2>
          </div>
          <div className="card-body">
            <div className="stat-item">
              <span className="stat-label">Toplam</span>
              <span className="stat-value">{stats.equipment.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Aktif</span>
              <span className="stat-value">{stats.equipment.active}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Bakımda</span>
              <span className="stat-value">{stats.equipment.maintenance}</span>
            </div>
          </div>
        </div>

        {/* Kullanıcı İstatistikleri */}
        <div className="statistics-card users">
          <div className="card-header">
            <FontAwesomeIcon icon={faUsers} />
            <h2>Kullanıcılar</h2>
          </div>
          <div className="card-body">
            <div className="stat-item">
              <span className="stat-label">Toplam</span>
              <span className="stat-value">{stats.users.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Aktif</span>
              <span className="stat-value">{stats.users.active}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Yönetici</span>
              <span className="stat-value">{stats.users.admin}</span>
            </div>
          </div>
        </div>

        {/* Departman İstatistikleri */}
        <div className="statistics-card departments">
          <div className="card-header">
            <FontAwesomeIcon icon={faBuilding} />
            <h2>Departmanlar</h2>
          </div>
          <div className="card-body">
            <div className="stat-item">
              <span className="stat-label">Toplam</span>
              <span className="stat-value">{stats.departments.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 