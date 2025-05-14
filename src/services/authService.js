import axios from 'axios';
import { BACKEND_URL } from '../config/api';
const API_URL = `${BACKEND_URL}/auth/`;


//tạo axios với cấu hình mặc định
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});
// tự thêm token vào header để gửi về backend
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if(token){
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        Promise.reject(error);
    }
);
// đăng ký tài khoản
export const register = async (username, password, email, fullName) => {
    try {
      const response = await api.post(`${BACKEND_URL}/auth/register`, {
        username,
        password,
        email,
        fullName,
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Đã xảy ra lỗi khi đăng ký' };
    }
  };
// đăng nhập tài khoản
export const login = async (username, password) => {
    try {
      const response = await api.post(`${BACKEND_URL}/auth/login`, {
        username,
        password,
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Đã xảy ra lỗi khi đăng nhập' };
    }
  };
// đăng xuất tài khoản
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };
// lấy thông tin người dùng hiện tại
export const getCurrentUser = async () => {
    try {
      const response = await api.get(`${BACKEND_URL}/auth/me`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Đã xảy ra lỗi khi lấy thông tin người dùng' };
    }
  };
  
// Kiểm tra người dùng đã đăng nhập chưa
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null && !isTokenExpired();
  };

  //lấy thông tin người dùng 
export const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  // Kiểm tra token có hết hạn không
export const isTokenExpired = () => {
  const token = localStorage.getItem('token');
  if (!token) return true;

  try {
    // Giải mã phần payload của JWT token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));

    // Kiểm tra thời gian hết hạn
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Lỗi khi kiểm tra token:', error);
    return true; // Nếu có lỗi xảy ra, coi như token không hợp lệ
  }
};


