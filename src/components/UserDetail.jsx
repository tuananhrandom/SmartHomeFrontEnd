import React, { useState, useEffect } from 'react';
import '../styles/userDetail.css';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
function UserDetail({ isOpen, onClose, onEditInfo, onChangePassword }) {
  const navigate = useNavigate();
  const{currentUser, logout} = useAuth();
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    totalScenes: 0
  });
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://192.168.1.100:8080/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Không thể lấy thông tin người dùng');
        }
        const data = await response.json();
        console.log(data);
        setUserData(data);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    };

    // const fetchUserStats = async () => {
    //   try {
    //     const response = await fetch('http://192.168.1.100:8080/api/users/stats', {
    //       headers: {
    //         'Authorization': `Bearer ${localStorage.getItem('token')}`
    //       }
    //     });
    //     if (!response.ok) {
    //       throw new Error('Không thể lấy thống kê người dùng');
    //     }
    //     const data = await response.json();
    //     setUserStats(data);
    //   } catch (error) {
    //     console.error('Lỗi khi lấy thống kê:', error);
    //   }
    // };

    if (isOpen) {
      fetchUserData();
      // fetchUserStats();
    }
  }, [isOpen]);

  if (!isOpen || !userData) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Thông tin người dùng</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="user-info-inside">
            <div className="info-group">
              <label>Tên đăng nhập:</label>
              <span>{userData.username}</span>
            </div>
            <div className="info-group">
              <label>Email:</label>
              <span>{userData.email}</span>
            </div>
            <div className="info-group">
              <label>Họ và tên:</label>
              <span>{userData.fullName}</span>
            </div>
            <div className="info-group">
              <label>Ngày tạo tài khoản:</label>
              <span>{userData.dateCreate}</span>
            </div>
            {/* <div className="info-group">
              <label>Vai trò:</label>
              <span>{userData.role}</span>
            </div> */}
          </div>
          <div className="user-stats">
            <h3>Thống kê</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{userData.lights.length+userData.doors.length+userData.cameras.length}</span>
                <span className="stat-label">Tổng thiết bị</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userData.lights.length}</span>
                <span className="stat-label">Đèn</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userData.doors.length}</span>
                <span className="stat-label">Cửa</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userData.cameras.length}</span>
                <span className="stat-label">Camera</span>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="edit-button" onClick={onEditInfo}>
            Chỉnh sửa thông tin
          </button>
          <button className="change-password-button" onClick={onChangePassword}>
            Đổi mật khẩu
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDetail; 