import React, { useState, useEffect } from "react";
import "../styles/homepage.css";
import Header from "./Header";
import DeviceSelector from "./DeviceSelector";
import Footer from "./Footer";
import { useAuth } from "../contexts/AuthContext";
import AddDevicePopup from "./AddDevicePopup";
import DateRangePopup from "./DateRangePopup";
import UserDetail from "./UserDetail";
import { BACKEND_URL } from "../config/api";

const AdminDashboard = () => {
  const [selectedDevice, setSelectedDevice] = useState("Light");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deviceTypes = ["Light", "Door", "Camera", "User"];
  const [devices, setDevices] = useState({
    lights: [],
    doors: [],
    cameras: [],
    users: []
  });
  const { currentUser } = useAuth();
  const [currentDeviceType, setCurrentDeviceType] = useState('Light');
  const [isDatePopupOpen, setIsDatePopupOpen] = useState(false);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const handleAddDevice = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleDeviceAdded = (deviceType) => {
    setSelectedDevice(deviceType);
  };

  useEffect(() => {
    fetchAllDevices();
    if (selectedDevice === "User") {
      fetchAllUsers();
    }
  }, [selectedDevice]);

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

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setDevices(prev => ({ ...prev, users: data }));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleDeviceChange = (device) => {
    setSelectedDevice(device);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      if (selectedDevice === "User") {
        fetchAllUsers();
      } else {
        fetchAllDevices();
      }
      return;
    }

    try {
      console.log('AdminDashboard - Received query:', query);
      
      // Xử lý tìm kiếm user
      if (selectedDevice === "User") {
        const response = await fetch(`${BACKEND_URL}/auth/admin/${query}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setDevices(prev => ({
          ...prev,
          users: Array.isArray(data) ? data : [data]
        }));
        return;
      }
      
      // Kiểm tra nếu query có dạng "yyyy-MM-ddThh:mm:ss-yyyy-MM-ddThh:mm:ss" (tìm theo khoảng ngày)
      if (query.includes("T")) {
        console.log('Processing date range search');
        
        // Tách chuỗi thành ngày bắt đầu và kết thúc
        const rawStart = query.substring(0, 10);              // "2025-05-19"
        const rawEnd = query.substring(20, 30);               // "2025-05-21"

        // Hàm chuyển định dạng yyyy-MM-DD → MM/dd/yyyy
        function formatDate(isoDate) {
          const [year, month, day] = isoDate.split("-");
          return `${month}/${day}/${year}`;
        }

        // Chuyển định dạng
        const start = formatDate(rawStart); // "05/19/2025"
        const end = formatDate(rawEnd);     // "05/21/2025"
        console.log("start:"+start);
        console.log("end:"+end)
        const encodedStart = encodeURIComponent(start); // "05%2F19%2F2025"
        const encodedEnd = encodeURIComponent(end);     // "05%2F21%2F2025"
        
        const url = `${BACKEND_URL}/${selectedDevice.toLowerCase()}/daterange?startDate=${encodedStart}&endDate=${encodedEnd}`;
        console.log('Request URL:', url);
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        console.log('Search results:', data);
        setDevices(prev => ({
          ...prev,
          [selectedDevice.toLowerCase() + 's']: Array.isArray(data) ? data : [data]
        }));
      }
      // Kiểm tra nếu query có dạng "1-10" (tìm theo ID)
      else if (query.includes("-") && !query.includes("/")) {
        const [start, end] = query.split("-").map(Number);
        if (isNaN(start) || isNaN(end)) {
          console.error("Invalid range format");
          return;
        }
        
        // Fetch theo khoảng ID
        const response = await fetch(`${BACKEND_URL}/${selectedDevice.toLowerCase()}/range/${start}/${end}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setDevices(prev => ({
          ...prev,
          [selectedDevice.toLowerCase() + 's']: Array.isArray(data) ? data : [data]
        }));
      }
      // Tìm theo ID cụ thể
      else {
        const response = await fetch(`${BACKEND_URL}/${selectedDevice.toLowerCase()}/find/${Number(query)}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setDevices(prev => ({
          ...prev,
          [selectedDevice.toLowerCase() + 's']: Array.isArray(data) ? data : [data]
        }));
      }
    } catch (error) {
      console.error("Error searching devices:", error);
    }
  };

  const handleDeleteDevice = async (deviceType, deviceId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/${deviceType}/admin/delete/${deviceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        // Cập nhật lại danh sách thiết bị sau khi xóa
        fetchAllDevices();
      } else {
        console.error("Error deleting device");
      }
    } catch (error) {
      console.error("Error deleting device:", error);
    }
  };

  const handleViewUserDetail = (userId, deviceType, deviceId) => {
    setSelectedUserId(userId);
    setSelectedDeviceType(deviceType);
    setSelectedDeviceId(deviceId);
    setIsUserDetailOpen(true);
  };

  const handleCloseUserDetail = () => {
    setIsUserDetailOpen(false);
    setSelectedUserId(null);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/admin/${userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          fetchAllUsers();
        } else {
          console.error("Error deleting user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleAddUserToDevice = async (deviceType, deviceId) => {
    const userId = prompt("Nhập ID người dùng muốn thêm vào thiết bị:");
    if (!userId) return;
    console.log(userId);
    console.log(deviceId);

    try {
      const response = await fetch(`${BACKEND_URL}/${deviceType.toLowerCase()}/admin/add-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          deviceId: deviceId,
          userId: Number(userId)
        })
      });
      

      if (response.ok) {
        fetchAllDevices();
      } else {
        alert("Không thể thêm người dùng vào thiết bị");
      }
    } catch (error) {
      console.error("Error adding user to device:", error);
      alert("Có lỗi xảy ra khi thêm người dùng");
    }
  };

  const renderDeviceTable = () => {
    switch (selectedDevice) {
      case "User":
        return (
          <div>
            {devices.users.map((user) => (
              <div 
                className="row"
                key={`user-${user.userId}`}
                data-id={`user-${user.userId}`}
              >
                <div className="cell image">
                  <img src="user-profile.png" alt="User" />
                </div>
                <div className="cell">
                  ID: {user.userId}
                </div>
                <div className="cell">
                  Username: {user.username}
                </div>
                <div className="cell">
                  Email: {user.email}
                </div>
                <div className="cell">
                  Full Name: {user.fullName}
                </div>
                <div className="cell">
                  Role: {user.role}
                </div>
                <div className="cell">
                  Created: {user.dateCreate}
                </div>
                <div className="cell action">
                  <button 
                    className="action-button"
                    onClick={() => handleViewUserDetail(user.userId)}
                  >
                    <img src="info.png" alt="Info" />
                  </button>
                  {user.role !== "ADMIN" && (
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteUser(user.userId)}
                  >
                    ✖
                  </button>
                )}
                </div>
              </div>
            ))}
          </div>
        );
      case "Light":
        return (
          <div>
            {devices.lights.map((light) => (
              <div 
                className="row"
                key={`light-${light.lightId}`}
                data-id={`light-${light.lightId}`}
              >
                <div id="light-image" className="cell image">
                  <img src="light.png" alt="Light" />
                </div>
                <div id="light-id" className="cell">
                  ID: {light.lightId}
                </div>
                <div className="cell owner">
                  OwnerId: {light.ownerId != null ? `${light.ownerId}` : "None"}
                  
                {light.ownerId ? (
                    <button 
                      className="view-owner-button"
                      onClick={() => handleViewUserDetail(light.ownerId, 'light', light.lightId)}
                    >
                      <img src="info.png" alt="User" />
                    </button>
                  ) : (
                    <button 
                      className="add-user-button"
                      onClick={() => handleAddUserToDevice('light', light.lightId)}
                    >
                      <img src="add-user.png" alt="Add User" />
                    </button>
                  )}
                
                </div>
                <div id="light-status" className="cell status">
                  Created Date: {light.dateCreate}
                </div>
                <div id="light-delete" className="cell delete">

                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteDevice('light', light.lightId)}
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
                key={`door-${door.doorId}`}
                data-id={`door-${door.doorId}`}
              >
                <div id="door-image" className="cell image">
                  <img src="door.png" alt="Door" />
                </div>
                <div id="door-id" className="cell">
                  ID: {door.doorId}
                </div>
                <div className="cell owner">
                  OwnerId: {door.ownerId != null ? `${door.ownerId}` : "None"}
                {door.ownerId ? (
                    <button 
                      className="view-owner-button"
                      onClick={() => handleViewUserDetail(door.ownerId, 'door', door.doorId)}
                    >
                      <img src="info.png" alt="User" />
                    </button>
                  ) : (
                    <button 
                      className="add-user-button"
                      onClick={() => handleAddUserToDevice('door', door.doorId)}
                    >
                      <img src="add-user.png" alt="Add User" />
                    </button>
                  )}
                </div>
                <div id="door-status" className="cell status">
                  Created Date: {door.dateCreate}
                </div>

                <div id="door-delete" className="cell delete">
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteDevice('door', door.doorId)}
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
                key={`camera-${camera.cameraId}`}
                data-id={`camera-${camera.cameraId}`}
              >
                <div id="camera-image" className="cell image">
                  <img src="camera.png" alt="Camera" />
                </div>
                <div id="camera-id" className="cell">
                  ID: {camera.cameraId}
                </div>
                <div className="cell owner">
                  OwnerId: {camera.ownerId != null ? `${camera.ownerId}` : "None"}
                  {camera.ownerId ? (
                    <button 
                      className="view-owner-button"
                      onClick={() => handleViewUserDetail(camera.ownerId, 'camera', camera.cameraId)}
                    >
                      <img src="info.png" alt="User" />
                    </button>
                  ) : (
                    <button 
                      className="add-user-button"
                      onClick={() => handleAddUserToDevice('camera', camera.cameraId)}
                    >
                      <img src="add-user.png" alt="Add User" />
                    </button>
                  )}
                </div>
                <div id="camera-status" className="cell status">
                  Created Date: {camera.dateCreate}
                </div>
                <div id="camera-delete" className="cell delete">
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteDevice('camera', camera.cameraId)}
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
            <div className="search-group">
              <input 
                className="finder" 
                placeholder={selectedDevice === "User" ? "Search By Id" : "ID (e.g. 1 or 1-10)"}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {selectedDevice !== "User" && (
                <button 
                  className="action-button date-search-button"
                  onClick={() => setIsDatePopupOpen(true)}
                >
                  <img src="calendars.png" alt="Calendar" />
                </button>
              )}
            </div>
            {selectedDevice !== "User" && (
              <div>
                <button className="add-button" onClick={handleAddDevice}>Add</button>
              </div>
            )}
          </div>
          <div className="device-list">{renderDeviceTable()}</div>
        </div>
      </div>
      <Footer />
      <AddDevicePopup 
        isOpen={isPopupOpen} 
        onClose={handleClosePopup} 
        deviceTypes={deviceTypes.filter(type => type !== "User")}
        onAddDevice={handleDeviceAdded}
        currentDeviceType={currentDeviceType}
      />
      <DateRangePopup
        isOpen={isDatePopupOpen}
        onClose={() => setIsDatePopupOpen(false)}
        onSearch={handleSearch}
      />
      <UserDetail
        isOpen={isUserDetailOpen}
        onClose={handleCloseUserDetail}
        userId={selectedUserId}
        onUserRemoved={() => {
          fetchAllDevices();
          fetchAllUsers();
        }}
        selectedDeviceType={selectedDeviceType}
        deviceId={selectedDeviceId}
      />
    </div>
  );
};

export default AdminDashboard;
