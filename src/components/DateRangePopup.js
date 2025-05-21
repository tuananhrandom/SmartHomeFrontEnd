import React, { useState } from 'react';

function DateRangePopup({ isOpen, onClose, onSearch }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      console.log('DateRangePopup - Start Date:', startDate);
      console.log('DateRangePopup - End Date:', endDate);
      const searchQuery = `${startDate}T00:00:00-${endDate}T23:59:59`;
      console.log('DateRangePopup - Search Query:', searchQuery);
      onSearch(searchQuery);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="popup-overlay popup-overlay-show"></div>
      <div className="popup">
        <div className="popup-content popup-show">
          <div className="popup-header">
            <h2>Tìm kiếm theo khoảng thời gian</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="popup-body">
              <div className="date-input-group">
                <label>Từ ngày:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="date-input-group">
                <label>Đến ngày:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="popup-footer">
              <button type="button" id="cancelButton" onClick={onClose}>Hủy</button>
              <button type="submit" id="doneButton">Tìm kiếm</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default DateRangePopup; 