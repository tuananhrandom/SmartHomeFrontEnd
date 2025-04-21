import React, { useEffect, useRef, useState } from 'react';
import '../styles/cameraView.css';
import { useAuth } from '../contexts/AuthContext';

const CameraView = ({selectedCameraId ,isOpen, OnClose }) => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser.userId;
  const [isConnected, setIsConnected] = useState(false);

  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    // Khởi tạo kết nối WebSocket
    const ws = new WebSocket(`ws://192.168.1.100:8080/ws/camera/livecamera`);
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

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen]);

  const handleRefresh = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
    setError(null);
    setIsConnected(true);
    setError(null);
    
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
            <img
              ref={videoRef}
              className="camera-feed"
              alt="Camera feed"
              style={{ display: isConnected ? 'block' : 'none' }}
            />
            {!isConnected && (
              <div className="loading-message">
                Đang kết nối đến camera...
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CameraView; 