import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faBell, faLanguage } from '@fortawesome/free-solid-svg-icons';
import './Settings.css';

const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="settings">
      <h1 className="settings-title">Ayarlar</h1>

      <div className="settings-content">
        <div className="settings-section">
          <h2>Görünüm</h2>
          <div className="settings-item">
            <div className="settings-item-info">
              <FontAwesomeIcon icon={faMoon} />
              <div>
                <h3>Karanlık Mod</h3>
                <p>Uygulamanın görünümünü karanlık temaya geçir</p>
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleTheme}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Bildirimler</h2>
          <div className="settings-item">
            <div className="settings-item-info">
              <FontAwesomeIcon icon={faBell} />
              <div>
                <h3>E-posta Bildirimleri</h3>
                <p>Yeni talepler ve güncellemeler için e-posta bildirimleri al</p>
              </div>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Dil</h2>
          <div className="settings-item">
            <div className="settings-item-info">
              <FontAwesomeIcon icon={faLanguage} />
              <div>
                <h3>Uygulama Dili</h3>
                <p>Tercih ettiğiniz dili seçin</p>
              </div>
            </div>
            <select className="language-select">
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 