import React, { useState, useEffect, useRef } from 'react';
import NotificationPopup from './NotificationPopup';

function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const bellRef = useRef(null);

  const toggleNotificationPopup = () => {
    setShowNotifications(!showNotifications);
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
      <h1>Smart Home Manager</h1>
      <div className="header-right">
        <div className="user-wrap">
          <img className="user" src="/picture/user-profile.png" alt="User Profile" />
        </div>
        <div className="notification" ref={bellRef} onClick={toggleNotificationPopup}>
          <span className="bell"></span>
          <span className="dot"></span>
        </div>
        {showNotifications && (
          <NotificationPopup ref={notificationRef} />
        )}
      </div>
    </header>
  );
}

export default Header; 