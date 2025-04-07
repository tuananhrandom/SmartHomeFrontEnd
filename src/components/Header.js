import React, { useState, useEffect, useRef } from 'react';
import NotificationPopup from './NotificationPopup';
import UserDetail from './UserDetail';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

import EditUserInfo from './EditUserInfo';
import ChangePassword from './ChangePassword';

function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const bellRef = useRef(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showEditInfo, setShowEditInfo] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const toggleNotificationPopup = () => {
    setShowNotifications(!showNotifications);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    }
  };

  const handleUserDetail = () => {
    setShowUserDetail(true);
  };

  const handleEditInfo = () => {
    setShowUserDetail(false);
    setShowEditInfo(true);
  };

  const handleChangePassword = () => {
    setShowUserDetail(false);
    setShowChangePassword(true);
  };

  const handleUpdateUserInfo = async (formData) => {
    try {
      // Gọi API cập nhật thông tin người dùng
      const response = await fetch('http://192.168.1.100:8080/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Có lỗi xảy ra khi cập nhật thông tin');
      }

      // Cập nhật thông tin người dùng trong context
      const updatedUser = await response.json();
      // TODO: Cập nhật currentUser trong AuthContext
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handlePasswordChange = async (formData) => {
    try {
      // Gọi API đổi mật khẩu
      const response = await fetch('http://192.168.1.100:8080/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Có lỗi xảy ra khi đổi mật khẩu');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current && 
        !notificationRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <h1>My Smart Home</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <span className="username">{currentUser?.username}</span>
          <img className="user" src="user-profile.png" alt="User Profile" onClick={handleUserDetail} />
          <button className="logout-button" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
        <div className="notification" ref={bellRef} onClick={toggleNotificationPopup}>
          <span className="bell"></span>
          <span className="dot"></span>
        </div>
      </div>

      {/* Modal UserDetail */}
      <UserDetail 
        isOpen={showUserDetail}
        onClose={() => setShowUserDetail(false)}
        onEditInfo={handleEditInfo}
        onChangePassword={handleChangePassword}
      />

      {/* Modal EditUserInfo */}
      <EditUserInfo 
        isOpen={showEditInfo}
        onClose={() => setShowEditInfo(false)}
        onSave={handleUpdateUserInfo}
      />

      {/* Modal ChangePassword */}
      <ChangePassword 
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onChangePassword={handlePasswordChange}
      />


      {showNotifications && (
        <NotificationPopup ref={notificationRef} />
      )}
    </header>
  );
}

export default Header; 