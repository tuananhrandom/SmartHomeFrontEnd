import React, { useState, useEffect } from 'react';
import CameraView from './CameraView';
import { useAuth } from '../contexts/AuthContext';
import EditDevicePopup from './EditDevicePopup';
import DeviceActivityModal from './DeviceActivityModal';
import CameraRecordingsModal from './CameraRecordingsModal';
import useWebSocket from '../hooks/useWebSocket';
import { BACKEND_URL } from '../config/api';

function CameraTable() {
  const deviceType = "Camera";
  const [isOpenEditPopup, setIsOpenEditPopup]=useState(false);
  const [cameras, setCameras] = useState([]);
  const [isOpenActivityModal, setIsOpenActivityModal] = useState(false);
  const [isOpenCameraView,setIsOpenCameraView] = useState(false);
  const [isOpenRecordingsModal, setIsOpenRecordingsModal] = useState(false);
  const [selectedCameraId,setSelectedCameraId] = useState('');

  const { currentUser } = useAuth();
  const currentUserId = currentUser.userId;

  // Sử dụng WebSocket để lắng nghe cập nhật về thiết bị đèn
  const { isConnected, lastMessage, error: wsError } = useWebSocket({
    autoConnect: true,
    events: ['camera-update']
  });
  const handleEditPopup = (cameraId) => {
    setIsOpenEditPopup(true);
    setSelectedCameraId(cameraId);
  };
  const handleActivityModal = (cameraId) => {
    setIsOpenActivityModal(true);
    setSelectedCameraId(cameraId);
  }
  const handleOpenCameraView = (cameraId) =>{
    setIsOpenCameraView(true);
    setSelectedCameraId(cameraId);
  }
  const handleOpenRecordingsModal = (cameraId) => {
    setIsOpenRecordingsModal(true);
    setSelectedCameraId(cameraId);
  }
  const handleClosePopup = () => {
    setIsOpenCameraView(false);
    setIsOpenEditPopup(false);
    setIsOpenActivityModal(false);
    setIsOpenRecordingsModal(false);
  };
  useEffect(() => {

    // Fetch cameras data
    const fetchCameras = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/camera/${currentUserId}`);
        if (response.ok) {
          const data = await response.json();
          if(data.length > 0){
            setCameras(data);
          }
          else{
            return(
              <div>
                <h1>No cameras found</h1>
              </div>
            )
          }
        }
      } catch (error) {
        console.error('Error fetching cameras:', error);
      }
    };

    fetchCameras();
  }, []);
   // khi có sự kiện light-update thì cập nhật lại danh sách đèn
   useEffect(() => {
    if (lastMessage && lastMessage.type === 'camera-update') {
      // lấy về dữ liệu các đèn từ backend
      const fetchCameras = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/camera/${currentUserId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              setCameras(data);
            }
            else {
              return (
                <div>
                  <h1>No Camera found</h1>
                </div>
              )
            }
          }
        } catch (error) {
          console.error('Error fetching camera:', error);
        }
      };
      fetchCameras()
    }
  }, [lastMessage]);

  const handleRefreshCamera = async (cameraId) => {
    try {
      const response = await fetch(`/camera/refresh/${cameraId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedCamera = await response.json();
        setCameras(prevCameras => 
          prevCameras.map(camera => 
            camera.cameraId === cameraId ? updatedCamera : camera
          )
        );
      } else {
        console.error('Error refreshing camera');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleDeleteCamera = async (cameraId) => {
    try {
      const response = await fetch(`/camera/delete/${cameraId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCameras(prevCameras => prevCameras.filter(camera => camera.cameraId !== cameraId));
      } else {
        console.error('Error deleting camera');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <div>
      {cameras.length === 0 ? (
        <div className="row no-device">
          <div className="cell">⚠️ No Camera Found</div>
        </div>
      ) : (
        <>
          {cameras.map(camera => (
            <div className="row" key={camera.cameraId} data-id={`camera-${camera.cameraId}`}>
              <div className="cell image" onClick={() => handleActivityModal(camera.cameraId)}>
                <img src="camera.png" alt="Camera" />
              </div>
  
              <div className="cell">
                {camera.cameraName}
                {camera.cameraName != null && (
                  <button
                    className="cell edit"
                    onClick={() => handleEditPopup(camera.cameraId)}
                  >
                    ✍🏻
                  </button>
                )}
              </div>
  
              <div className="cell">ID: {camera.cameraId}</div>
              <div className="cell ip">IP: {camera.cameraIp}</div>
  
              <div className="cell status">
                Status:
                {camera.cameraStatus === 1 && <span className="status-on">Connected</span>}
                {camera.cameraStatus === 0 && <span className="status-on">Disconnected</span>}
              </div>
  
              <div className="cell action">
                {camera.cameraStatus === 0 && (
                  <button
                    className="action-button refresh"
                    onClick={() => handleRefreshCamera(camera.cameraId)}
                  >
                    ⟳
                  </button>
                )}
                {camera.cameraStatus === 1 && (
                  <>
                    <button
                      className="action-button"
                      onClick={() => handleOpenCameraView(camera.cameraId)}
                    >
                      View
                    </button>
                    
                  </>
                )}

                <button
                      className="action-button recordings"
                      onClick={() => handleOpenRecordingsModal(camera.cameraId)}
                    >
                      Records
                    </button>
              </div>
                
              <div className="cell delete">
                <button
                  className="delete-button"
                  onClick={() => handleDeleteCamera(camera.cameraId)}
                >
                  ✖
                </button>
              </div>
            </div>
          ))}
        </>
      )}
  
      <CameraView
        selectedCameraId={selectedCameraId}
        isOpen={isOpenCameraView}
        OnClose={handleClosePopup}
      />
  
      <EditDevicePopup
        isOpen={isOpenEditPopup}
        onClose={handleClosePopup}
        deviceType={deviceType}
        onAddDevice={deviceType}
        deviceId={selectedCameraId}
      />

      {isOpenActivityModal && (
        <DeviceActivityModal
          isOpen={isOpenActivityModal}
          onClose={handleClosePopup}
          deviceType={deviceType}
          deviceId={selectedCameraId}
        />
      )}

      {isOpenRecordingsModal && (
        <CameraRecordingsModal
          isOpen={isOpenRecordingsModal}
          onClose={handleClosePopup}
          cameraId={selectedCameraId}
        />
      )}
    </div>
  );
}

export default CameraTable; 