import { createContext, useContext, useState, useEffect } from 'react';
import { login, logout, register, getCurrentUser, getUser, isAuthenticated } from '../services/authService';

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const initAuth = async () => {
        try {
          if (isAuthenticated()) {
            const userData = getUser();
            setCurrentUser(userData);
          }
        } catch (error) {
          console.error('Lỗi khi khởi tạo xác thực:', error);
        } finally {
          setLoading(false);
        }
      };
  
      initAuth();
    }, []);
  
    const handleLogin = async (username, password) => {
      try {
        setError(null);
        const userData = await login(username, password);
        setCurrentUser(userData);
        return userData;
      } catch (error) {
        setError(error.message || 'Đăng nhập thất bại');
        throw error;
      }
    };
  
    const handleRegister = async (username, password, email, fullName) => {
      try {
        setError(null);
        const userData = await register(username, password, email, fullName);
        setCurrentUser(userData);
        return userData;
      } catch (error) {
        setError(error.message || 'Đăng ký thất bại');
        throw error;
      }
    };
  
    const handleLogout = () => {
      logout();
      setCurrentUser(null);
    };
  
    const value = {
      currentUser,
      loading,
      error,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      isAuthenticated: () => !!currentUser,
    };
  
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };
  
  export const useAuth = () => {
    return useContext(AuthContext);
  };


