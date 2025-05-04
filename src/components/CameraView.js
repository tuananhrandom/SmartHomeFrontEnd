import React, { useEffect, useRef, useState } from 'react';
import '../styles/cameraView.css';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL_WS } from '../config/api';

const CameraView = ({selectedCameraId ,isOpen, OnClose }) => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser.userId;
  const [isConnected, setIsConnected] = useState(false);
  const [rotationStatus, setRotationStatus] = useState(null);
  const [isRotating, setIsRotating] = useState(false);

  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const statusTimeoutRef = useRef(null);

  useEffect(() => {
    // Chỉ kết nối khi cả isOpen và selectedCameraId đều có giá trị
    if (isOpen && selectedCameraId) {
      // Khởi tạo kết nối WebSocket
      const ws = new WebSocket(`${BACKEND_URL_WS}/ws/camera/livecamera`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        ws.send(`user:${currentUserId}:${selectedCameraId}`);
        console.log(`user:${currentUserId}:${selectedCameraId}`);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Không thể kết nối đến camera');
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        // if (event.data instanceof Blob) {
        //   const imageUrl = URL.createObjectURL(event.data);
        //   if (videoRef.current) {
        //     videoRef.current.src = imageUrl;
        //   }
        //   // Clean up URL object after image is loaded
        //   setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
        if (event.data instanceof Blob) {
          const blob = new Blob([event.data], { type: 'image/jpeg' }); // Chỉ định rõ kiểu dữ liệu
          const imageUrl = URL.createObjectURL(blob);
          if (videoRef.current) {
            videoRef.current.onload = () => {
              URL.revokeObjectURL(imageUrl); // Dọn dẹp sau khi tải xong
            };
            videoRef.current.src = imageUrl;
          }
        } else if (typeof event.data === 'string') {
          // Xử lý các tin nhắn phản hồi từ server
          try {
            if (event.data.includes('rotated')) {
              setIsRotating(false);
              setRotationStatus('Đã xoay camera thành công');
              
              // Xóa thông báo sau 3 giây
              if (statusTimeoutRef.current) {
                clearTimeout(statusTimeoutRef.current);
              }
              statusTimeoutRef.current = setTimeout(() => {
                setRotationStatus(null);
              }, 3000);
            }
          } catch (error) {
            console.error('Lỗi xử lý tin nhắn:', error);
          }
        }
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
        if (statusTimeoutRef.current) {
          clearTimeout(statusTimeoutRef.current);
        }
      };
    }
    // Nếu isOpen là false hoặc selectedCameraId không có giá trị, không kết nối WebSocket
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, [isOpen, selectedCameraId, currentUserId]);

  const handleRefresh = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
    setError(null);
    
    // Khởi tạo lại kết nối nếu component đang mở
    if (isOpen && selectedCameraId) {
      const ws = new WebSocket(`${BACKEND_URL_WS}/ws/camera/livecamera`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        ws.send(`user:${currentUserId}:${selectedCameraId}`);
        console.log(`user:${currentUserId}:${selectedCameraId}`);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Không thể kết nối đến camera');
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        if (event.data instanceof Blob) {
          const imageUrl = URL.createObjectURL(event.data);
          if (videoRef.current) {
            videoRef.current.src = imageUrl;
          }
          // Clean up URL object after image is loaded
          setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
        }
      };
    }
  };

  const handleRotateCamera = (direction) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && isConnected) {
      // Gửi lệnh xoay camera theo định dạng: user:{userId}:control{cameraId}:Rotate:{direction}
      const controlMessage = `userControl:${currentUserId}:control${selectedCameraId}:Rotate:${direction}`;
      wsRef.current.send(controlMessage);
      console.log(`Đã gửi lệnh xoay camera: ${controlMessage}`);
      
      // Cập nhật trạng thái đang xoay
      // setIsRotating(true);
      // setRotationStatus(`Đang xoay camera ${getDirectionName(direction)}...`);
    } else {
      setError('Không thể điều khiển camera: Kết nối đã bị ngắt');
      console.error('WebSocket không được kết nối khi cố gắng xoay camera');
    }
  };

  const getDirectionName = (direction) => {
    switch (direction) {
      case 'up': return 'lên';
      case 'down': return 'xuống';
      case 'left': return 'sang trái';
      case 'right': return 'sang phải';
      default: return direction;
    }
  };

  if (!isOpen) return null;
  return (
    <>
    <div id="popup-overlay" className={`popup-overlay ${isOpen ? 'popup-overlay-show' : ''}`} onClick={OnClose}></div>
      <div className="camera-view-container">
        <div className="camera-header">
          <h2>Camera View</h2>
          <div className="camera-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
            </span>
            <button className="refresh-button" onClick={handleRefresh}>
              ⟳
            </button>
          </div>
        </div>

        {error ? (
          <div className="error-message">
            {error}
            <button className="retry-button" onClick={handleRefresh}>
              Thử lại
            </button>
          </div>
        ) : (
          <div className="video-container">
            {/* <img
              ref={videoRef}
              className="camera-feed"
              alt="Camera feed"
              style={{ display: isConnected ? 'block' : 'none' }}
            /> */}
            <img
              ref={videoRef}
              className="camera-feed"
              alt="Camera feed"
              style={{ display: isConnected ? 'block' : 'none' }}
              crossOrigin="anonymous"
              playsInline // Hỗ trợ iOS
            />
            {!isConnected && (
              <div className="loading-message">
                Đang kết nối đến camera...
              </div>
            )}
          </div>
        )}

        {/* Bảng điều khiển camera */}
        {isConnected && (
          <div className="camera-controls">
            <div className="control-header">
              <h3>Điều khiển camera</h3>
              {rotationStatus && (
                <div className={`rotation-status ${isRotating ? 'rotating' : 'rotated'}`}>
                  {rotationStatus}
                </div>
              )}
            </div>
            
            <div className="control-panel">
              <button 
                className="control-button up-button" 
                onClick={() => handleRotateCamera('up')}
                aria-label="Xoay camera lên"
                disabled={isRotating}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              </button>
              
              <div className="horizontal-controls">
                <button 
                  className="control-button left-button" 
                  onClick={() => handleRotateCamera('left')}
                  aria-label="Xoay camera sang trái"
                  disabled={isRotating}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                
                <button 
                  className="control-button right-button" 
                  onClick={() => handleRotateCamera('right')}
                  aria-label="Xoay camera sang phải"
                  disabled={isRotating}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
              
              <button 
                className="control-button down-button" 
                onClick={() => handleRotateCamera('down')}
                aria-label="Xoay camera xuống"
                disabled={isRotating}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CameraView; 