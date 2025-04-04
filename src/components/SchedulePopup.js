import React, { useState, useEffect } from 'react';

function SchedulePopup({ isOpen, onClose, deviceType, deviceId, userId }) {
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    time: '12:00',
    action: 1, // 1 - bật, 0 - tắt
    isActive: true,
    daysOfWeek: '1,2,3,4,5,6,7' // Mặc định chọn tất cả các ngày
  });
  
  const daysMap = {
    '1': 'T2',
    '2': 'T3',
    '3': 'T4',
    '4': 'T5',
    '5': 'T6',
    '6': 'T7',
    '7': 'CN'
  };

  // Fetch lịch trình hiện có khi popup mở
  useEffect(() => {
    if (isOpen && deviceId) {
      fetchSchedules();
    }
  }, [isOpen, deviceId]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/schedules/device/${deviceType.toLowerCase()}/${deviceId}`);
      console.log("vừa fetch về schedules xong");
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDayToggle = (day) => {
    const currentDays = newSchedule.daysOfWeek.split(',');
    
    if (currentDays.includes(day)) {
      // Xóa ngày
      const updatedDays = currentDays.filter(d => d !== day).join(',');
      setNewSchedule(prev => ({
        ...prev,
        daysOfWeek: updatedDays || '1' // Đảm bảo có ít nhất 1 ngày
      }));
    } else {
      // Thêm ngày
      const updatedDays = [...currentDays, day].filter(d => d).join(',');
      setNewSchedule(prev => ({
        ...prev,
        daysOfWeek: updatedDays
      }));
    }
  };

  const createSchedule = async () => {
    if (!deviceId || !newSchedule.time) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const scheduleData = {
      userId: Number(userId),
      deviceType: deviceType.toLowerCase(),
      deviceId: Number(deviceId),
      action: Number(newSchedule.action),
      time: newSchedule.time,
      daysOfWeek: newSchedule.daysOfWeek,
      isActive: newSchedule.isActive
    };

    try {
      let test = JSON.stringify(scheduleData)
      console.log(test);
      const response = await fetch('http://localhost:8080/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        alert('Đặt lịch thành công!');
        fetchSchedules();
      } else {
        alert('Có lỗi khi đặt lịch. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Đã xảy ra lỗi khi kết nối với máy chủ.');
    }
  };

  const toggleSchedule = async (scheduleId, isActive) => {
    try {
      const response = await fetch(`http://localhost:8080/api/schedules/${scheduleId}/toggle?isActive=${!isActive}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchSchedules();
      }
    } catch (error) {
      console.error('Error toggling schedule:', error);
    }
  };

  const deleteSchedule = async (scheduleId) => {
    console.log(scheduleId);
    try {
      const response = await fetch(`http://localhost:8080/api/schedules/${scheduleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSchedules(prevSchedules => prevSchedules.filter(schedule => schedule.id !== scheduleId));
        alert('Xóa lịch thành công!');
        fetchSchedules();
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  // Format daysOfWeek thành chuỗi hiển thị
  const formatDays = (daysString) => {
    if (!daysString) return 'Không có ngày nào';
    
    return daysString.split(',')
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(day => daysMap[day])
      .join(', ');
  };

  if (!isOpen) return null;

  return (
    <>
      <div id="popup-overlay" className={`popup-overlay ${isOpen ? 'popup-overlay-show' : ''}`} onClick={onClose}></div>
      <div className="schedule-popup">
        <div className="schedule-popup-content">
          <div className="popup-header">
            <h2>Lịch trình {deviceType} {deviceId}</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          
          <div className="popup-body">
            <div className="schedule-form">
              <h3>Thêm lịch trình mới</h3>
              
              <div className="form-group">
                <label>Thời gian:</label>
                <input 
                  type="time" 
                  name="time"
                  value={newSchedule.time}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Hành động:</label>
                <select 
                  name="action"
                  value={newSchedule.action}
                  onChange={handleInputChange}
                >
                  <option value={1}>Bật</option>
                  <option value={0}>Tắt</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Các ngày trong tuần:</label>
                <div className="days-selector">
                  {Object.entries(daysMap).map(([dayNumber, dayName]) => (
                    <button 
                      key={dayNumber}
                      type="button"
                      className={newSchedule.daysOfWeek.split(',').includes(dayNumber) ? 'day-button active' : 'day-button'}
                      onClick={() => handleDayToggle(dayNumber)}
                    >
                      {dayName}
                    </button>
                  ))}
                </div>
              </div>
              
              <button className="add-schedule-button" onClick={createSchedule}>
                Lưu lịch trình
              </button>
            </div>
            
            <div className="schedule-list">
              <h3>Lịch trình hiện tại</h3>
              {schedules.length === 0 ? (
                <p>Chưa có lịch trình nào.</p>
              ) : (
                <div className="schedules">
                  {schedules.map(schedule => (
                    <div key={schedule.id} className={`schedule-item ${schedule.isActive ? 'active' : 'inactive'}`}>
                      <div className="schedule-info">
                        <div className="schedule-time">{schedule.time}</div>
                        <div className="schedule-action">
                          {schedule.action === "on" ? 'Bật' : 'Tắt'}
                        </div>
                        <div className="schedule-days">
                          {formatDays(schedule.daysOfWeek)}
                        </div>
                      </div>
                      <div className="schedule-controls">
                        <button 
                          className={`toggle-button ${schedule.isActive ? 'active' : ''}`}
                          onClick={() => toggleSchedule(schedule.scheduleId, schedule.isActive)}
                          title={schedule.isActive ? 'Tắt lịch trình' : 'Bật lịch trình'}
                        >
                          {schedule.isActive ? '✓' : '✗'}
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => deleteSchedule(schedule.scheduleId)}
                          title="Xóa lịch trình"
                        >
                          ✖
                        </button>
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
  )
}

export default SchedulePopup; 