import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faTicket,
  faUsers,
  faChartLine,
  faCog,
  faPlus,
  faChevronDown,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: faHome, label: 'Dashboard' },
    { 
      path: '/tickets', 
      icon: faTicket, 
      label: 'Talepler',
      submenu: [
        { path: '/tickets/create', icon: faPlus, label: 'Yeni Talep' }
      ]
    },
    { path: '/users', icon: faUsers, label: 'Kullanıcılar' },
    { path: '/reports', icon: faChartLine, label: 'Raporlar' },
    { path: '/settings', icon: faCog, label: 'Ayarlar' }
  ];

  const toggleSubmenu = (e, item) => {
    if (item.submenu) {
      e.preventDefault();
      setIsTicketsOpen(!isTicketsOpen);
    }
  };

  return (
    <div className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div key={index}>
            <NavLink
              to={item.path}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={(e) => toggleSubmenu(e, item)}
            >
              <div className="sidebar-link-content">
                <FontAwesomeIcon icon={item.icon} />
                <span>{item.label}</span>
              </div>
              {item.submenu && (
                <FontAwesomeIcon 
                  icon={isTicketsOpen ? faChevronDown : faChevronRight} 
                  className="submenu-icon"
                />
              )}
            </NavLink>
            {item.submenu && isTicketsOpen && (
              <div className="submenu">
                {item.submenu.map((subItem, subIndex) => (
                  <NavLink
                    key={subIndex}
                    to={subItem.path}
                    className={({ isActive }) => 
                      `sidebar-link submenu-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <FontAwesomeIcon icon={subItem.icon} />
                    <span>{subItem.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 