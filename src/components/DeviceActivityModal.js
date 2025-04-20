import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/DeviceActivityModal.css';

function DeviceActivityModal({ isOpen, onClose, deviceType, deviceId }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (isOpen && deviceType && deviceId) {
      fetchActivities();
    }
  }, [isOpen, deviceType, deviceId, filterType]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      let url = `http://192.168.1.100:8080/api/device-activities/device?deviceType=${deviceType}&deviceId=${deviceId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Lọc theo loại hoạt động nếu cần
        let filteredData = data;
        if (filterType !== 'all') {
          filteredData = data.filter(activity => {
            if (filterType === 'on_off') {
              return ['ON', 'OFF'].includes(activity.activityType);
            } else if (filterType === 'connection') {
              return ['CONNECT', 'DISCONNECT'].includes(activity.activityType);
            } else if (filterType === 'door') {
              return ['OPEN', 'CLOSE', 'ALARM_ON', 'ALARM_OFF'].includes(activity.activityType);
            } else if (filterType === 'camera') {
              return ['STREAM_START', 'STREAM_END'].includes(activity.activityType);
            }
            return true;
          });
        }
        
        setActivities(filteredData);
      } else {
        console.error('Không thể lấy dữ liệu hoạt động');
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityTypeClass = (activityType) => {
    switch (activityType) {
      case 'ON': return 'activity-on';
      case 'OFF': return 'activity-off';
      case 'CONNECT': return 'activity-connect';
      case 'DISCONNECT': return 'activity-disconnect';
      case 'OPEN': return 'activity-open';
      case 'CLOSE': return 'activity-close';
      case 'ALARM_ON': return 'activity-alarm-on';
      case 'ALARM_OFF': return 'activity-alarm-off';
      case 'STREAM_START': return 'activity-stream-start';
      case 'STREAM_END': return 'activity-stream-end';
      default: return '';
    }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'ON': return '💡';
      case 'OFF': return '⚪';
      case 'CONNECT': return '🔌';
      case 'DISCONNECT': return '🔌';
      case 'OPEN': return '🔓';
      case 'CLOSE': return '🔒';
      case 'ALARM_ON': return '🚨';
      case 'ALARM_OFF': return '🔕';
      case 'STREAM_START': return '📹';
      case 'STREAM_END': return '📷';
      default: return '📝';
    }
  };

  const getActivityLabel = (activityType) => {
    switch (activityType) {
      case 'ON': return 'Bật';
      case 'OFF': return 'Tắt';
      case 'CONNECT': return 'Kết nối';
      case 'DISCONNECT': return 'Ngắt kết nối';
      case 'OPEN': return 'Mở';
      case 'CLOSE': return 'Đóng';
      case 'ALARM_ON': return 'Bật báo động';
      case 'ALARM_OFF': return 'Tắt báo động';
      case 'STREAM_START': return 'Bắt đầu ghi hình';
      case 'STREAM_END': return 'Kết thúc ghi hình';
      default: return activityType;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div id="popup-overlay" className={`popup-overlay ${isOpen ? 'popup-overlay-show' : ''}`} onClick={onClose}></div>
      <div className="activity-modal">
        <div className="activity-modal-content">
          <div className="popup-header-activity">
            <h2>Activities</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          
          <div className="popup-body-activity">
            <div className="activity-filters">
              <button 
                className={`filter-button ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                Tất cả
              </button>
              <button 
                className={`filter-button ${filterType === 'on_off' ? 'active' : ''}`}
                onClick={() => setFilterType('on_off')}
              >
                Bật/Tắt
              </button>
              {deviceType === 'DOOR' && (
                <button 
                  className={`filter-button ${filterType === 'door' ? 'active' : ''}`}
                  onClick={() => setFilterType('door')}
                >
                  Mở/Đóng cửa
                </button>
              )}
              {deviceType === 'CAMERA' && (
                <button 
                  className={`filter-button ${filterType === 'camera' ? 'active' : ''}`}
                  onClick={() => setFilterType('camera')}
                >
                  Ghi hình
                </button>
              )}
              <button 
                className={`filter-button ${filterType === 'connection' ? 'active' : ''}`}
                onClick={() => setFilterType('connection')}
              >
                Kết nối
              </button>
            </div>
            
            <div className="activity-list">
              {isLoading ? (
                <div className="loading-spinner">Đang tải...</div>
              ) : activities.length === 0 ? (
                <p className="no-activities">Không có hoạt động nào được ghi nhận.</p>
              ) : (
                <div className="activities">
                  {activities.map((activity, index) => (
                    <div key={index} className={`activity-item ${getActivityTypeClass(activity.activityType)}`}>
                      <div className="activity-icon">
                        {getActivityIcon(activity.activityType)}
                      </div>
                      <div className="activity-info">
                        <div className="activity-header">
                          <span className="activity-type">{getActivityLabel(activity.activityType)}</span>
                          <span className="activity-time">{activity.getFormattedTime()}</span>
                        </div>
                        <div className="activity-date">{activity.getFormattedDate()}</div>
                        {activity.description && (
                          <div className="activity-description">{activity.description}</div>
                        )}
                        {(activity.previousState || activity.currentState) && (
                          <div className="activity-state-change">
                            {activity.previousState && <span className="previous-state">Từ: {activity.previousState}</span>}
                            {activity.currentState && <span className="current-state">Đến: {activity.currentState}</span>}
                          </div>
                        )}
                        {activity.ipAddress && (
                          <div className="activity-ip">IP: {activity.ipAddress}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeviceActivityModal; 