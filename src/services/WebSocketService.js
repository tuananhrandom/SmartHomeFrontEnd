class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {
      'light-update': [],
      'door-update':[],
      'camera-update':[],
      'connect': [],
      'disconnect': [],
      'error': []
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
  }

  connect() {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      this.triggerEvent('error', { message: 'Không có token xác thực' });
      return;
    }

    // Tạo kết nối WebSocket với token
    const wsUrl = `ws://localhost:8080/ws/client?token=${token}`;
    
    try {
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket kết nối thành công');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.triggerEvent('connect', { message: 'Kết nối thành công' });
      };

      this.socket.onmessage = (event) => {
        try {
            console.log(event.data);
          const data = JSON.parse(event.data);
          console.log(data);
          if (data.type && this.listeners[data.type]) {
            this.triggerEvent(data.type, data.data);
          }
        } catch (error) {
          console.error('Lỗi khi xử lý dữ liệu nhận được:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket đã đóng kết nối:', event.code, event.reason);
        this.isConnected = false;
        this.triggerEvent('disconnect', { code: event.code, reason: event.reason });
        
        // Thử kết nối lại nếu không phải đóng chủ động (token không hợp lệ)
        if (event.code !== 1003 && event.code !== 1008) {
          this.attemptReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('Lỗi WebSocket:', error);
        this.triggerEvent('error', { message: 'Lỗi kết nối WebSocket' });
      };
    } catch (error) {
      console.error('Lỗi khi tạo kết nối WebSocket:', error);
      this.triggerEvent('error', { message: 'Không thể tạo kết nối WebSocket' });
    }
  }

  disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.close();
      this.isConnected = false;
    }
    
    // Hủy timeout kết nối lại nếu có
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Thử kết nối lại sau ${delay}ms (lần ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        console.log('Đang kết nối lại...');
        this.connect();
      }, delay);
    } else {
      console.log('Đã đạt đến số lần thử kết nối tối đa');
      this.triggerEvent('error', { message: 'Không thể kết nối lại sau nhiều lần thử' });
    }
  }

  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Nếu thêm listener cho sự kiện nhưng chưa kết nối, tự động kết nối
    if (!this.isConnected && !this.reconnectTimeout) {
      this.connect();
    }
    
    return () => this.removeEventListener(event, callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  triggerEvent(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Lỗi trong callback của sự kiện '${event}':`, error);
        }
      });
    }
  }
}

// Tạo một instance duy nhất
const webSocketService = new WebSocketService();

// Export instance để sử dụng trong toàn bộ ứng dụng
export default webSocketService; 