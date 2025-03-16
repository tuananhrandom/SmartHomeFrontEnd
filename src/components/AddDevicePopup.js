import React, { useState } from 'react';

function AddDevicePopup({ isOpen, onClose, deviceTypes, onAddDevice }) {
  const [deviceType, setDeviceType] = useState(deviceTypes[0] || 'Light');
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');

  const handleSubmit = async () => {
    if (!deviceId || !deviceName) {
      alert('Please fill in all fields');
      return;
    }

    let data = {};
    let endpoint = '';

    if (deviceType === 'Light') {
      data = {
        lightId: deviceId,
        lightName: deviceName
      };
      endpoint = 'http://localhost:8080/light/newLight';
    } else if (deviceType === 'Door') {
      data = {
        doorId: deviceId,
        doorName: deviceName
      };
      endpoint = 'http://localhost:8080/door/newDoor';
    } else if (deviceType === 'Camera') {
      data = {
        cameraId: deviceId,
        cameraName: deviceName
      };
      endpoint = 'http://localhost:8080/camera/newCamera';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
            <input 
              type="text" 
              id="deviceId" 
              placeholder="Device ID"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
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

export default AddDevicePopup; 