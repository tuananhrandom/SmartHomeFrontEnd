import React, { useState, useEffect, useRef } from 'react';
import NotificationPopup from './NotificationPopup';
import UserDetail from './UserDetail';
import { useAuth } from '../contexts/AuthContext';
import useWebSocket from '../hooks/useWebSocket';
import EditUserInfo from './EditUserInfo';
import ChangePassword from './ChangePassword';
import { BACKEND_URL } from '../config/api';

function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const bellRef = useRef(null);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showEditInfo, setShowEditInfo] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.userId;
  console.log(currentUser);

  // Thêm useEffect để kiểm tra và rung chuông khi có thông báo mới
  useEffect(() => {
    if (hasNewNotifications) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasNewNotifications]);

  // xử lý khi có thông báo mới
  // Lắng nghe sự kiện thông báo mới từ WebSocket
  const { lastMessage } = useWebSocket({
    autoConnect: true,
    events: ['notification-update']
  });

  // Khi có thông báo mới, đặt hasNewNotifications = true
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'notification-update') {
      setHasNewNotifications(true);
    }
  }, [lastMessage]);

  const toggleNotificationPopup = async () => {
    if (!showNotifications) {
      // Khi mở popup, gọi API đánh dấu tất cả thông báo đã đọc
      try {
        const response = await fetch(`${BACKEND_URL}/notification/mark-all-read/${currentUserId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          setHasNewNotifications(false);
        }
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
    setShowNotifications(!showNotifications);
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
      const response = await fetch(`${BACKEND_URL}/auth/profile`, {
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
      const response = await fetch(`${BACKEND_URL}/auth/change-password`, {
        method: 'POST',
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

  // Thêm hàm kiểm tra thông báo chưa đọc
  const checkUnreadNotifications = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/notification/unread/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHasNewNotifications(data.hasUnread);
      }
    } catch (error) {
      console.error('Error checking unread notifications:', error);
    }
  };

  // Kiểm tra thông báo chưa đọc khi component mount
  useEffect(() => {
    if (currentUserId) {
      checkUnreadNotifications();
    }
  }, [currentUserId]);

  // Thêm hàm xử lý khi đóng popup thông báo
  const handleCloseNotifications = () => {
    setShowNotifications(false);
    // Cập nhật lại trạng thái thông báo chưa đọc
    checkUnreadNotifications();
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
        <h1>Chào Mừng, {currentUser.username}! 🥰</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <img className="user" src="user-profile.png" alt="User Profile" onClick={handleUserDetail} />
        </div>
        <div className="notification" ref={bellRef} onClick={toggleNotificationPopup}>
          <img src='bell.png' alt='Bell' className={isShaking ? 'shake' : ''}/>
          {hasNewNotifications && <span className="dot"></span>}
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
      />

      {/* Modal ChangePassword */}
      <ChangePassword 
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onChangePassword={handlePasswordChange}
      />

      {showNotifications && (
        <NotificationPopup 
          ref={notificationRef} 
          onClose={handleCloseNotifications}
          onMarkAsRead={() => setHasNewNotifications(false)}
        />
      )}
    </header>
  );
}

export default Header; 