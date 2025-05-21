import React, { useState, useEffect } from 'react';
import CameraView from './CameraView';
import { useAuth } from '../contexts/AuthContext';
import EditDevicePopup from './EditDevicePopup';
import DeviceActivityModal from './DeviceActivityModal';
import CameraRecordingsModal from './CameraRecordingsModal';
import useWebSocket from '../hooks/useWebSocket';
import { BACKEND_URL } from '../config/api';
import SchedulePopup from './SchedulePopup';
import ShareCameraModal from './ShareCameraModal';

function CameraTable() {
  const deviceType = "Camera";
  const [isOpenEditPopup, setIsOpenEditPopup] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [sharedCameras, setSharedCameras] = useState([]);
  const [isOpenActivityModal, setIsOpenActivityModal] = useState(false);
  const [isOpenCameraView, setIsOpenCameraView] = useState(false);
  const [isOpenRecordingsModal, setIsOpenRecordingsModal] = useState(false);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isOpenSchedulePopup, setIsOpenSchedulePopup] = useState(false);
  const [isThisCameraRecording, setIsThisCameraRecording] = useState(false);
  const [isSharedCamera, setIsSharedCamera] = useState(false);
  const { currentUser } = useAuth();
  const currentUserId = currentUser.userId;
  const [isOpenShareModal, setIsOpenShareModal] = useState(false);
  const token = localStorage.getItem("token");

  // Sử dụng WebSocket để lắng nghe cập nhật về thiết bị camera
  const { isConnected, lastMessage, error: wsError } = useWebSocket({
    autoConnect: true,
    events: ['camera-update']
  });

  const handleEditPopup = (cameraId) => {
    setIsOpenEditPopup(true);
    setSelectedCameraId(cameraId);
  };

  const handleSchedulePopup = (cameraId) => {
    console.log('Schedule popup triggered for camera:', cameraId);
    setIsOpenSchedulePopup(true);
    setSelectedCameraId(cameraId);
  }

  const handleActivityModal = (cameraId) => {
    setIsOpenActivityModal(true);
    setSelectedCameraId(cameraId);
  };

  const handleOpenCameraView = (cameraId, isRecording, isShared = false) => {
    setIsOpenCameraView(true);
    setIsThisCameraRecording(isRecording);
    setSelectedCameraId(cameraId);
    setIsSharedCamera(isShared);
  };

  const handleOpenRecordingsModal = (cameraId) => {
    setIsOpenRecordingsModal(true);
    setSelectedCameraId(cameraId);
  };

  const handleClosePopup = () => {
    setIsOpenCameraView(false);
    setIsOpenEditPopup(false);
    setIsOpenActivityModal(false);
    setIsOpenRecordingsModal(false);
    setIsOpenSchedulePopup(false);
    setIsOpenShareModal(false);
  };

  const handleOpenShareModal = (cameraId) => {
    setIsOpenShareModal(true);
    setSelectedCameraId(cameraId);
  };

  useEffect(() => {
    fetchCameras();
    fetchSharedCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/camera/${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        setCameras(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
    }
  };

  const fetchSharedCameras = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/camera/shared-with-me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSharedCameras(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching shared cameras:', error);
    }
  };

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

  const handleToggleRecord = async (cameraId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/camera/toggle-record/${cameraId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.ok) {
        const updatedCamera = await response.json();
        setCameras(prevCameras => 
          prevCameras.map(camera => 
            camera.cameraId === updatedCamera.cameraId ? updatedCamera : camera
          )
        );
      } else {
        console.error('Error toggling record');
        // Có thể thêm thông báo cho người dùng ở đây
      }
    } catch (error) {
      console.error('Network or server error:', error);
      // Có thể thêm thông báo cho người dùng ở đây
    }
  }

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
    if(window.confirm("bạn muốn loại bỏ thiết bị?")){
      try {
        const response = await fetch(`${BACKEND_URL}/camera/delete/user?userId=${currentUserId}&cameraId=${cameraId}`, {
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
    }
  };

  return (
    <div>
      {cameras.length === 0 && sharedCameras.length === 0 ? (
        <div className="row no-device">
          <div className="cell">⚠️ No Camera Found</div>
        </div>
      ) : (
        <>
          {/* Hiển thị camera của người dùng */}
          {cameras.map(camera => (
            <div className="row" key={camera.cameraId} data-id={`camera-${camera.cameraId}`}>
              <div className="cell image" onClick={() => handleActivityModal(camera.cameraId)}>
                {camera.cameraStatus === 1 &&(
                  camera.isRecord === false && <img src="camera.png" alt="Camera" />)}
                {camera.cameraStatus === 1 &&(
                  camera.isRecord === true && <img src="camera-rec.png" alt="Camera" />)}
                {camera.cameraStatus === 0 && <img src="camera-1.png" alt="Camera" />}
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
  
              <div className="cell id">ID: {camera.cameraId}</div>
              <div className="cell ip">IP: {camera.cameraIp}</div>
  
              <div className="cell status">
                Status:
                {camera.cameraStatus === 1 &&(camera.isRecord === false && <span className="status-on">No Recording</span>)}
                {camera.cameraStatus === 1 &&(camera.isRecord === true && <span className="status-on">Recording</span>)}
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
                      onClick={() => handleOpenCameraView(camera.cameraId, camera.isRecord)}
                    >
                      <img src='play.png' alt="stop record"/>
                    </button>
                  </>
                )}
                
                {camera.cameraStatus === 1 && (
                  camera.isRecord === true ? (
                    <button
                      className="action-button"
                      onClick={() => handleToggleRecord(camera.cameraId)}
                    >
                      <img src='stopRecord.png' alt="stop record"/>
                    </button>
                  ) : (
                    <button
                      className="action-button"
                      onClick={() => handleToggleRecord(camera.cameraId)}
                    >
                      <img src='startRecord.png' alt="start record"/>
                    </button>
                  )
                )}
                <button
                  className="action-button recordings"
                  onClick={() => handleOpenRecordingsModal(camera.cameraId)}
                >
                  <img src='list.png' alt="list"/>
                </button>
                {camera.cameraStatus != null && (
                  <button
                    className="schedule-button"
                    onClick={() => handleSchedulePopup(camera.cameraId)}
                    title="Đặt lịch trình"
                  >
                    🕒
                  </button>
                )}
                <button
                  className="action-button share"
                  onClick={() => handleOpenShareModal(camera.cameraId)}
                  title="Chia sẻ camera"
                >
                  <img src='share.png' alt="share"/>
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

          {/* Hiển thị camera được chia sẻ */}
          {sharedCameras.length > 0 && (
            <>
              {/* <div className="row shared-camera-header">
                <div className="cell">Camera được chia sẻ với tôi</div>
              </div> */}
              {sharedCameras.map(camera => (
                <div className="row shared-camera" key={camera.cameraId} data-id={`shared-camera-${camera.cameraId}`}>
                  <div className="cell image">
                    {camera.cameraStatus === 1 && <img src="camera.png" alt="Camera" />}
                    {camera.cameraStatus === 0 && <img src="camera-1.png" alt="Camera" />}
                  </div>

                  <div className="cell">
                    {camera.cameraName}
                    <span className="shared-badge">(Được chia sẻ)</span>
                  </div>

                  {/* <div className="cell id">ID: {camera.cameraId}</div> */}
                  {/* <div className="cell ip">IP: {camera.cameraIp}</div> */}

                  <div className="cell status">
                    Status:
                    {camera.cameraStatus === 1 && <span className="status-on">Online</span>}
                    {camera.cameraStatus === 0 && <span className="status-on">Disconnected</span>}
                  </div>

                  <div className="cell action">
                    {camera.cameraStatus === 1 && (
                      <button
                        className="action-button"
                        onClick={() => handleOpenCameraView(camera.cameraId, false, true)}
                      >
                        <img src='play.png' alt="view camera"/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
  
      <CameraView
        selectedCameraId={selectedCameraId}
        isOpen={isOpenCameraView}
        OnClose={handleClosePopup}
        isRecording={isThisCameraRecording}
        isShared={isSharedCamera}
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
      {isOpenSchedulePopup && (
        <SchedulePopup
          isOpen={isOpenSchedulePopup}
          onClose={handleClosePopup}
          deviceType={deviceType}
          deviceId={selectedCameraId}
          userId={currentUserId}
        />
      )}

      {isOpenRecordingsModal && (
        <CameraRecordingsModal
          isOpen={isOpenRecordingsModal}
          onClose={handleClosePopup}
          cameraId={selectedCameraId}
          isRecording={isThisCameraRecording}
        />
      )}

      <ShareCameraModal
        isOpen={isOpenShareModal}
        onClose={handleClosePopup}
        cameraId={selectedCameraId}
        token={token}
      />
    </div>
  );
}

export default CameraTable; 