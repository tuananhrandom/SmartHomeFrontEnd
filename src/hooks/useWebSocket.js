import { useEffect, useState, useCallback } from 'react';
import webSocketService from '../services/WebSocketService';

/**
 * Hook để sử dụng WebSocket trong các components
 * @param {Object} options - Cấu hình cho hook
 * @param {boolean} options.autoConnect - Tự động kết nối khi component mount
 * @param {Array<string>} options.events - Danh sách sự kiện cần lắng nghe
 * @returns {Object} - Trả về các hàm và trạng thái để tương tác với WebSocket
 */
const useWebSocket = (options = {}) => {
  const { autoConnect = true, events = [] } = options;
  const [isConnected, setIsConnected] = useState(webSocketService.isConnected);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  // Hàm kết nối WebSocket
  const connect = useCallback(() => {
    webSocketService.connect();
  }, []);

  // Hàm ngắt kết nối WebSocket
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  // Hàm đăng ký lắng nghe sự kiện
  const subscribe = useCallback((event, callback) => {
    return webSocketService.addEventListener(event, callback);
  }, []);

  // Xử lý sự kiện kết nối
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = (data) => {
      setIsConnected(false);
      if (data.code === 1003 || data.code === 1008) {
        setError('Token không hợp lệ hoặc hết hạn');
      }
    };

    const handleError = (data) => {
      setError(data.message);
    };

    // Đăng ký các listeners
    const connectUnsubscribe = webSocketService.addEventListener('connect', handleConnect);
    const disconnectUnsubscribe = webSocketService.addEventListener('disconnect', handleDisconnect);
    const errorUnsubscribe = webSocketService.addEventListener('error', handleError);

    // Tự động kết nối nếu được yêu cầu
    if (autoConnect && !webSocketService.isConnected) {
      webSocketService.connect();
    }

    return () => {
      // Hủy đăng ký listeners khi component unmount
      connectUnsubscribe();
      disconnectUnsubscribe();
      errorUnsubscribe();
    };
  }, [autoConnect]);

  // Đăng ký các sự kiện được chỉ định
  useEffect(() => {
    const unsubscribes = events.map(event => {
      return webSocketService.addEventListener(event, (data) => {
        setLastMessage({ type: event, data });
      });
    });

    return () => {
      // Hủy đăng ký khi component unmount hoặc events thay đổi
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [events]);

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    subscribe
  };
};

export default useWebSocket; 