import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h1>Hoş geldiniz, {user?.name || 'Kullanıcı'}</h1>
      <p>Bu sayfa sadece giriş yapmış kullanıcılar tarafından görüntülenebilir.</p>
    </div>
  );
};

export default Dashboard; 