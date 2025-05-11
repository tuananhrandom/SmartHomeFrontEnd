import React, { useState, useEffect, forwardRef } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import { useAuth } from '../contexts/AuthContext';

import { BACKEND_URL, BACKEND_URL_WS } from '../config/api';
const NotificationPopup = forwardRef((props, ref) => {
  const { onClose, onMarkAsRead } = props;
  const [notifications, setNotifications] = useState([]);
  const {currentUser}  = useAuth();
  const currentUserId = currentUser.userId;

  // Websocket cập nhật 
  const { isConnected, lastMessage, error: wsError } = useWebSocket({
    autoConnect: true,
    events: ['notification-update']
  });
  // khi có sự kiện notification-update thì cập nhật lại danh sách đèn
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'notification-update') {
      // lấy về dữ liệu thông báo từ backend
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/notification/${currentUserId}`);
        if (response.ok) {
          const data = await response.json();
          if(data.length > 0){
           setNotifications(data);
          }
          else{
            return(
              <div>
                <h1>No lights found</h1>
              </div>
            )
          }
        }
      } catch (error) {
        console.error('Error fetching lights:', error);
      }
    };
    fetchNotifications();
    }
  }, [lastMessage]);


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/notification/${currentUserId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
          // Nếu có thông báo, đánh dấu là đã đọc
          // if (data.length > 0) {
          //   onMarkAsRead();
          // }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Thiết lập EventSource để nhận thông báo mới
    const notificationEventSource = new EventSource(`${BACKEND_URL_WS}/notification/stream`);
    
    notificationEventSource.addEventListener('notification-update', (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
    });

    notificationEventSource.addEventListener('notification-delete', (event) => {
      const deleteNotification = JSON.parse(event.data);
      setNotifications(prev => 
        prev.filter(notification => notification.notificationId !== deleteNotification.notificationId)
      );
    });

    notificationEventSource.addEventListener('notification-delete-all', () => {
      setNotifications([]);
    });

    return () => {
      notificationEventSource.close();
    };
  }, [currentUserId]);

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/notification/delete/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notification => notification.notificationId !== notificationId)
        );
      } else {
        console.error('Error deleting notification');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (window.confirm("Are you sure?")) {
      try {
        const response = await fetch(`/notification/delete/all`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setNotifications([]);
        } else {
          console.error('Error deleting all notifications');
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    }
  };

  return (
    <div className="notification-popup" ref={ref}>
      <div className="header">
        <h2>Notifications</h2>
        <button id="notification-delete-all" className="delete-btn delete-all" onClick={handleDeleteAllNotifications}>
          Delete All
        </button>
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">No notifications</div>
        ) : (
          notifications.map(notification => (
            <div 
              className="notification-item" 
              key={notification.notificationId} 
              data-id={`notification-${notification.notificationId}`}
            >
            <div className="image-placeholder">
              <img 
                className="notification-image" 
                src={(() => {
                  const typeImageMap = {
                    'LIGHT': '/light.png',
                    'DOOR': '/door.png',
                    'CAMERA': '/camera.png'
                  };
                  
                  return typeImageMap[notification.notificationType] || notification.notificationImage || '/light.png';
                })()} 
                alt={`${notification.notificationType || 'Notification'}`} 
              />
            </div>
              <div className="notification-content">
                <p className="notification-title">{notification.notificationTitle}</p>
                <p className="notification-text">
                  {notification.notificationContent} - {notification.timeCreate}- {notification.dateCreate}
                </p>
              </div>
              <button 
                className="delete-btn" 
                onClick={() => handleDeleteNotification(notification.notificationId)}
              >
                ✖
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default NotificationPopup; 