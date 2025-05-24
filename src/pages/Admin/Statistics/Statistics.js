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
  faBuilding,
  faCheckCircle,
  faCircleExclamation,
  faPercentage
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { ticketService } from '../../../services/ticketService';
import { toast } from 'react-toastify';
import './Statistics.css';
import { equipmentService } from '../../../services/equipmentService';

const Statistics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Yeni state yapıları
  const [ticketStats, setTicketStats] = useState({
    total_tickets: 0,
    open_tickets: 0,
    resolved_tickets: 0,
    resolution_rate: 0
  });
  const [departmentStats, setDepartmentStats] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [equipmentStats, setEquipmentStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0
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
        
        // Gerçek API çağrıları
        const [
          ticketsResponse, 
          departmentStatsResponse, 
          userStatsResponse
        ] = await Promise.all([
          ticketService.getTicketStats(),
          ticketService.getDepartmentStats(),
          ticketService.getUserStats()
        ]);

        // API yanıtlarını kontrol et ve state'leri güncelle
        if (ticketsResponse && ticketsResponse.data) {
          setTicketStats(ticketsResponse.data);
        }
        
        if (departmentStatsResponse && departmentStatsResponse.data) {
          setDepartmentStats(departmentStatsResponse.data);
        }
        
        if (userStatsResponse && userStatsResponse.data) {
          setUserStats(userStatsResponse.data);
        }
        
        // Ekipman istatistiklerini getir
        fetchEquipmentStats();
        
        setError('');
      } catch (err) {
        console.error('İstatistikler yüklenirken hata:', err);
        setError('İstatistikler yüklenirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
        toast.error('İstatistikler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Ekipman istatistiklerini getir
  const fetchEquipmentStats = async () => {
    try {
      // Tüm ekipmanları getir
      const allEquipmentResponse = await equipmentService.getAllEquipment();
      
      if (allEquipmentResponse && allEquipmentResponse.data) {
        const allEquipment = allEquipmentResponse.data;
        
        // Aktif ekipmanları filtreleme
        const activeEquipment = allEquipment.filter(
          equipment => equipment.status === 'ACTIVE'
        );
        
        // Bakımdaki ekipmanları filtreleme
        const maintenanceEquipment = allEquipment.filter(
          equipment => equipment.status === 'MAINTENANCE' || equipment.status === 'REPAIR'
        );
        
        setEquipmentStats({
          total: allEquipment.length,
          active: activeEquipment.length,
          maintenance: maintenanceEquipment.length
        });
      }
    } catch (err) {
      console.error('Ekipman istatistikleri yüklenirken hata:', err);
      // Ana hata durumunu etkilemesin, sadece loglama yap
    }
  };

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

      {/* Özet İstatistikler */}
      <div className="statistics-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon">
              <FontAwesomeIcon icon={faTicketAlt} />
            </div>
            <div className="summary-info">
              <span className="summary-value">{ticketStats.total_tickets}</span>
              <span className="summary-label">Toplam Talep</span>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <FontAwesomeIcon icon={faCircleExclamation} />
            </div>
            <div className="summary-info">
              <span className="summary-value">{ticketStats.open_tickets}</span>
              <span className="summary-label">Açık Talep</span>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="summary-info">
              <span className="summary-value">{ticketStats.resolved_tickets}</span>
              <span className="summary-label">Çözülen Talep</span>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <FontAwesomeIcon icon={faPercentage} />
            </div>
            <div className="summary-info">
              <span className="summary-value">{(ticketStats.resolution_rate || 0).toFixed(1)}%</span>
              <span className="summary-label">Çözüm Oranı</span>
            </div>
          </div>
        </div>
      </div>

      <div className="statistics-grid">
        {/* Departman İstatistikleri */}
        <div className="statistics-card departments">
          <div className="card-header">
            <FontAwesomeIcon icon={faBuilding} />
            <h2>Departman İstatistikleri</h2>
          </div>
          <div className="card-body with-table">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Departman</th>
                  <th>Toplam</th>
                  <th>Açık</th>
                  <th>Çözülen</th>
                  <th>Çözüm Oranı</th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map(dept => (
                  <tr key={dept.department_id}>
                    <td>{dept.department_name}</td>
                    <td>{dept.total_tickets}</td>
                    <td>{dept.open_tickets}</td>
                    <td>{dept.resolved_tickets}</td>
                    <td>{(dept.resolution_rate || 0).toFixed(1)}%</td>
                  </tr>
                ))}
                {departmentStats.length === 0 && (
                  <tr>
                    <td colSpan="5" className="no-data">Departman verisi bulunamadı</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kullanıcı İstatistikleri */}
        <div className="statistics-card users">
          <div className="card-header">
            <FontAwesomeIcon icon={faUsers} />
            <h2>Kullanıcı İstatistikleri</h2>
          </div>
          <div className="card-body with-table">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Kullanıcı</th>
                  <th>Atanan</th>
                  <th>Çözülen</th>
                  <th>Çözüm Oranı</th>
                </tr>
              </thead>
              <tbody>
                {userStats.map(user => (
                  <tr key={user.user_id}>
                    <td>{user.user_name}</td>
                    <td>{user.assigned_tickets}</td>
                    <td>{user.resolved_tickets}</td>
                    <td>{(user.resolution_rate || 0).toFixed(1)}%</td>
                  </tr>
                ))}
                {userStats.length === 0 && (
                  <tr>
                    <td colSpan="4" className="no-data">Kullanıcı verisi bulunamadı</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ekipman İstatistikleri - Artık API'den geliyor */}
        <div className="statistics-card equipment">
          <div className="card-header">
            <FontAwesomeIcon icon={faDesktop} />
            <h2>Ekipmanlar</h2>
          </div>
          <div className="card-body">
            <div className="stat-item">
              <span className="stat-label">Toplam</span>
              <span className="stat-value">{equipmentStats.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Aktif</span>
              <span className="stat-value">{equipmentStats.active}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Bakımda</span>
              <span className="stat-value">{equipmentStats.maintenance}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 