import React, { useState, useEffect } from 'react';

function LightTable() {
  const [lights, setLights] = useState([]);

  useEffect(() => {
    // Fetch lights data
    const fetchLights = async () => {
      try {
        const response = await fetch('/api/lights');
        if (response.ok) {
          const data = await response.json();
          setLights(data);
        }
      } catch (error) {
        console.error('Error fetching lights:', error);
      }
    };

    fetchLights();
  }, []);

  const handleToggleLight = async (light) => {
    const newStatus = light.lightStatus === 1 ? 0 : 1;
    
    try {
      const response = await fetch(`/light/toggle/${light.lightId}/${newStatus}`, {
        method: 'POST',
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
      const response = await fetch(`/light/refresh/${lightId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedLight = await response.json();
        setLights(prevLights => 
          prevLights.map(light => 
            light.lightId === lightId ? updatedLight : light
          )
        );
      } else {
        console.error('Error refreshing light');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleDeleteLight = async (lightId) => {
    try {
      const response = await fetch(`/light/delete/${lightId}`, {
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
            <img src="/picture/light.png" alt="Light" />
          </div>
          <div id="light-name" className="cell">{light.lightName}</div>
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
    </div>
  );
}

export default LightTable; 