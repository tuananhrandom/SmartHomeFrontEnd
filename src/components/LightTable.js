import React, { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import { useAuth } from '../contexts/AuthContext';
import EditDevicePopup from './EditDevicePopup';
import SchedulePopup from './SchedulePopup';
import DeviceActivityModal from './DeviceActivityModal';
import { BACKEND_URL } from '../config/api';
function LightTable() {
  const deviceType = 'Light';
  const [selectedLightId, setSelectedLightId] = useState('')
  
  const [lights, setLights] = useState([]);
  // Sử dụng WebSocket để lắng nghe cập nhật về thiết bị đèn
  const { isConnected, lastMessage, error: wsError } = useWebSocket({
    autoConnect: true,
    events: ['light-update']
  });
  const { currentUser } = useAuth();
  const currentUserId = currentUser.userId;
  const [isOpenEditPopup, setIsOpenEditPopup] = useState(false);
  const [isOpenSchedulePopup, setIsOpenSchedulePopup] = useState(false);
  const [isOpenActivityModal, setIsOpenActivityModal] = useState(false);
    
  const handleEditPopup = (lightId) => {
    setIsOpenEditPopup(true);
    setSelectedLightId(lightId);
  }
    
  const handleSchedulePopup = (lightId) => {
    console.log('Schedule popup triggered for light:', lightId);
    setIsOpenSchedulePopup(true);
    setSelectedLightId(lightId);
  }
  
  const handleActivityModal = (lightId) => {
    setIsOpenActivityModal(true);
    setSelectedLightId(lightId);
  }
    
  const handleClosePopup = () => {
    setIsOpenEditPopup(false);
    setIsOpenSchedulePopup(false);
    setIsOpenActivityModal(false);
  };

  useEffect(() => {
    // lấy về dữ liệu các đèn từ backend
    const fetchLights = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/light/${currentUserId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setLights(data);
          }
          else {
          }
        }
      } catch (error) {
        console.error('Error fetching lights:', error);
      }
    };

    fetchLights();
  }, []);
  // khi có sự kiện light-update thì cập nhật lại danh sách đèn
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'light-update') {
      // lấy về dữ liệu các đèn từ backend
      const fetchLights = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/light/${currentUserId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              setLights(data);
            }
            else {
              return (
                <div>
                  <h1>No lights found</h1>
                </div>
              )
            }
          }
        } catch (error) {
          console.error('Error fetching lights:', error);
        }
      };
      fetchLights()
    }
  }, [lastMessage]);

  const handleToggleLight = async (light) => {
    const newStatus = light.lightStatus === 1 ? 0 : 1;
    
    try {
      const response = await fetch(`${BACKEND_URL}/light/toggle?lightId=${Number(light.lightId)}&userId=${Number(currentUserId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setLights(prevLights =>
          prevLights.map(l =>
            l.lightId === light.lightId ? { ...l, lightStatus: newStatus } : l
          )
        );
      } else {
        console.error('Error toggling light');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleRefreshLight = async (lightId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/light/${currentUserId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedLight = await response.json();
        setLights(updatedLight);
      } else {
        console.error('Error refreshing light');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleDeleteLight = async (lightId) => {
    if(window.confirm('Bạn muốn loại bỏ thiết bị?')){
      try {
        const response = await fetch(`${BACKEND_URL}/light/delete/user?userId=${currentUserId}&lightId=${lightId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        if (response.ok) {
          setLights(prevLights => prevLights.filter(light => light.lightId !== lightId));
        } else {
          console.error('Error deleting light');
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    }
  };

  return (
    <div>
      {lights.length === 0 ? (
        <div className="row no-device">
          <div className="cell">⚠️ No Device Found</div>
        </div>
      ) : (
        <>
          {lights.map(light => (
            <div className="row" key={light.lightId} data-id={`light-${light.lightId}`}>
              <div id="light-image" className="cell image"  onClick={() => handleActivityModal(light.lightId)}>
                {light.lightStatus === 1 && <img src="light.png" alt="Light" />}
                {light.lightStatus === 0 && <img src="light-1.png" alt="Light" />}
                {light.lightStatus === null && <img src="light-2.png" alt="Light" />}
              </div>
              <div id="light-name" className="cell">
                {light.lightName}
                {light.lightName != null && (
                  <button className="cell edit" onClick={() => handleEditPopup(light.lightId)}>✍🏻</button>
                )}
              </div>
              <div id="light-id" className="cell id">ID: {light.lightId}</div>
              <div id="light-ip" className="cell ip">IP: {light.lightIp}</div>
              <div id="light-status" className="cell status">
                Status:
                {light.lightStatus === 1 && <span className="status-on">ON</span>}
                {light.lightStatus === 0 && <span className="status-off">OFF</span>}
                {light.lightStatus === null && <span className="status-on">Disconnected</span>}
              </div>
              <div id="light-action" className="cell action">
                {light.lightStatus === 1 && (
                  <button className="action-button turn-off" onClick={() => handleToggleLight(light)}>
                    OFF
                  </button>
                )}
                {light.lightStatus === 0 && (
                  <button className="action-button turn-on" onClick={() => handleToggleLight(light)}>
                    ON
                  </button>
                )}
                {light.lightStatus === null && (
                  <>
                    <button className="action-button refresh" onClick={() => handleRefreshLight(light.lightId)}>
                      ⟳
                    </button>
                    <button
                      className="schedule-button"
                      onClick={() => handleSchedulePopup(light.lightId)}
                      title="Đặt lịch trình"
                      disabled
                    >
                      🕒
                    </button>
                  </>
                )}
                {light.lightStatus != null && (
                  <button
                    className="schedule-button"
                    onClick={() => handleSchedulePopup(light.lightId)}
                    title="Đặt lịch trình"
                  >
                    🕒
                  </button>
                )}
              </div>
              <div id="light-delete" className="cell delete">
                <button className="delete-button" onClick={() => handleDeleteLight(light.lightId)}>✖</button>
              </div>
            </div>
          ))}
        </>
      )}
  
  {isOpenEditPopup && (
        <EditDevicePopup
          isOpen={isOpenEditPopup}
          onClose={handleClosePopup}
          deviceType={deviceType}
          deviceId={selectedLightId}
          onAddDevice={() => {}}
        />
      )}
      
      {isOpenSchedulePopup && (
        <SchedulePopup
          isOpen={isOpenSchedulePopup}
          onClose={handleClosePopup}
          deviceType={deviceType}
          deviceId={selectedLightId}
          userId={currentUserId}
        />
      )}
      
      {isOpenActivityModal && (
        <DeviceActivityModal
          isOpen={isOpenActivityModal}
          onClose={handleClosePopup}
          deviceType={deviceType}
          deviceId={selectedLightId}
        />
      )}
    </div>
  );
}

export default LightTable; 