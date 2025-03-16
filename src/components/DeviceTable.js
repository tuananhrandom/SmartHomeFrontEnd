import React from 'react';
import LightTable from './LightTable';
import DoorTable from './DoorTable';
import CameraTable from './CameraTable';

function DeviceTable({ selectedDevice }) {
  const renderTable = () => {
    switch (selectedDevice) {
      case 'Light':
        return <LightTable />;
      case 'Door':
        return <DoorTable />;
      case 'Camera':
        return <CameraTable />;
      default:
        return <div>Select a device type</div>;
    }
  };

  return (
    <div className="table">
      {renderTable()}
    </div>
  );
}

export default DeviceTable; 