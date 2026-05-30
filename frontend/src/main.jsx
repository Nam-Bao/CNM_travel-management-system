import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Nhúng Tailwind CSS vào toàn bộ hệ thống

import axios from 'axios';
axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);