import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import webSocketService from '../services/WebSocketService';

const TokenExpirationHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, currentUser } = useAuth();
  
  // Danh sách các đường dẫn không cần xác thực
  const publicPaths = ['/login', '/register', '/forget'];
  
  // Kiểm tra nếu đường dẫn hiện tại là public
  const isPublicPath = publicPaths.includes(location.pathname);

  useEffect(() => {
    let unsubscribe = null;
    
    // Chỉ xử lý token expiration nếu không phải ở trang public
    if (!isPublicPath && currentUser) {
      // Xử lý sự kiện token hết hạn từ WebSocket
      const handleTokenExpired = () => {
        console.log('Token hết hạn, chuyển hướng đến trang đăng nhập');
        logout();
        navigate('/login');
      };

      // Đăng ký lắng nghe sự kiện token hết hạn
      unsubscribe = webSocketService.addEventListener('token-expired', handleTokenExpired);
    }

    return () => {
      // Hủy đăng ký event khi component unmount hoặc route thay đổi
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [navigate, logout, isPublicPath, location.pathname, currentUser]);

  // Component này không hiển thị gì
  return null;
};

export default TokenExpirationHandler;