import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faCaretDown, 
  faSignOutAlt, 
  faCog,
  faUserCircle,
  faUserPlus,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Click outside handler'ı optimize edildi
  useEffect(() => {
    const handleClickOutside = (e) => {
      const dropdown = document.querySelector('.user-dropdown');
      if (dropdown && !dropdown.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  // Debug için user bilgisini kontrol et
  useEffect(() => {
    console.log('Current user state:', user);
  }, [user]);

  return (
    <header className="header">
      <div className="header-left">
        <Link to={user ? '/dashboard' : '/'} className="logo">
          Tech Support
        </Link>
        {user && (
          <button 
            type="button" 
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        )}
      </div>
      
      <div className="header-right">
        {user ? (
          <div className="user-dropdown">
            <button 
              type="button"
              className="dropdown-trigger"
              onClick={() => setIsOpen(!isOpen)}
            >
              <FontAwesomeIcon icon={faUserCircle} className="user-icon" />
              <span className="user-name">
                {user.name || user.email || 'Kullanıcı'}
              </span>
              <FontAwesomeIcon 
                icon={faCaretDown} 
                className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
              />
            </button>

            {isOpen && (
              <div className="user-menu">
                <div className="dropdown-header">
                  <div className="user-info">
                    <span className="user-fullname">
                      {user.name || 'Kullanıcı'}
                    </span>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <button 
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/profile');
                    setIsOpen(false);
                  }}
                >
                  <FontAwesomeIcon icon={faCog} />
                  <span>Profil</span>
                </button>

                <button 
                  type="button"
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link 
            to={location.pathname === '/login' ? '/register' : '/login'} 
            className="auth-button"
          >
            <FontAwesomeIcon icon={location.pathname === '/login' ? faUserPlus : faUser} />
            <span>{location.pathname === '/login' ? 'Kayıt Ol' : 'Giriş Yap'}</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header; 