import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faTicket,
  faUsers,
  faChartLine,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { path: '/dashboard', icon: faHome, label: 'Dashboard' },
    { path: '/tickets', icon: faTicket, label: 'Talepler' },
    { path: '/users', icon: faUsers, label: 'Kullanıcılar' },
    { path: '/reports', icon: faChartLine, label: 'Raporlar' },
    { path: '/settings', icon: faCog, label: 'Ayarlar' }
  ];

  return (
    <div className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FontAwesomeIcon icon={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 