import React, { useState, useEffect } from 'react';
import '../styles/CameraRecordingsModal.css';

function CameraRecordingsModal({ isOpen, onClose, cameraId }) {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    if (isOpen && cameraId) {
      fetchRecordings();
    }
  }, [isOpen, cameraId]);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://192.168.1.100:8080/camera/video/all/${cameraId}`);
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu video');
      }
      const data = await response.json();
      setRecordings(data);
      setError(null);
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải video: ' + err.message);
      setRecordings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecording = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa video này không?')) {
      try {
        const response = await fetch(`http://192.168.1.100:8080/camera/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Không thể xóa video');
        }
        
        // Cập nhật danh sách sau khi xóa
        setRecordings(recordings.filter(recording => recording.id !== id));
        
        // Nếu đang xem video bị xóa, đóng trình phát
        if (selectedVideo && selectedVideo.id === id) {
          setSelectedVideo(null);
        }
      } catch (err) {
        alert('Đã xảy ra lỗi khi xóa video: ' + err.message);
      }
    }
  };

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN');
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return [
      hours > 0 ? String(hours).padStart(2, '0') : null,
      String(minutes).padStart(2, '0'),
      String(remainingSeconds).padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const playVideo = (recording) => {
    setSelectedVideo(recording);
  };

  const closeVideoPlayer = () => {
    setSelectedVideo(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="recordings-modal">
        <div className="recordings-header">
          <h2>Danh sách video đã ghi</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {selectedVideo ? (
          <div className="video-player-container">
            <div className="video-player-header">
              <h3>{formatDate(selectedVideo.startTime)}</h3>
              <button className="back-button" onClick={closeVideoPlayer}>
                ← Quay lại danh sách
              </button>
            </div>
            <div className="video-player">
              <video controls autoPlay width="100%">
                <source src={`http://192.168.1.100:8080/camera/video/${selectedVideo.id}`} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ phát video.
              </video>
            </div>
            <div className="video-info">
              <p>Bắt đầu: {formatDate(selectedVideo.startTime)}</p>
              <p>Kết thúc: {formatDate(selectedVideo.endTime)}</p>
              <p>Thời lượng: {formatDuration(selectedVideo.durationSeconds)}</p>
              <p>Kích thước: {formatFileSize(selectedVideo.fileSize)}</p>
            </div>
          </div>
        ) : (
          <div className="recordings-content">
            {loading ? (
              <div className="loading-spinner">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : recordings.length === 0 ? (
              <div className="empty-message">Không có video nào được ghi lại</div>
            ) : (
              <div className="recordings-list">
                <div className="recordings-list-header">
                  <div className="recording-cell">Thời gian</div>
                  <div className="recording-cell">Thời lượng</div>
                  <div className="recording-cell">Kích thước</div>
                  <div className="recording-cell actions">Thao tác</div>
                </div>
                
                {recordings.map(recording => (
                  <div key={recording.id} className="recording-item">
                    <div className="recording-cell">
                      {formatDate(recording.startTime)}
                    </div>
                    <div className="recording-cell">
                      {formatDuration(recording.durationSeconds)}
                    </div>
                    <div className="recording-cell">
                      {formatFileSize(recording.fileSize)}
                    </div>
                    <div className="recording-cell actions">
                      <button 
                        className="play-button" 
                        onClick={() => playVideo(recording)}
                      >
                        Xem
                      </button>
                      <button 
                        className="delete-button" 
                        onClick={() => handleDeleteRecording(recording.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="refresh-container">
              <button className="refresh-button" onClick={fetchRecordings}>
                Làm mới danh sách
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CameraRecordingsModal; 