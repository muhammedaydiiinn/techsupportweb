import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty('--background-color', '#1a1a1a');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--primary-color', '#4a90e2');
      root.style.setProperty('--primary-hover', '#357abd');
      root.style.setProperty('--secondary-color', '#6c757d');
      root.style.setProperty('--secondary-hover', '#5a6268');
      root.style.setProperty('--success-color', '#28a745');
      root.style.setProperty('--error-color', '#dc3545');
      root.style.setProperty('--warning-color', '#ffc107');
      root.style.setProperty('--info-color', '#17a2b8');
      root.style.setProperty('--border-color', '#2d2d2d');
      root.style.setProperty('--input-background', '#2d2d2d');
      root.style.setProperty('--card-background', '#2d2d2d');
      root.style.setProperty('--table-header-background', '#2d2d2d');
      root.style.setProperty('--table-hover-background', '#3d3d3d');
      root.style.setProperty('--sidebar-width', '250px');
      root.style.setProperty('--font-family', 'system-ui, -apple-system, sans-serif');
    } else {
      root.style.setProperty('--background-color', '#f8f9fa');
      root.style.setProperty('--text-color', '#212529');
      root.style.setProperty('--primary-color', '#007bff');
      root.style.setProperty('--primary-hover', '#0056b3');
      root.style.setProperty('--secondary-color', '#6c757d');
      root.style.setProperty('--secondary-hover', '#5a6268');
      root.style.setProperty('--success-color', '#28a745');
      root.style.setProperty('--error-color', '#dc3545');
      root.style.setProperty('--warning-color', '#ffc107');
      root.style.setProperty('--info-color', '#17a2b8');
      root.style.setProperty('--border-color', '#dee2e6');
      root.style.setProperty('--input-background', '#ffffff');
      root.style.setProperty('--card-background', '#ffffff');
      root.style.setProperty('--table-header-background', '#f8f9fa');
      root.style.setProperty('--table-hover-background', '#f2f2f2');
      root.style.setProperty('--sidebar-width', '250px');
      root.style.setProperty('--font-family', 'system-ui, -apple-system, sans-serif');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 