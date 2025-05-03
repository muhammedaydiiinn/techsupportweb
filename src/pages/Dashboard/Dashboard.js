import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTicketAlt, 
  faCirclePlus, 
  faList, 
  faCircleCheck, 
  faSpinner,
  faArrowRight,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { ticketService } from '../../services/ticketService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_tickets: 0,
    open_tickets: 0,
    resolved_tickets: 0,
    resolution_rate: 0
  });
  const [departmentStats, setDepartmentStats] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Paralel olarak bütün veri çağrılarını yap
      const [ticketsResponse, statsResponse, departmentStatsResponse, userStatsResponse] = await Promise.all([
        ticketService.getRecentTickets(),
        ticketService.getTicketStats(),
        ticketService.getDepartmentStats(),
        ticketService.getUserStats()
      ]);

      // Gelen veriyi işle ve state'e kaydet
      if (ticketsResponse && ticketsResponse.data) {
        setRecentTickets(ticketsResponse.data);
      } else {
        setRecentTickets([]);
      }

      if (statsResponse && statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      if (departmentStatsResponse && departmentStatsResponse.data) {
        setDepartmentStats(departmentStatsResponse.data);
      }
      
      if (userStatsResponse && userStatsResponse.data) {
        setUserStats(userStatsResponse.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Dashboard veri yükleme hatası:', err);
      setError('Veriler yüklenirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <FontAwesomeIcon icon={faExclamationCircle} />
        <p>{error}</p>
        <button onClick={handleRefresh}>Tekrar Dene</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Hoş Geldiniz, {user?.first_name} {user?.last_name}</h1>
        <p>{user?.email}</p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon total">
            <FontAwesomeIcon icon={faTicketAlt} />
          </div>
          <div className="stat-info">
            <h3>{stats.total_tickets}</h3>
            <p>Toplam Destek Talebi</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon open">
            <FontAwesomeIcon icon={faCirclePlus} />
          </div>
          <div className="stat-info">
            <h3>{stats.open_tickets}</h3>
            <p>Açık Talepler</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon progress">
            <FontAwesomeIcon icon={faCircleCheck} />
          </div>
          <div className="stat-info">
            <h3>{stats.resolved_tickets}</h3>
            <p>Çözülen Talepler</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon closed">
            <FontAwesomeIcon icon={faCircleCheck} />
          </div>
          <div className="stat-info">
            <h3>{(stats.resolution_rate || 0).toFixed(1)}%</h3>
            <p>Çözüm Oranı</p>
          </div>
        </div>
      </div>

      <div className="quick-access">
        <div className="quick-access-card" onClick={() => navigate('/tickets/create')}>
          <div className="card-icon create">
            <FontAwesomeIcon icon={faCirclePlus} />
          </div>
          <div className="card-content">
            <h3>Yeni Destek Talebi</h3>
            <p>Destek talebi oluştur</p>
          </div>
          <FontAwesomeIcon icon={faArrowRight} className="arrow-icon" />
        </div>

        <div className="quick-access-card" onClick={() => navigate('/tickets')}>
          <div className="card-icon list">
            <FontAwesomeIcon icon={faList} />
          </div>
          <div className="card-content">
            <h3>Destek Taleplerim</h3>
            <p>Tüm destek taleplerim</p>
          </div>
          <FontAwesomeIcon icon={faArrowRight} className="arrow-icon" />
        </div>
      </div>

      {/* Departman İstatistikleri Bölümü - Sadece admin ve support kullanıcılarına gösterilir */}
      {(user?.role === 'admin' || user?.role === 'support') && departmentStats.length > 0 && (
        <div className="stats-section">
          <div className="section-header">
            <h2>Departman İstatistikleri</h2>
          </div>
          
          <div className="department-stats">
            {departmentStats.map(dept => (
              <div key={dept.department_id} className="department-stat-card">
                <h3>{dept.department_name}</h3>
                <div className="stat-details">
                  <div className="stat-item">
                    <span className="stat-label">Toplam:</span>
                    <span className="stat-value">{dept.total_tickets}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Açık:</span>
                    <span className="stat-value">{dept.open_tickets}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Çözülen:</span>
                    <span className="stat-value">{dept.resolved_tickets}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Çözüm Oranı:</span>
                    <span className="stat-value">{(dept.resolution_rate || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Kullanıcı İstatistikleri Bölümü - Sadece admin kullanıcılarına gösterilir */}
      {user?.role === 'admin' && userStats.length > 0 && (
        <div className="stats-section">
          <div className="section-header">
            <h2>Kullanıcı İstatistikleri</h2>
          </div>
          
          <div className="user-stats">
            {userStats.map(userStat => (
              <div key={userStat.user_id} className="user-stat-card">
                <h3>{userStat.user_name}</h3>
                <div className="stat-details">
                  <div className="stat-item">
                    <span className="stat-label">Atanan Talepler:</span>
                    <span className="stat-value">{userStat.assigned_tickets}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Çözülen Talepler:</span>
                    <span className="stat-value">{userStat.resolved_tickets}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Çözüm Oranı:</span>
                    <span className="stat-value">{(userStat.resolution_rate || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="info-section">
        <h2>Nasıl Destek Alırım?</h2>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <p>Yeni Destek Talebi seçeneğine tıklayın</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <p>Talep detaylarını girin</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <p>Talebi gönderin</p>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <p>Destek ekibinin dönüşünü bekleyin</p>
          </div>
        </div>
      </div>

      <div className="recent-tickets">
        <div className="section-header">
          <h2>Son Destek Taleplerim</h2>
          <button onClick={() => navigate('/tickets')}>Tümünü Gör</button>
        </div>

        {recentTickets.length === 0 ? (
          <div className="empty-state">
            <p>Henüz destek talebiniz bulunmuyor.</p>
            <button onClick={() => navigate('/tickets/create')}>
              Destek Talebi Oluştur
            </button>
          </div>
        ) : (
          <div className="tickets-list">
            {recentTickets.map(ticket => (
              <div 
                key={ticket.id} 
                className="ticket-card"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <div className="ticket-info">
                  <h3>{ticket.title}</h3>
                  <p className="ticket-id">#{ticket.id}</p>
                </div>
                <div className="ticket-status">
                  <span className={`status-badge ${ticket.status}`}>
                    {ticket.status}
                  </span>
                  <span className={`priority-badge ${ticket.priority}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 