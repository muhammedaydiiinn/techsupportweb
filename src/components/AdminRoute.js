import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import './PrivateRoute.css';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Kullanıcı giriş yapmış ama admin değilse ana sayfaya yönlendir
  if (user && user.role !== 'admin') {
    toast.error('Bu sayfaya erişmek için admin yetkisi gerekiyor');
    return <Navigate to="/dashboard" />;
  }

  // Kullanıcı admin ise içeriği göster
  return children;
};

export default AdminRoute; 