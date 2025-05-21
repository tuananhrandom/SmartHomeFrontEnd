import React, { useState, useEffect } from 'react';
import '../styles/ShareCameraModal.css';
import { BACKEND_URL } from '../config/api';

function ShareCameraModal({ isOpen, onClose, cameraId, token }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [sharedUsers, setSharedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && cameraId) {
      fetchSharedUsers();
    }
  }, [isOpen, cameraId]);

  const fetchSharedUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/camera/shared-users/${cameraId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không thể lấy danh sách chia sẻ');
      const data = await res.json();
      setSharedUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username && !email) {
      setError('Vui lòng nhập username hoặc email');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/camera/share/${cameraId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUsername: username, targetEmail: email })
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Chia sẻ thành công!');
      setUsername('');
      setEmail('');
      fetchSharedUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async (targetUserId) => {
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/camera/unshare/${cameraId}/${targetUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Đã bỏ chia sẻ!');
      fetchSharedUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-share-overlay popup-share-overlay-show">
      <div className="popup-share popup-share-show">
        <div className="popup-share-header">
          <h2>Chia sẻ Camera</h2>
          <button className="popup-share-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleShare} className="popup-share-form">
          <div className="popup-share-input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <span className="popup-share-or">Và</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="popup-share-button" disabled={loading}>
            Chia sẻ
          </button>
          {error && <div className="popup-share-error">{error}</div>}
          {success && <div className="popup-share-success">{success}</div>}
        </form>
        <div className="popup-share-list">
          <h4>Đã chia sẻ với:</h4>
          {loading ? (
            <div className="popup-share-loading">Đang tải...</div>
          ) : (
            <ul className="popup-share-users">
              {sharedUsers.length === 0 && (
                <li className="popup-share-user-item" style={{ color: '#888' }}>
                  Chưa chia sẻ với ai
                </li>
              )}
              {sharedUsers.map(user => (
                <li key={user.userId} className="popup-share-user-item">
                  <span className="popup-share-user-info">
                    {user.username} ({user.email})
                  </span>
                  <button
                    className="popup-share-unshare-button"
                    onClick={() => handleUnshare(user.userId)}
                    disabled={loading}
                  >
                    Bỏ chia sẻ
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShareCameraModal; 