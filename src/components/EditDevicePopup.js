import React, { useState, useEffect } from 'react';
import '../styles/AddDevicePopup.css';

const EditDevicePopup = ({ isOpen, onClose, device, onSave }) => {
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceId: '',
    deviceType: ''
  });

  useEffect(() => {
    if (device) {
      setFormData({
        deviceName: device.lightName || '',
        deviceId: device.lightId || '',
        deviceType: device.lightType || ''
      });
    }
  }, [device]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h2>Chỉnh sửa thiết bị</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên thiết bị:</label>
            <input
              type="text"
              value={formData.deviceName}
              onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>ID thiết bị:</label>
            <input
              type="text"
              value={formData.deviceId}
              onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
              required
              disabled
            />
          </div>
          <div className="form-group">
            <label>Loại thiết bị:</label>
            <input
              type="text"
              value={formData.deviceType}
              onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
              required
              disabled
            />
          </div>
          <div className="popup-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="save-button">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDevicePopup; 