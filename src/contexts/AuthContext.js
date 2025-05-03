import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authService.getProfile();
      if (response.success) {
        
        // API'den gelen rol bilgisini kontrol et
        const roleFromAPI = response.data.role || '';
        
        // Rol normalizasyonu
        let normalizedRole = roleFromAPI;
        
        // Eğer API'den boş rol geldiyse veya rol yoksa, varsayılan olarak 'user' atayalım
        if (!normalizedRole) {
          normalizedRole = 'user';
        }
        // Rol 'admin' veya 'ADMIN' içeriyorsa admin olarak kabul et
        else if (roleFromAPI === 'admin' || roleFromAPI.includes('ADMIN')) {
          normalizedRole = 'admin';
        }
        
        const userData = {
          ...response.data,
          role: normalizedRole // Normalize edilmiş rol
        };
        
        setUser(userData);
      } else {
        localStorage.removeItem('access_token');
        toast.error('Kullanıcı bilgileri alınamadı');
      }
    } catch (err) {
      console.error('Kimlik doğrulama hatası:', err);
      setError('Kimlik doğrulama hatası');
      localStorage.removeItem('access_token');
      toast.error('Oturum bilgileri alınamadı, lütfen tekrar giriş yapın');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        localStorage.setItem('access_token', response.data.access_token);
        
        await checkAuthStatus();
        
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu');
      return { success: false, message: 'Giriş yapılırken bir hata oluştu' };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuthStatus,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 