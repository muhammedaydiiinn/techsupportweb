import React, { useState, useEffect, useMemo } from 'react';
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
import PermissionGate from '../PermissionGate';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [activeMenus, setActiveMenus] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Menü öğeleri tanımı - useMemo ile sarmalanarak her render'da yeniden oluşması engellendi
  const menuItems = useMemo(() => [
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
    {
      path: '/admin',
      icon: faTachometerAlt,
      label: 'Yönetim Paneli',
      requiredPermission: 'isAdmin'
    },
    {
      path: '/profile',
      icon: faUser,
      label: 'Profil'
    },

  ], []); // Boş bağımlılık dizisi ile yalnızca bileşen ilk render edildiğinde oluşturulur

  // Mobil kontrolü
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // URL değiştiğinde aktif menüleri ayarla
  useEffect(() => {
    const newActiveMenus = {};
    
    menuItems.forEach(item => {
      // Ana menü aktifliği
      if (location.pathname.startsWith(item.path) || (item.path === '/dashboard' && location.pathname === '/')) {
        newActiveMenus[item.path] = true;
        
        // Alt menüler varsa kontrol et
        if (item.submenu) {
          item.submenu.forEach(subItem => {
            if (location.pathname === subItem.path || 
                (subItem.path === '/tickets' && location.pathname.startsWith('/tickets') && 
                 !location.pathname.includes('/create'))) {
              newActiveMenus[subItem.path] = true;
            }
          });
        }
      }
    });
    
    setActiveMenus(newActiveMenus);
  }, [location.pathname, menuItems]);

  const toggleSubmenu = (path) => {
    setActiveMenus(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // URL'in belirli bir yolda olup olmadığını kontrol et
  const isPathActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Aktif bağlantı kontrolü - tam eşleşme
  const isExactPathActive = (path) => {
    if (path === '/tickets') {
      return location.pathname === path || (location.pathname.startsWith('/tickets') && !location.pathname.includes('/create'));
    }
    return location.pathname === path;
  };

  // Mobil görünümde sidebar dışına tıklama kontrolü
  const handleOverlayClick = () => {
    if (isMobile && isOpen && typeof toggleSidebar === 'function') {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobil overlay */}
      {isMobile && isOpen && (
        <div className="sidebar-overlay visible" onClick={handleOverlayClick}></div>
      )}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Tech Support</h2>
      
        </div>
        <div className="sidebar-menu">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.requiredPermission ? (
                <PermissionGate permission={item.requiredPermission}>
                  {item.submenu ? (
                    <>
                      <div
                        className={`menu-item ${isPathActive(item.path) ? 'active' : ''}`}
                        onClick={() => toggleSubmenu(item.path)}
                      >
                        <FontAwesomeIcon icon={item.icon} />
                        <span>{item.label}</span>
                        <FontAwesomeIcon 
                          icon={activeMenus[item.path] ? faChevronDown : faChevronRight} 
                          style={{ marginLeft: 'auto' }}
                        />
                      </div>
                      {activeMenus[item.path] && (
                        <div className="submenu">
                          {item.submenu.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              to={subItem.path}
                              className={`submenu-item ${isExactPathActive(subItem.path) ? 'active' : ''}`}
                              onClick={isMobile && typeof toggleSidebar === 'function' ? toggleSidebar : undefined}
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
                      onClick={isMobile && typeof toggleSidebar === 'function' ? toggleSidebar : undefined}
                    >
                      <FontAwesomeIcon icon={item.icon} />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </PermissionGate>
              ) : (
                <>
                  {item.submenu ? (
                    <>
                      <div
                        className={`menu-item ${isPathActive(item.path) ? 'active' : ''}`}
                        onClick={() => toggleSubmenu(item.path)}
                      >
                        <FontAwesomeIcon icon={item.icon} />
                        <span>{item.label}</span>
                        <FontAwesomeIcon 
                          icon={activeMenus[item.path] ? faChevronDown : faChevronRight} 
                          style={{ marginLeft: 'auto' }}
                        />
                      </div>
                      {activeMenus[item.path] && (
                        <div className="submenu">
                          {item.submenu.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              to={subItem.path}
                              className={`submenu-item ${isExactPathActive(subItem.path) ? 'active' : ''}`}
                              onClick={isMobile && typeof toggleSidebar === 'function' ? toggleSidebar : undefined}
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
                      onClick={isMobile && typeof toggleSidebar === 'function' ? toggleSidebar : undefined}
                    >
                      <FontAwesomeIcon icon={item.icon} />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          ))}
        
        </div>
      </div>
    </>
  );
};

export default Sidebar; 