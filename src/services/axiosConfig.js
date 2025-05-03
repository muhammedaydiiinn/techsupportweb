import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-toastify';

// API URL'yi config dosyasından alıyoruz
// Development ortamında fallback olarak sabit bir URL kullanabiliriz
const apiBaseUrl = API_URL || 'http://127.0.0.1:8001/api/v1';

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Debug için istekleri loglama
const logRequest = (config) => {
  console.log(`=============================================`);
  console.log(`API İsteği: ${config.method.toUpperCase()} ${config.baseURL + config.url}`);
  
  // Token kontrolü
  if (config.headers.Authorization) {
    console.log('Token ile istek gönderiliyor');
  } else {
    console.warn('UYARI: Token olmadan istek gönderiliyor!');
  }
  
  if (config.data) {
    console.log('İstek Verisi:', config.data);
  }
  if (config.params) {
    console.log('İstek Parametreleri:', config.params);
  }
  console.log(`=============================================`);
  return config;
};

// İstek gönderilmeden önce çalışacak interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // LocalStorage'dan token'ı al
    const token = localStorage.getItem('access_token');
    
    // Eğer token varsa, her isteğe Authorization header'ı ekle
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Token bulunamadı! Bu istek yetkilendirilmemiş olarak gönderilecek.');
    }
    
    // API URL'ini düzelt
    if (config.url.startsWith('/')) {
      config.url = config.url.substring(1);
    }
    
    // Debug için loglama
    return logRequest(config);
  },
  (error) => {
    console.error('İstek gönderilirken hata oluştu:', error);
    return Promise.reject(error);
  }
);

// Yanıt işleme interceptor'ü
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`=============================================`);
    console.log(`API Yanıtı: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
    console.log(`Yanıt Verisi:`, response.data);
    console.log(`=============================================`);
    return response;
  },
  (error) => {
    // Hata detaylarını konsola logla
    console.error(`=============================================`);
    console.error(`API Hatası ${error.response?.status || ''}:`, {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.config?.data,
      params: error.config?.params,
      responseData: error.response?.data
    });
    console.error(`=============================================`);

    // 401 Unauthorized hatası alındığında otomatik olarak logout işlemi yapılabilir
    if (error.response && error.response.status === 401) {
      console.warn('Kimlik doğrulama hatası: Oturumunuz sonlandırılıyor.');
      // Otomatik logout işlemi
      localStorage.removeItem('access_token');
      toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
      window.location.href = '/login';
    }
    
    // 403 Forbidden hatası - Kullanıcının yetkisi yok
    if (error.response && error.response.status === 403) {
      console.error('Yetki hatası! Role kontrolü yapılmalı:', error.response.data);
      toast.error(error.response.data.detail || 'Bu işlem için yetkiniz bulunmuyor');
    }
    
    // 422 Unprocessable Entity hatası detayları
    if (error.response && error.response.status === 422) {
      toast.error(error.response.data.detail || 'Validasyon hatası');
      console.warn('Validasyon hatası:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 