import React from 'react';

function DeviceSelector({ selectedDevice, onDeviceChange, deviceTypes }) {
  return (
    <div className="dropdown">
      <select 
        id="deviceSelector" 
        className="dropdown-button"
        value={selectedDevice}
        onChange={(e) => onDeviceChange(e.target.value)}
      >
        {deviceTypes.map((device, index) => (
          <option key={index} value={device}>
            {device}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DeviceSelector; 