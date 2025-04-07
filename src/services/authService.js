import axios from 'axios';
const API_URL = 'http://192.168.1.100:8080/api/auth/';

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
      const response = await api.post('http://192.168.1.100:8080/api/auth/register', {
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
      const response = await api.post('http://192.168.1.100:8080/api/auth/login', {
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
      const response = await api.get('/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Đã xảy ra lỗi khi lấy thông tin người dùng' };
    }
  };
  
// Kiểm tra người dùng đã đăng nhập chưa
export const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  //lấy thông tin người dùng 
export const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };
