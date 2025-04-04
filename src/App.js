import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/homepage.css';
import './styles/notification-popup.css';
import './styles/popup.css';
import Header from './components/Header';
import DeviceSelector from './components/DeviceSelector';
import DeviceTable from './components/DeviceTable';
import AddDevicePopup from './components/AddDevicePopup';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

// Component Dashboard chứa nội dung chính của ứng dụng
const Dashboard = () => {
  const [selectedDevice, setSelectedDevice] = useState('Light');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const deviceTypes = ['Light', 'Door', 'Camera'];
  const [currentDeviceType, setCurrentDeviceType] = useState('Light');

  const handleDeviceChange = (device) => {
    setSelectedDevice(device);
    setCurrentDeviceType(device);
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
        currentDeviceType={currentDeviceType}
      />
    </div>
  );
};

// Component chứa các routes
const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          currentUser ? (
            <Dashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/admin"
        element={
          currentUser?.role === 'ADMIN' ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/dashboard" />
          )
        }
      />
      <Route
        path="/"
        element={
          currentUser ? (
            <Navigate to={currentUser.role === 'ADMIN' ? '/admin' : '/dashboard'} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
