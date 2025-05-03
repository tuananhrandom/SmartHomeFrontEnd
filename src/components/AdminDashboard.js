import React, { useState, useEffect } from "react";
import "../styles/homepage.css";
import Header from "./Header";
import DeviceSelector from "./DeviceSelector";
import Footer from "./Footer";
import { useAuth } from "../contexts/AuthContext";
import AddDevicePopup from "./AddDevicePopup";

const AdminDashboard = () => {
  const [selectedDevice, setSelectedDevice] = useState("Light");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const deviceTypes = ["Light", "Door", "Camera"];
  const [devices, setDevices] = useState({
    lights: [],
    doors: [],
    cameras: [],
  });
  const { currentUser } = useAuth();
    const [currentDeviceType, setCurrentDeviceType] = useState('Light');
    const handleAddDevice = () => {
        setIsPopupOpen(true);
    }
    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };
    const handleDeviceAdded = (deviceType) => {
        setSelectedDevice(deviceType);
      };

  useEffect(() => {
    fetchAllDevices();
  }, []);

  useEffect(() => {
    setCurrentDeviceType(selectedDevice);
  }, [selectedDevice]);

  const fetchAllDevices = async () => {
    try {
      // Fetch lights
      const lightsResponse = await fetch(`${BACKEND_URL}/light/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const lightsData = await lightsResponse.json();
      setDevices((prev) => ({ ...prev, lights: lightsData }));

      // Fetch doors
      const doorsResponse = await fetch(`${BACKEND_URL}/door/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const doorsData = await doorsResponse.json();
      setDevices((prev) => ({ ...prev, doors: doorsData }));

      // Fetch cameras
      const camerasResponse = await fetch(`${BACKEND_URL}/camera/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const camerasData = await camerasResponse.json();
      setDevices((prev) => ({ ...prev, cameras: camerasData }));
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const handleDeviceChange = (device) => {
    setSelectedDevice(device);
  };

  const renderDeviceTable = () => {
    switch (selectedDevice) {
      case "Light":
        return (
          <div>
            {devices.lights.map((light) => (
              <div 
                className="row"
                key={light.lightId}
                data-id={`light-${light.lightId}`}
              >
                <div id="light-image" className="cell image">
                  <img src="light.png" alt="Light" />
                </div>
                <div id="light-id" className="cell">
                  ID: {light.lightId}
                </div>
                <div className="cell ip">
                  OwnerId: {light.ownerId != null && `: ${light.ownerId}`}
                </div>
                <div id="light-status" className="cell status">
                  Status:
                  {light.ownerId != null && <span className="status-off"> Activated</span>}
                  {light.ownerId === null && <span className="status-on"> Inactive</span>}    
                </div>
                <div id="light-delete" className="cell delete">
                  <button 
                    className="delete-button"
                    //onClick={() => handleDeleteLight(light.lightId)}
                  >
                    ✖
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      case "Door":
        return (
          <div>
            {devices.doors.map((door) => (
              <div 
                className="row"
                key={door.doorId}
                data-id={`door-${door.doorId}`}
              >
                <div id="door-image" className="cell image">
                  <img src="door.png" alt="Door" />
                </div>
                <div id="door-id" className="cell">
                  ID: {door.doorId}
                </div>
                <div className="cell ip">
                  OwnerId: {door.ownerId != null && `: ${door.ownerId}`}
                </div>
                <div id="door-status" className="cell status">
                  Status:
                  {door.ownerId != null && <span className="status-off"> Activated</span>}
                  {door.ownerId === null && <span className="status-on"> Inactive</span>}    
                </div>
                <div id="door-delete" className="cell delete">
                  <button 
                    className="delete-button"
                    //onClick={() => handleDeleteLight(light.lightId)}
                  >
                    ✖
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      case "Camera":
        return (
            <div>
              {devices.cameras.map((camera) => (
                <div 
                  className="row"
                  key={camera.camearId}
                  data-id={`camera-${camera.cameraId}`}
                >
                  <div id="camera-image" className="cell image">
                    <img src="camera.png" alt="Door" />
                  </div>
                  <div id="camera-id" className="cell">
                    ID: {camera.cameraId}
                  </div>
                  <div className="cell ip">
                    OwnerId: {camera.ownerId != null && `: ${camera.ownerId}`}
                  </div>
                  <div id="door-status" className="cell status">
                    Status:
                    {camera.ownerId != null && <span className="status-off"> Activated</span>}
                    {camera.ownerId === null && <span className="status-on"> Inactive</span>}    
                  </div>
                  <div id="camera-delete" className="cell delete">
                    <button 
                      className="delete-button"
                      //onClick={() => handleDeleteLight(light.lightId)}
                    >
                      ✖
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
      default:
        return null;
    }
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
                          <input className="finder" placeholder="ID"></input>
                      </div>          
            <div>
              <button className="add-button" onClick={handleAddDevice}>Add</button>
            </div>
          </div>
          <div className="device-list">{renderDeviceTable()}</div>
        </div>
      </div>
      <Footer />
      <AddDevicePopup 
        isOpen={isPopupOpen} 
        onClose={handleClosePopup} 
        deviceTypes={deviceTypes}
        onAddDevice={handleDeviceAdded}
        currentDeviceType={currentDeviceType}
      />
    </div>
  );
};

export default AdminDashboard;
