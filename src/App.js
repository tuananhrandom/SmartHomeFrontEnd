import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/homepage.css';
import './styles/notification-popup.css';
import Header from './components/Header';
import DeviceSelector from './components/DeviceSelector';
import DeviceTable from './components/DeviceTable';
import AddDevicePopup from './components/AddDevicePopup';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

// Bảo vệ route yêu cầu đăng nhập
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Đang tải...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Component Dashboard chứa nội dung chính của ứng dụng
const Dashboard = () => {
  const [selectedDevice, setSelectedDevice] = useState('Light');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const deviceTypes = ['Light', 'Door', 'Camera'];
  const [setCurrentDeviceType, currentDeviceType] = useState('')

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
};

// Định nghĩa AppRoutes bên trong AuthProvider
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" />} />
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
