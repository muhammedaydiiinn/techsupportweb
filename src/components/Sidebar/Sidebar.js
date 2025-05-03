import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faTicketAlt,
  faList,
  faPlus,
  faUser,
  faCog,
  faSignOutAlt,
  faChevronDown,
  faChevronRight,
  faTachometerAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);

  // URL'e göre alt menü durumunu belirle
  React.useEffect(() => {
    // Tickets alt menüsüne ait bir sayfadaysak, alt menüyü otomatik olarak aç
    if (location.pathname.startsWith('/tickets')) {
      setIsTicketsOpen(true);
    }
  }, [location.pathname]);

  const toggleSubmenu = () => {
    setIsTicketsOpen(!isTicketsOpen);
  };

  // URL'in belirli bir yolda olup olmadığını kontrol et
  const isPathActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Aktif bağlantı kontrolü - tam eşleşme
  const isExactPathActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: faHome,
      label: 'Ana Sayfa'
    },
    { 
      path: '/tickets', 
      icon: faTicketAlt,
      label: 'Talepler',
      submenu: [
        {
          path: '/tickets',
          icon: faList,
          label: 'Tüm Talepler'
    },
        {
          path: '/tickets/create',
          icon: faPlus,
          label: 'Yeni Talep'
        }
      ]
    },
    // Admin için Yönetim Paneli menü öğesi
    ...(user?.role === 'admin' ? [
      {
        path: '/admin',
        icon: faTachometerAlt,
        label: 'Yönetim Paneli'
      }
    ] : []),
    {
      path: '/profile',
      icon: faUser,
      label: 'Profil'
    },
    {
      path: '/settings',
      icon: faCog,
      label: 'Ayarlar'
    }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Tech Support</h2>
      </div>
      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.submenu ? (
              <>
                <div
                  className={`menu-item ${isPathActive(item.path) ? 'active' : ''}`}
                  onClick={toggleSubmenu}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span>{item.label}</span>
                  <FontAwesomeIcon 
                    icon={isTicketsOpen ? faChevronDown : faChevronRight} 
                    style={{ marginLeft: 'auto' }}
                  />
                </div>
                {isTicketsOpen && (
                  <div className="submenu">
                    {item.submenu.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.path}
                        className={`submenu-item ${isExactPathActive(subItem.path) ? 'active' : ''}`}
                      >
                        <FontAwesomeIcon icon={subItem.icon} />
                        <span>{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className={`menu-item ${isPathActive(item.path) ? 'active' : ''}`}
              >
                <FontAwesomeIcon icon={item.icon} />
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
        <Link to="/logout" className="menu-item">
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Çıkış Yap</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar; 