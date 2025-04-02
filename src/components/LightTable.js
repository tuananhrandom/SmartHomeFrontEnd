import React, { useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import { useAuth } from '../contexts/AuthContext';
import EditDevicePopup from './EditDevicePopup';

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
    const handleEditPopup = (lightId) => {
      setIsOpenEditPopup(true);
      setSelectedLightId(lightId);
    }
    const handleClosePopup = () => {
      setIsOpenEditPopup(false);
    };

  useEffect(() => {
    // lấy về dữ liệu các đèn từ backend
    const fetchLights = async () => {
      try {
        const response = await fetch(`http://localhost:8080/light/${currentUserId}`);
        if (response.ok) {
          const data = await response.json();
          if(data.length > 0){
           setLights(data);
          }
          else{
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
        const response = await fetch(`http://localhost:8080/light/${currentUserId}`);
        if (response.ok) {
          const data = await response.json();
          if(data.length > 0){
           setLights(data);
          }
          else{
            return(
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
      const response = await fetch(`http://localhost:8080/light/toggle?lightId=${Number(light.lightId)}&userId=${Number(currentUserId)}`, {
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
      const response = await fetch(`http://localhost:8080/light/${currentUserId}`, {
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
    try {
      const response = await fetch(`http://localhost:8080/light/delete/user?userId=${currentUserId}&lightId=${lightId}`, {
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
  };

  return (
    <div>
      {lights.map(light => (
        <div className="row" key={light.lightId} data-id={`light-${light.lightId}`}>
          <div id="light-image" className="cell image">
            <img src="light.png" alt="Light" />
          </div>
          <div id="light-name" className="cell">{light.lightName}
          {light.lightName != null && <button className='cell edit' onClick={()=> handleEditPopup(light.lightId)}>✍🏻</button>}
          </div>
          
          <div id="light-id" className="cell">ID: {light.lightId}</div>
          <div id="light-ip" className="cell ip">IP: {light.lightIp}</div>
          <div id="light-status" className="cell status">
            Status: 
            {light.lightStatus === 1 && <span className="status-on">ON</span>}
            {light.lightStatus === 0 && <span className="status-off">OFF</span>}
            {light.lightStatus === null && <span className="status-on">Disconnected</span>}
          </div>
          <div id="light-action" className="cell action">
            {light.lightStatus === 1 && (
              <button 
                id="btn-turn-off" 
                className="action-button turn-off"
                onClick={() => handleToggleLight(light)}
              >
                turn off
              </button>
            )}
            {light.lightStatus === 0 && (
              <button 
                id="btn-turn-on" 
                className="action-button turn-on"
                onClick={() => handleToggleLight(light)}
              >
                turn on
              </button>
            )}
            {light.lightStatus === null && (
              <button 
                id="btn-refresh" 
                className="action-button refresh"
                onClick={() => handleRefreshLight(light.lightId)}
              >
                ⟳
              </button>
            )}
          </div>
          <div id="light-delete" className="cell delete">
            <button 
              className="delete-button"
              onClick={() => handleDeleteLight(light.lightId)}
            >
              ✖
            </button>
          </div>
        </div>
      ))}
      <EditDevicePopup
        isOpen={isOpenEditPopup}
        onClose={handleClosePopup}
        deviceType={deviceType}
        onAddDevice={deviceType}
        deviceId={selectedLightId}

      />
    </div>
  );

}

export default LightTable; 