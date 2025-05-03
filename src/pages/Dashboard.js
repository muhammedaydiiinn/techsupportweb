import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTicketAlt,
  faUsers,
  faCheckCircle,
  faClock,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import { ticketService } from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    pendingTickets: 0,
    criticalTickets: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await ticketService.getStats();
        if (response.success) {
          setStats(response.data);
        } else {
          setError('İstatistikler yüklenirken bir hata oluştu');
        }
      } catch (err) {
        setError('İstatistikler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ icon, title, value, color }) => (
    <div className="stat-card" style={{ borderColor: color }}>
      <div className="stat-icon" style={{ color }}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return <div className="dashboard-loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
      <h1>Hoş geldiniz, {user?.name || 'Kullanıcı'}</h1>
        <p className="role-badge">{user?.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}</p>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={faTicketAlt}
          title="Toplam Talep"
          value={stats.totalTickets}
          color="#3498db"
        />
        <StatCard
          icon={faClock}
          title="Açık Talepler"
          value={stats.openTickets}
          color="#f1c40f"
        />
        <StatCard
          icon={faCheckCircle}
          title="Çözülen Talepler"
          value={stats.resolvedTickets}
          color="#2ecc71"
        />
        {user?.role === 'ADMIN' && (
          <>
            <StatCard
              icon={faUsers}
              title="Bekleyen Talepler"
              value={stats.pendingTickets}
              color="#e67e22"
            />
            <StatCard
              icon={faExclamationTriangle}
              title="Kritik Talepler"
              value={stats.criticalTickets}
              color="#e74c3c"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 