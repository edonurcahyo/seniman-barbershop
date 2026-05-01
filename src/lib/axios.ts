// src/lib/axios.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menambahkan token admin jika ada
axiosInstance.interceptors.request.use(
  (config) => {
    // Cek token admin
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk response - cek jika admin token expired
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Cek apakah ini request admin
      if (localStorage.getItem('isAdminLoggedIn')) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin');
        localStorage.removeItem('isAdminLoggedIn');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;