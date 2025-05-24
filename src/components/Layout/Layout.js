import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import './Layout.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Ekran boyutuna göre sidebar durumunu kontrol et
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Ekran genişletildiğinde sidebar'ı otomatik aç
      if (!mobile && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
      
      // Ekran küçültüldüğünde sidebar'ı otomatik kapat
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // İçerik alanının sınıflarını belirle
  const contentClasses = isMobile 
    ? 'main-content' 
    : `main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`;

  return (
    <div className="layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className={contentClasses}>
        <Header onToggleSidebar={toggleSidebar} />
        
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout; 