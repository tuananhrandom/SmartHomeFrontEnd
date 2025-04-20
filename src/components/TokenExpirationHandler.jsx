import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import webSocketService from '../services/WebSocketService';

const TokenExpirationHandler = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Xử lý sự kiện token hết hạn từ WebSocket
    const handleTokenExpired = () => {
      console.log('Token hết hạn, chuyển hướng đến trang đăng nhập');
      logout();
      navigate('/login');
    };

    // Đăng ký lắng nghe sự kiện token hết hạn
    const unsubscribe = webSocketService.addEventListener('token-expired', handleTokenExpired);

    return () => {
      unsubscribe();
    };
  }, [navigate, logout]);

  // Component này không hiển thị gì
  return null;
};

export default TokenExpirationHandler;