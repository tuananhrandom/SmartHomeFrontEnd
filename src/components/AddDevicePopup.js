import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL } from '../config/api';
import QRScanner from './QRScanner';

function AddDevicePopup({ isOpen, onClose, deviceTypes, onAddDevice, currentDeviceType }) {
  const [deviceType, setDeviceType] = useState(currentDeviceType || deviceTypes[0] || 'Light');
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const { currentUser } = useAuth();
  const currentUserId = currentUser.userId;
  const userRole = currentUser.role;

  // Reset deviceType khi currentDeviceType thay đổi
  useEffect(() => {
    if (currentDeviceType) {
      setDeviceType(currentDeviceType);
    }
  }, [currentDeviceType]);

  const handleQRResult = (result) => {
    setDeviceId(result);
    setShowScanner(false);
  };

  const handleSubmit = async () => {
    if (userRole !== 'ADMIN') {
      
      if (!deviceId || !deviceName) {
        alert('Please fill in all fields');
        return;
      }
    } else {
      if (!deviceId) {
        alert('Please fill in all fields');
        return;
      }
    }

    let data = {};
    let endpoint = '';

    if (deviceType === 'Light') {
      data = {
        lightId: Number(deviceId),
        lightName: deviceName
      };
      if(userRole === 'ADMIN'){
        //fetch về backend có @requestParam userId

        endpoint = `${BACKEND_URL}/light/admin/newlight?lightId=${deviceId}`;
      }
      else{
        endpoint = `${BACKEND_URL}/light/newlight?userId=${currentUserId}`;
      }
    } else if (deviceType === 'Door') {
      data = {
        doorId: Number(deviceId),
        doorName: deviceName
        
      };
      if(userRole === 'ADMIN'){
        //fetch về backend có @requestParam userId

        endpoint = `${BACKEND_URL}/door/admin/newdoor?doorId=${deviceId}`;
      }
      else{
        endpoint = `${BACKEND_URL}/door/newdoor?userId=${currentUserId}`;
      }
    } else if (deviceType === 'Camera') {
      data = {
        cameraId: Number(deviceId),
        cameraName: deviceName
      };
      if(userRole === 'ADMIN'){
        //fetch về backend có @requestParam userId

        endpoint = `${BACKEND_URL}/camera/admin/newcamera?cameraId=${deviceId}`;
      }
      else{
        endpoint = `${BACKEND_URL}/camera/newcamera?userId=${currentUserId}`;
      }
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert(`${deviceType} added successfully!`);
        onAddDevice(deviceType);
        onClose();
        // Reset form
        setDeviceId('');
        setDeviceName('');
      } else {
        alert(`${deviceType} already exists or an error occurred.`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while adding the device.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div id="popup-overlay" className={`popup-overlay ${isOpen ? 'popup-overlay-show' : ''}`}></div>
      <div id="popup" className="popup">
        <div className={`popup-content ${isOpen ? 'popup-show' : ''}`}>
          <div className="popup-header">
            <h2>New Device</h2>
            <button 
              className="scan-qr-button"
              onClick={() => setShowScanner(true)}
            >
              <img src='qr.png' alt='QR'/>
            </button>
            <select 
              id="deviceType" 
              className="dropdown-button"
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
            >
              {deviceTypes.map((device, index) => (
                <option key={index} value={device}>
                  {device}
                </option>
              ))}
            </select>
          </div>
          <div className="popup-body">
            <div className="device-id-input">
              <input 
                type="text" 
                id="deviceId" 
                placeholder="Device ID"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
            </div>
            {userRole !== 'ADMIN' && (
              <input 
                type="text" 
                id="deviceName" 
                placeholder="Device Name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
            )}
          </div>
          <div className="popup-footer">
            <button id="cancelButton" onClick={onClose}>Cancel</button>
            <button id="doneButton" onClick={handleSubmit}>Done</button>
          </div>
        </div>
      </div>
      {showScanner && (
        <QRScanner 
          onResult={handleQRResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}

export default AddDevicePopup; 