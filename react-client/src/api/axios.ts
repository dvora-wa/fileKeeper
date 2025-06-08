// import axios, { type InternalAxiosRequestConfig } from 'axios';

// const api = axios.create({
//   baseURL: 'https://localhost:44382/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const baseURL = config.baseURL ?? '';
//     const url = config.url ?? '';
//     console.log('Full URL:', baseURL + url);
    
//     const token = localStorage.getItem('token');
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;