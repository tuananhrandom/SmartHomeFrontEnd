import React, { useState, useEffect } from 'react';

function CameraTable() {
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    // Fetch cameras data
    const fetchCameras = async () => {
      try {
        const response = await fetch('http://localhost:8080/camera/all');
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
      {cameras.map(camera => (
        <div className="row" key={camera.cameraId} data-id={`camera-${camera.cameraId}`}>
          <div className="cell image">
            <img src="/picture/camera.png" alt="Camera" />
          </div>
          <div className="cell">{camera.cameraName}</div>
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
                onClick={() => window.open(`/camera/view/${camera.cameraId}`, '_blank')}
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
    </div>
  );
}

export default CameraTable; 