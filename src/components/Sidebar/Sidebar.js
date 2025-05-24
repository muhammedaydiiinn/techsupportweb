import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faTicketAlt,
  faPlus,
  faUser,
  faCog,
  faSignOutAlt,
  faChevronDown,
  faChevronRight,
  faBuilding,
  faDesktop,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeMenus, setActiveMenus] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // menuGroups'u useRef ile sabit tutuyoruz böylece her render'da yeniden oluşturulmayacak
  const menuGroupsRef = useRef([
    {
      title: "Genel",
      items: [
        {
          path: '/dashboard',
          icon: faHome,
          label: 'Anasayfa'
        },
        {
          path: '/tickets/create',
          icon: faPlus,
          label: 'Yeni Destek Talebi'
        },
        {
          path: '/tickets',
          icon: faTicketAlt,
          label: 'Destek Taleplerim'
        }
      ]
    },
    {
      title: "Yönetim",
      requiredPermission: 'admin',
      items: [
        {
          path: '/admin/users',
          icon: faUsers,
          label: 'Kullanıcı Yönetimi'
        },
        {
          path: '/admin/departments',
          icon: faBuilding,
          label: 'Departman Yönetimi'
        },
        {
          path: '/admin/equipment',
          icon: faDesktop,
          label: 'Ekipman Yönetimi'
        }
      ]
    },
    {
      title: "Hesap",
      items: [
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
      ]
    }
  ]);

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
    const menuGroups = menuGroupsRef.current;
    
    menuGroups.forEach(group => {
      group.items.forEach(item => {
        // Ana menü aktifliği
        if (location.pathname.startsWith(item.path) || 
            (item.path === '/dashboard' && location.pathname === '/')) {
          newActiveMenus[item.path] = true;
        }
      });
    });
    
    setActiveMenus(newActiveMenus);
  }, [location.pathname]);

  // URL'in belirli bir yolda olup olmadığını kontrol et
  const isPathActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    
    // Tam eşleşme kontrolü
    if (path === '/tickets') {
      return location.pathname === '/tickets';
    }
    
    if (path === '/tickets/create') {
      return location.pathname === '/tickets/create';
    }
    
    // Admin sayfaları için özel kontrol
    if (path.startsWith('/admin/')) {
      return location.pathname === path;
    }
    
    // Diğer sayfalar için prefix kontrolü
    return location.pathname.startsWith(path);
  };

  // Mobil görünümde sidebar dışına tıklama kontrolü
  const handleOverlayClick = () => {
    if (isMobile && isOpen && typeof toggleSidebar === 'function') {
      toggleSidebar();
    }
  };

  // Çıkış işlemi
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
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
          <h2>Teknik Destek</h2>
        </div>
        
        <div className="sidebar-menu">
          {menuGroupsRef.current.map((group, groupIndex) => (
            // Eğer bu grup admin izni gerektiriyorsa ve kullanıcı admin değilse gösterme
            (!group.requiredPermission || 
             (group.requiredPermission === 'admin' && user?.role === 'admin')) && (
              <div key={groupIndex} className="menu-group">
                <h3 className="group-title">{group.title}</h3>
                
                {group.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    to={item.path}
                    className={`menu-item ${isPathActive(item.path) ? 'active' : ''}`}
                    onClick={isMobile && typeof toggleSidebar === 'function' ? toggleSidebar : undefined}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )
          ))}

          {/* Çıkış Yap butonu */}
          <div className="menu-group logout-group">
            <button 
              className="menu-item logout-button"
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 