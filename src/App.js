import React, { useState } from 'react';
import './styles/homepage.css';
import './styles/notification-popup.css';
import Header from './components/Header';
import DeviceSelector from './components/DeviceSelector';
import DeviceTable from './components/DeviceTable';
import AddDevicePopup from './components/AddDevicePopup';
import Footer from './components/Footer';

function App() {
  const [selectedDevice, setSelectedDevice] = useState('Light');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const deviceTypes = ['Light', 'Door', 'Camera'];

  const handleDeviceChange = (device) => {
    setSelectedDevice(device);
  };

  const handleAddDevice = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleDeviceAdded = (deviceType) => {
    setSelectedDevice(deviceType);
  };

  return (
    <div>
      <div className="container">
        <Header />
        <div className="content">
          <div className="toolbar">
            <DeviceSelector 
              selectedDevice={selectedDevice} 
              onDeviceChange={handleDeviceChange}
              deviceTypes={deviceTypes}
            />
            <div>
              <button className="add-button" onClick={handleAddDevice}>Add</button>
            </div>
          </div>
          <DeviceTable selectedDevice={selectedDevice} />
        </div>
      </div>
      <Footer />
      <AddDevicePopup 
        isOpen={isPopupOpen} 
        onClose={handleClosePopup} 
        deviceTypes={deviceTypes}
        onAddDevice={handleDeviceAdded}
      />
    </div>
  );
}

export default App;
