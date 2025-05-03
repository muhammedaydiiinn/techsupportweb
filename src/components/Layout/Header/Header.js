import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faSun, 
  faMoon, 
  faBell, 
  faUser, 
  faCog, 
  faSignOutAlt,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      <div className="header-right">
        <button className="theme-toggle" onClick={toggleTheme}>
          <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
        </button>

        <div className="notifications">
          <button className="notification-button">
            <FontAwesomeIcon icon={faBell} />
            <span className="notification-badge">3</span>
          </button>
        </div>

        <div className="user-menu" ref={dropdownRef}>
          <button 
            className={`user-button ${showDropdown ? 'active' : ''}`}
            onClick={toggleDropdown}
          >
            <FontAwesomeIcon icon={faUser} />
            <span>{user?.name || 'Kullanıcı'}</span>
            <FontAwesomeIcon icon={faChevronDown} className={`dropdown-arrow ${showDropdown ? 'rotate' : ''}`} />
          </button>

          {showDropdown && (
            <div className="user-dropdown" data-theme={isDarkMode ? 'dark' : 'light'}>
              <div className="dropdown-header">
                <h3>{user?.name || 'Kullanıcı'}</h3>
                <p>{user?.email || 'kullanici@example.com'}</p>
              </div>

              <div className="dropdown-menu">
                <a href="/profile" className="dropdown-item">
                  <FontAwesomeIcon icon={faUser} />
                  <span>Profil</span>
                </a>
                <a href="/settings" className="dropdown-item">
                  <FontAwesomeIcon icon={faCog} />
                  <span>Ayarlar</span>
                </a>
                <div className="dropdown-divider" />
                <button onClick={handleLogout} className="dropdown-item">
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 