import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faBell, faLanguage } from '@fortawesome/free-solid-svg-icons';
import './Settings.css';

const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="settings">
      <h1 className="settings-title">Bu sayfa geliştirme aşamasındadır.</h1>

      
    </div>
  );
};

export default Settings; 