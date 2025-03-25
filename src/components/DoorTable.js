import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
function DoorTable() {
  const [doors, setDoors] = useState([]);
  const { currentUser } = useAuth();
  const currentUserId = currentUser.userId;
  useEffect(() => {
    
    // Fetch doors data
    const fetchDoors = async () => {
      try {
        const response = await fetch(`http://localhost:8080/door/${currentUserId}`);
        if (response.ok) {
          const data = await response.json();
          if(data.length > 0){
            setDoors(data);
          }
          else{
            return(
              <div>
                <h1>No doors found</h1>
              </div>
            )
          }
        }
      } catch (error) {
        console.error('Error fetching doors:', error);
      }
    };

    fetchDoors();
  }, []);

  const handleToggleAlert = async (door) => {
    const newLockDown = door.doorLockDown === 1 ? 0 : 1;
    
    try {
      const response = await fetch(`/door/toggleAlert/${door.doorId}/${newLockDown}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setDoors(prevDoors => 
          prevDoors.map(d => 
            d.doorId === door.doorId ? { ...d, doorLockDown: newLockDown } : d
          )
        );
      } else {
        console.error('Error toggling door alert');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleRefreshDoor = async (doorId) => {
    try {
      const response = await fetch(`/door/refresh/${doorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedDoor = await response.json();
        setDoors(prevDoors => 
          prevDoors.map(door => 
            door.doorId === doorId ? updatedDoor : door
          )
        );
      } else {
        console.error('Error refreshing door');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleCheckDoor = async (doorId) => {
    try {
      const response = await fetch(`/door/check/${doorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedDoor = await response.json();
        setDoors(prevDoors => 
          prevDoors.map(door => 
            door.doorId === doorId ? updatedDoor : door
          )
        );
      } else {
        console.error('Error checking door');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleDeleteDoor = async (doorId) => {
    try {
      const response = await fetch(`/door/delete/${doorId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setDoors(prevDoors => prevDoors.filter(door => door.doorId !== doorId));
      } else {
        console.error('Error deleting door');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <div>
      {doors.map(door => (
        <div className="row" key={door.doorId} data-id={`door-${door.doorId}`}>
          <div id="door-logo" className="cell image">
            <img src="door.png" alt="Door" />
          </div>
          <div id="door-name" className="cell">{door.doorName}</div>
          <div id="door-id" className="cell">ID: {door.doorId}</div>
          <div id="door-ip" className="cell ip">IP: {door.doorIp}</div>
          <div id="door-status" className="cell status">
            Status: 
            {door.doorStatus === 1 && <span className="status-on">OPEN</span>}
            {door.doorStatus === 0 && <span className="status-off">CLOSE</span>}
            {door.doorStatus === null && <span className="status-on">Disconnected</span>}
          </div>
          <div id="door-lockdown" className="cell status">
            Alert:
            {door.doorLockDown === 0 && <span className="status-off">OFF</span>}
            {door.doorLockDown === 1 && <span className="status-on">ON</span>}
            {door.doorLockDown === null && <span className="status-on">Null</span>}
          </div>
          <div id="door-action" className="cell action">
            {door.doorLockDown === 1 && (
              <button 
                id="btn-turn-off" 
                className="action-button turn-off"
                onClick={() => handleToggleAlert(door)}
              >
                Alert Off
              </button>
            )}
            {door.doorLockDown === 0 && (
              <button 
                id="btn-turn-on" 
                className="action-button turn-on"
                onClick={() => handleToggleAlert(door)}
              >
                Alert On
              </button>
            )}
            {(door.doorLockDown === null || door.doorStatus === null) && (
              <button 
                id="btn-refresh" 
                className="action-button refresh"
                onClick={() => handleRefreshDoor(door.doorId)}
              >
                ⟳
              </button>
            )}
          </div>
          <div id="door-warning" className={`cell warning ${door.doorWarning ? 'warning-blink' : ''}`} data-value={door.doorWarning ? 1 : 0}>
            <span>⚠️</span>
          </div>
          <div className="cell action">
            <button 
              className="action-button check" 
              id="check-btn"
              onClick={() => handleCheckDoor(door.doorId)}
            >
              Check
            </button>
          </div>
          <div id="door-delete" className="cell delete">
            <button 
              className="delete-button"
              onClick={() => handleDeleteDoor(door.doorId)}
            >
              ✖
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DoorTable; 