import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/editUserInfo.css';
import axios from 'axios';
import { BACKEND_URL } from '../config/api';
function EditUserInfo({ isOpen, onClose, onSave }) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Gọi API cập nhật thông tin tài khoản
      console.log('Đang gửi yêu cầu cập nhật với dữ liệu:', formData);
      const response = await axios.put(`${BACKEND_URL}/api/auth/profile`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Log phản hồi từ server để debug
      console.log('Phản hồi từ server:', response);
      
      // Kiểm tra xem phản hồi có thành công không
      if (response && response.status === 200) {
        console.log('Cập nhật thành công:', response.data);
        // Cập nhật thông tin người dùng trong context
        if (onSave) {
          await onSave(response.data);
        }
        onClose();
      } else {
        console.warn('Phản hồi không như mong đợi:', response);
        setError('Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (error) {
      console.error('Lỗi cập nhật thông tin:', error);
      
      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error('Dữ liệu phản hồi lỗi:', error.response.data);
        console.error('Mã trạng thái:', error.response.status);
        console.error('Headers:', error.response.headers);
        
        // Xử lý lỗi validation từ server
        if (error.response.data) {
          if (typeof error.response.data === 'object') {
            const errorMessages = Object.values(error.response.data).join(', ');
            setError(errorMessages);
          } else {
            setError(error.response.data);
          }
        } else {
          setError('Có lỗi xảy ra khi cập nhật thông tin');
        }
      } else if (error.request) {
        // Yêu cầu đã được gửi nhưng không nhận được phản hồi
        console.error('Không nhận được phản hồi:', error.request);
        setError('Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        // Có lỗi khi thiết lập yêu cầu
        console.error('Lỗi:', error.message);
        setError('Có lỗi xảy ra: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        <div className="edit-modal-header">
          <h2>Chỉnh sửa thông tin</h2>
          <button className="close-button" onClick={onClose}>✖</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group-editdetail">
            <label>Họ tên:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group-editdetail">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserInfo; 