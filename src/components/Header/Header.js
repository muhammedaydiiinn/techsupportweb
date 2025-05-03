import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faBell, 
  faUser, 
  faSignOutAlt,
  faMoon,
  faSun,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Header.css';

const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Dropdown'ın dışına tıklanınca kapanmasını sağlayan etki
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="toggle-button" onClick={onToggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      <div className="header-right">
        <button className="theme-toggle" onClick={toggleTheme}>
          <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
        </button>

        <button className="notification-button">
          <FontAwesomeIcon icon={faBell} />
          <span className="notification-badge">3</span>
        </button>

        <div className="user-menu" ref={dropdownRef}>
          <button className="user-button" onClick={toggleDropdown}>
            <FontAwesomeIcon icon={faUser} />
            <span>{user?.name || user?.first_name || 'Kullanıcı'}</span>
            <FontAwesomeIcon icon={faChevronDown} className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="user-dropdown">
              <button onClick={() => {
                navigate('/profile');
                setIsDropdownOpen(false);
              }}>
                <FontAwesomeIcon icon={faUser} />
                <span>Profil</span>
              </button>
              {user?.role === 'admin' && (
                <button onClick={() => {
                  navigate('/admin');
                  setIsDropdownOpen(false);
                }}>
                  <FontAwesomeIcon icon={faUser} />
                  <span>Yönetim Paneli</span>
                </button>
              )}
              <button onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Çıkış Yap</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 