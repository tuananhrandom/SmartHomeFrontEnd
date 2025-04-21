import React, { useState, useEffect } from 'react';
import CameraView from './CameraView';
import { useAuth } from '../contexts/AuthContext';
import EditDevicePopup from './EditDevicePopup';
import DeviceActivityModal from './DeviceActivityModal';

function CameraTable() {
  const deviceType = "Camera";
  const [isOpenEditPopup, setIsOpenEditPopup]=useState(false);
  const [cameras, setCameras] = useState([]);
  const [isOpenActivityModal, setIsOpenActivityModal] = useState(false);
  const [isOpenCameraView,setIsOpenCameraView] = useState(false);
  const [selectedCameraId,setSelectedCameraId] = useState('');

  const { currentUser } = useAuth();
  const currentUserId = currentUser.userId;
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
  const handleClosePopup = () => {
    setIsOpenCameraView(false);
    setIsOpenEditPopup(false);
    setIsOpenActivityModal(false);

  };
  useEffect(() => {

    // Fetch cameras data
    const fetchCameras = async () => {
      try {
        const response = await fetch(`http://192.168.1.100:8080/camera/${currentUserId}`);
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
                {camera.cameraStatus === null && <span className="status-on">Disconnected</span>}
              </div>
  
              <div className="cell action">
                {camera.cameraStatus === null && (
                  <button
                    className="action-button refresh"
                    onClick={() => handleRefreshCamera(camera.cameraId)}
                  >
                    ⟳
                  </button>
                )}
                {camera.cameraStatus === 1 && (
                  <button
                    className="action-button"
                    onClick={() => handleOpenCameraView(camera.cameraId)}
                  >
                    View
                  </button>
                )}
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
    </div>
  );
}

export default CameraTable; 