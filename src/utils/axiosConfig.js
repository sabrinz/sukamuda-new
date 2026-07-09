import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL;
const normalizeUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};
const baseURL = normalizeUrl(apiBaseUrl) || 'https://sukamuda.co.id';

// 1. Konfigurasi Dasar (Wajib agar Session & Cookie sinkron)
axios.defaults.withCredentials = true;
axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// 2. Setting XSRF (Standar Laravel Sanctum)
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

// 3. Helper untuk ambil Cookie
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

/**
 * Helper: Memastikan CSRF Token Siap
 * Dipanggil sebelum Login atau Register agar tidak error 419.
 */
export const ensureCsrfToken = async () => {
  try {
    const existingToken = getCookie('XSRF-TOKEN');
    
    if (!existingToken) {
      await axios.get('/sanctum/csrf-cookie');
      await new Promise(resolve => setTimeout(resolve, 300)); 
    }
    
    return true;
  } catch (error) {
    console.error('Gagal mengambil CSRF Token:', error);
    return false;
  }
};

/**
 * 4. INTERCEPTOR OTOMATIS (Solusi Unauthenticated)
 * Fungsi ini bakal nge-cek localStorage setiap kali lo ngirim data ke Laravel.
 * Kalau ada token, langsung ditempel ke Header.
 */
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Ambil token dari storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 5. RESPONSE INTERCEPTOR (Opsional tapi Penting)
 * Kalau tiba-tiba token mati (expired), otomatis bisa lo arahin ke login.
 */
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesi kamu habis, silakan login ulang.");
      // localStorage.removeItem('token'); // Bisa hapus token kalau mau
      // window.location.href = '/login';  // Bisa redirect otomatis kalau mau
    }
    return Promise.reject(error);
  }
);

export default axios;