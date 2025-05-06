import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:5000/api',
  baseURL: 'https://noise-backend.onrender.com/api',
  withCredentials: true // important to include cookies
});

export default axiosInstance;
