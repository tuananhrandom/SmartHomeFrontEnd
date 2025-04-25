import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/changePassword.css';
import { useNavigate } from 'react-router-dom';


function ChangePassword({ isOpen, onClose, onChangePassword }) {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [success, setSuccess] = useState('');

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

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    // Kiểm tra độ dài mật khẩu mới
    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      await onChangePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      // onClose();
       // Hiển thị thông báo thành công
       setSuccess('Đổi mật khẩu thành công! Bạn sẽ được chuyển về trang đăng nhập sau vài giây.');
      // Reset form
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
      // Đợi 2 giây rồi đăng xuất và chuyển hướng
      setTimeout(() => {
        logout();
        onClose();
        navigate('/login');
      }, 2000);

    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-overlay">
      <div className="change-password-content">
        <div className="change-password-header">
          <h2>Đổi mật khẩu</h2>
          <button className="close-button" onClick={onClose}>✖</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group-cp">
            <label>Mật khẩu hiện tại:</label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group-cp">
            <label>Mật khẩu mới:</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group-cp">
            <label>Xác nhận mật khẩu mới:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
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
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword; 