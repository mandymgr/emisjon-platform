import axios from 'axios';

/** Create axios instance with default config */ 
const axiosInstance = axios.create({
  baseURL: '', // Use relative URLs - the proxy will handle routing
  headers: {
    'Content-Type': 'application/json',
  },
  /** Important: This allows cookies to be sent with requests */
  withCredentials: true,
});

/** Request interceptor */
axiosInstance.interceptors.request.use(
  (config) => {
    // Cookies are sent automatically with withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/** Response interceptor */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    /** Handle common errors */
    if (error.response?.status === 401) {
      /** Only redirect to login if not already on auth pages and not a login/register request */
      const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
      const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      
      if (!isAuthPage && !isAuthRequest) {
        /** Unauthorized - redirect to login (cookie will be cleared by backend) */
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;