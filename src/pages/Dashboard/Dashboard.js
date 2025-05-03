import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTicketAlt, 
  faCirclePlus, 
  faList, 
  faCircleCheck, 
  faCircleXmark,
  faSpinner,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { ticketService } from '../../services/ticketService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // getRecentTickets ve getTicketStats fonksiyonları artık backendden doğrudan data almıyor
      // Bunun yerine normal /tickets endpoint'ini kullanıp işlemi burada yapıyoruz
      const ticketsResponse = await ticketService.getRecentTickets();
      const statsResponse = await ticketService.getTicketStats();

      // Gelen veriyi işle ve state'e kaydet
      if (ticketsResponse.data) {
        setRecentTickets(ticketsResponse.data);
      } else {
        setRecentTickets([]);
      }

      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      setError(null);
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu.');
      console.error('Dashboard veri yükleme hatası:', err);
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
        <FontAwesomeIcon icon={faCircleXmark} />
        <p>{error}</p>
        <button onClick={handleRefresh}>Tekrar Dene</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Hoş Geldiniz, {user?.name}</h1>
        <p>{user?.email}</p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon total">
            <FontAwesomeIcon icon={faTicketAlt} />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Toplam Destek Talebi</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon open">
            <FontAwesomeIcon icon={faCirclePlus} />
          </div>
          <div className="stat-info">
            <h3>{stats.open}</h3>
            <p>Açık Talepler</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon progress">
            <FontAwesomeIcon icon={faSpinner} spin />
          </div>
          <div className="stat-info">
            <h3>{stats.inProgress}</h3>
            <p>İşlemdeki Talepler</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon closed">
            <FontAwesomeIcon icon={faCircleCheck} />
          </div>
          <div className="stat-info">
            <h3>{stats.closed}</h3>
            <p>Kapalı Talepler</p>
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