import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function EditDevicePopup({ isOpen, onClose, deviceType, onAddDevice, deviceId }) {
  // const [deviceType, setDeviceType] = useState(currentDeviceType || deviceTypes[0] || 'Light');
  // const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const { currentUser } = useAuth();
  const currentUserId = currentUser.userId;
  const userRole = currentUser.role;


  const handleSubmit = async () => {
    if (!deviceId || !deviceName) {
      alert('Please fill in all fields');
      return;
    }

    let data = {};
    let endpoint = '';

    if (deviceType === 'Light') {
      data = {
        lightId: Number(deviceId),
        lightName: deviceName
      };
      if(userRole === 'admin'){
        //fetch về backend có @requestParam userId

        endpoint = `http://192.168.1.100:8080/light/admin/newlight?userId=${currentUserId}`;
      }
      else{
        endpoint = `http://192.168.1.100:8080/light/newlight?userId=${currentUserId}`;
      }
    } else if (deviceType === 'Door') {
      data = {
        doorId: Number(deviceId),
        doorName: deviceName
        
      };
      if(userRole === 'admin'){
        //fetch về backend có @requestParam userId

        endpoint = `http://192.168.1.100:8080/door/admin/newdoor?userId=${currentUserId}`;
      }
      else{
        endpoint = `http://192.168.1.100:8080/door/newdoor?userId=${currentUserId}`;
      }
    } else if (deviceType === 'Camera') {
      data = {
        cameraId: deviceId,
        cameraName: deviceName
      };
      endpoint = 'http://192.168.1.100:8080/camera/newCamera';
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
        // setDeviceId('');
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
            <h2>{deviceType} {deviceId}</h2>
          </div>
          <div className="popup-body">
            <input 
              type="text" 
              id="deviceId" 
              placeholder="Device ID"
              value={deviceId}
              disabled
            />
            <input 
              type="text" 
              id="deviceName" 
              placeholder="Device Name"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
            />
          </div>
          <div className="popup-footer">
            <button id="cancelButton" onClick={onClose}>Cancel</button>
            <button id="doneButton" onClick={handleSubmit}>Done</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditDevicePopup; 