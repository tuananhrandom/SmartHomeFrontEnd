import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/DeviceActivityModal.css';
import { BACKEND_URL } from '../config/api';
function DeviceActivityModal({ isOpen, onClose, deviceType, deviceId }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const { currentUser } = useAuth();
  const formatToLocalISOString = (datetimeStr) => {
    const date = new Date(datetimeStr);
    return date.toLocaleString('sv-SE').replace(' ', 'T');
  };

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = '';
      
      if (filterType === 'range') {
        const start = formatToLocalISOString(startTime);
        const end = formatToLocalISOString(endTime);
  
        url = `${BACKEND_URL}/device-activities/time-range?deviceType=${deviceType}&deviceId=${deviceId}&startTime=${start}&endTime=${end}`;
      } else {
        url = `${BACKEND_URL}/device-activities/device?deviceType=${deviceType}&deviceId=${deviceId}`;
      }
  
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        let filteredData = data;
  
        if (filterType !== 'all' && filterType !== 'range') {
          filteredData = data.filter(activity => {
            if (filterType === 'on_off') {
              return ['ON', 'OFF'].includes(activity.activityType);
            } else if (filterType === 'connection') {
              return ['CONNECT', 'DISCONNECT'].includes(activity.activityType);
            } else if (filterType === 'door') {
              return ['OPEN', 'CLOSE', 'ALARM_ON', 'ALARM_OFF', 'WARNING'].includes(activity.activityType);
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
  }, [deviceType, deviceId, filterType, startTime, endTime]);

  useEffect(() => {
    if (isOpen && deviceType && deviceId) {
      fetchActivities();
    }
  }, [isOpen, deviceType, deviceId, filterType, fetchActivities]);

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
      case 'WARNING': return 'activity-warning'
      case 'START_RECORDING': return 'activity-stream-start';
      case 'STOP_RECORDING': return 'activity-stream-end';
      default: return '';
    }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'ON': return 'Light.png';
      case 'OFF': return 'Light-1.png';
      case 'CONNECT': return 'connect.png';
      case 'DISCONNECT': return 'disconnect.png';
      case 'OPEN': return 'door-1.png';
      case 'CLOSE': return 'door.png';
      case 'ALARM_ON': return 'alert-on.png';
      case 'ALARM_OFF': return 'alert-off.png';
      case 'WARNING': return 'warning.png'
      case 'START_RECORDING':return 'isRecording.png';
      case 'STOP_RECORDING': return 'stop.png';
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
      case 'WARNING': return 'Phát hiện xâm nhập'
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
                className={`filter-button ${filterType === 'range' ? 'active' : ''}`}
                onClick={() => setFilterType('range')}
              >
                Time Range
              </button>
              {deviceType === 'Light' && (
                <button 
                  className={`filter-button ${filterType === 'on_off' ? 'active' : ''}`}
                  onClick={() => setFilterType('on_off')}
                >
                  Bật/Tắt
              </button>
              )}

              {deviceType === 'Door' && (
                <button 
                  className={`filter-button ${filterType === 'door' ? 'active' : ''}`}
                  onClick={() => setFilterType('door')}
                >
                  Mở/Đóng cửa
                </button>
              )}
              {/* {deviceType === 'Camera' && (
                <button 
                  className={`filter-button ${filterType === 'camera' ? 'active' : ''}`}
                  onClick={() => setFilterType('camera')}
                >
                  Ghi hình
                </button>
              )} */}
              <button 
                className={`filter-button ${filterType === 'connection' ? 'active' : ''}`}
                onClick={() => setFilterType('connection')}
              >
                Kết nối
              </button>
            </div>

            {filterType === 'range' && (
              <div className="time-range-picker">
                <input 
                  type="datetime-local" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                />
                <input 
                  type="datetime-local" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                />
                <button onClick={fetchActivities}>Lọc</button>
              </div>
            )}
            
            <div className="activity-list">
              {isLoading ? (
                <div className="loading-spinner">Đang tải...</div>
              ) : activities.length === 0 ? (
                <p className="no-activities">Không có hoạt động nào được ghi nhận.</p>
              ) : (
                <div className="activities">
                  {activities.map((activity, index) => (
                    <div key={index} className={`activity-item ${getActivityTypeClass(activity.activityType)}`}>
                      <div className="cell image">
                        <img src={getActivityIcon(activity.activityType)} alt={getActivityLabel(activity.activityType)}/>
                      </div>
                      <div className="activity-info">
                        <div className="activity-header">
                          <span className="activity-type">{getActivityLabel(activity.activityType)}</span>
                          <span className="activity-time">{activity.formattedTime}</span>
                        </div>
                        <div className="activity-date">{activity.formattedDate}</div>
                        {activity.description && (
                          <div className="activity-description">{activity.description}</div>
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