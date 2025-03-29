import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// DOM element'i doğru şekilde seç
const container = document.getElementById('root');

// container'ın varlığını kontrol et
if (!container) {
  throw new Error('Failed to find the root element');
}

// Root oluştur ve render et
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
