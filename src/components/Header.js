import React, { useState, useEffect, useRef } from 'react';
import NotificationPopup from './NotificationPopup';
import UserDetail from './UserDetail';
import { useAuth } from '../contexts/AuthContext';
import useWebSocket from '../hooks/useWebSocket';
import EditUserInfo from './EditUserInfo';
import ChangePassword from './ChangePassword';
import { BACKEND_URL } from '../config/api';
import { registerPushNotification, unregisterPushNotification } from '../services/pushNotificationService';

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

  // Thêm state để theo dõi trạng thái đăng ký thông báo
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Tự động đăng ký thông báo khi component mount
  useEffect(() => {
    const autoRegisterPush = async () => {
      try {
        console.log('Bắt đầu kiểm tra đăng ký thông báo...');
        
        // Kiểm tra xem service worker có được hỗ trợ không
        if (!('serviceWorker' in navigator)) {
          console.error('Service Worker không được hỗ trợ');
          return;
        }

        if (!('PushManager' in window)) {
          console.error('Push API không được hỗ trợ');
          return;
        }

        // Kiểm tra quyền thông báo
        const permission = await Notification.permission;
        console.log('Trạng thái quyền thông báo:', permission);

        if (permission === 'denied') {
          console.error('Quyền thông báo bị từ chối');
          return;
        }

        // Đăng ký service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker đã đăng ký:', registration);

        // Kiểm tra subscription hiện tại
        const subscription = await registration.pushManager.getSubscription();
        console.log('Subscription hiện tại:', subscription);
        
        // Nếu chưa đăng ký, thực hiện đăng ký
        if (!subscription) {
          console.log('Bắt đầu đăng ký thông báo tự động...');
          await registerPushNotification();
          console.log('Đăng ký thông báo thành công');
        } else {
          console.log('Đã có subscription, không cần đăng ký lại');
        }
      } catch (error) {
        console.error('Lỗi khi đăng ký thông báo tự động:', error);
      }
    };

    // Chỉ thực hiện khi đã đăng nhập
    if (currentUser) {
      console.log('Người dùng đã đăng nhập, bắt đầu kiểm tra đăng ký thông báo');
      autoRegisterPush();
    }
  }, [currentUser]);

  // xử lý khi có thông báo mới
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

  // Kiểm tra trạng thái subscription khi component mount
  useEffect(() => {
    const checkPushSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsPushEnabled(!!subscription);
      } catch (error) {
        console.error('Error checking push subscription:', error);
        setIsPushEnabled(false);
      }
    };

    checkPushSubscription();
  }, []);

  // Hàm xử lý đăng ký/hủy đăng ký thông báo
  const handlePushToggle = async () => {
    try {
      setIsLoading(true);
      if (isPushEnabled) {
        await unregisterPushNotification();
        setIsPushEnabled(false);
      } else {
        const subscription = await registerPushNotification();
        if (subscription) {
          setIsPushEnabled(true);
        } else {
          setIsPushEnabled(false);
        }
      }
    } catch (error) {
      console.error('Error toggling push notification:', error);
      // Kiểm tra lại trạng thái thực tế của subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsPushEnabled(!!subscription);
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* <button 
          className={`push-toggle ${isPushEnabled ? 'enabled' : ''}`}
          onClick={handlePushToggle}
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : (isPushEnabled ? 'Tắt thông báo' : 'Bật thông báo')}
        </button> */}
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