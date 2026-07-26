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
 * Helper: cek apakah request menuju API kita sendiri.
 * SECURITY FIX: token Bearer TIDAK BOLEH dikirim ke domain luar.
 */
const isOwnApiRequest = (config) => {
  const url = config.url || '';
  // URL relatif ("/api/...") selalu menuju baseURL kita
  if (!/^https?:\/\//i.test(url)) return true;
  // URL absolut: hanya kirim token kalau masih ke API kita
  return url.startsWith(baseURL);
};

/**
 * 4. INTERCEPTOR OTOMATIS (Solusi Unauthenticated)
 * Cek localStorage setiap kirim data ke Laravel.
 * SECURITY FIX: token hanya ditempel untuk request ke API sendiri.
 */
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && isOwnApiRequest(config)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 5. RESPONSE INTERCEPTOR
 * Kalau token mati (expired/revoked):
 * - Hapus token dari storage (mencegah state "login palsu")
 * - Broadcast event supaya AuthContext bisa update state tanpa hard redirect
 */
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Sesi kamu habis, silakan login ulang.');
      localStorage.removeItem('token');
      // Kabari AuthContext / komponen lain tanpa memaksa redirect
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default axios;