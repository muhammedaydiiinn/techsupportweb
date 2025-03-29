import React, { useEffect, useState } from 'react';
import api from '../api'; // Global axios instance'ı kullan
import './Api.css';

function Api() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/'); // Sadece endpoint belirtiyoruz
        setData(response.data);
      } catch (error) {
        setError('API çağrısında hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
        console.error('API Hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="api-container"><p>Yükleniyor...</p></div>;
  if (error) return <div className="api-container"><p className="error-message">{error}</p></div>;

  return (
    <div className="api-container">
      <h2>API Verileri</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default Api;
