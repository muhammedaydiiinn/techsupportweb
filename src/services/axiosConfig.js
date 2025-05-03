import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-toastify';

// API URL'yi config dosyasından alıyoruz
// Development ortamında fallback olarak sabit bir URL kullanabiliriz
const apiBaseUrl = API_URL || 'http://127.0.0.1:8001/api/v1';

console.log('API_URL:', API_URL);
console.log('API Base URL:', apiBaseUrl);

// Test fonksiyonu - komponent mount edildiğinde API bağlantısını test etmek için
export const testApiConnection = async () => {
  try {
    console.log(`API bağlantısı test ediliyor: ${apiBaseUrl}`);
    const response = await axios.get(`${apiBaseUrl}/health-check`, { timeout: 5000 });
    console.log('API bağlantı testi sonucu:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API bağlantı testi başarısız:', error);
    return { 
      success: false, 
      error: error.message,
      details: {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response
      }
    };
  }
};

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
  console.log(`API İsteği: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  
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
    
    // Hata mesajlarını direkt olarak göster
    if (error.response && error.response.data) {
      console.error(`Hata Detayı:`, error.response.data);
      
      if (error.response.data.detail) {
        console.error(`Hata Açıklaması:`, error.response.data.detail);
      }
      
      if (error.response.data.errors) {
        console.error(`Validasyon Hataları:`, error.response.data.errors);
      }
    }
    
    // Özel URL formatı hataları için daha detaylı bilgi 
    if (error.config && error.config.url) {
      console.error(`İstek URL: ${error.config.baseURL}/${error.config.url}`);
    }
    
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