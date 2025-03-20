import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/userDetail.css';

function UserDetail({ isOpen, onClose }) {
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Thông tin người dùng</h2>
          <button className="close-button" onClick={onClose}>✖</button>
        </div>
        <div className="modal-body">
          <div className="user-info">
            <div className="info-group">
              <label>Tên đăng nhập:</label>
              <span>{currentUser?.username}</span>
            </div>
            <div className="info-group">
              <label>Email:</label>
              <span>{currentUser?.email}</span>
            </div>
            <div className="info-group">
              <label>Họ tên:</label>
              <span>{currentUser?.fullName}</span>
            </div>
            <div className="info-group">
              <label>Ngày tạo tài khoản:</label>
              <span>{new Date(currentUser?.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="info-group">
              <label>Vai trò:</label>
              <span>{currentUser?.role}</span>
            </div>
          </div>
          <div className="user-stats">
            <h3>Thống kê</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{currentUser?.deviceCount || 0}</span>
                <span className="stat-label">Thiết bị</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{currentUser?.lightCount || 0}</span>
                <span className="stat-label">Đèn</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{currentUser?.doorCount || 0}</span>
                <span className="stat-label">Cửa</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{currentUser?.cameraCount || 0}</span>
                <span className="stat-label">Camera</span>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="edit-button" onClick={() => {/* Xử lý chỉnh sửa thông tin */}}>
            Chỉnh sửa thông tin
          </button>
          <button className="change-password-button" onClick={() => {/* Xử lý đổi mật khẩu */}}>
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </>
  );
}

export default UserDetail; 