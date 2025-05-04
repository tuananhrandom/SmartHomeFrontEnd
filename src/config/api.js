// Cấu hình API cho ứng dụng

// Địa chỉ server backend
// const BACKEND_URL = 'http://192.168.1.100:8080';
// const BACKEND_URL_WS='ws://192.168.1.100:8080'
const BACKEND_URL = 'http://smartsmart.ddns.net:8080';
const BACKEND_URL_WS='ws://smartsmart.ddns.net:8080'


// Đường dẫn cơ sở cho các API
const API_BASE_URL = `${BACKEND_URL}/api`;

// Các endpoint cụ thể
const API_ENDPOINTS = {
  // Auth
  AUTH: {
    BASE: `${API_BASE_URL}/auth`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    FORGET_PASSWORD: `${API_BASE_URL}/auth/forget`,
  },
  // Device
  LIGHT: {
    NEW: `${BACKEND_URL}/light/newlight`,
    ADMIN_NEW: `${BACKEND_URL}/light/admin/newlight`,
  },
  DOOR: {
    NEW: `${BACKEND_URL}/door/newdoor`,
    ADMIN_NEW: `${BACKEND_URL}/door/admin/newdoor`,
  },
  CAMERA: {
    NEW: `${BACKEND_URL}/camera/newcamera`,
    ADMIN_NEW: `${BACKEND_URL}/camera/admin/newcamera`,
  },
  DEVICE_ACTIVITIES: {
    DEVICE: `${API_BASE_URL}/device-activities/device`,
    TIME_RANGE: `${API_BASE_URL}/device-activities/time-range`,
  }
};

export { BACKEND_URL, API_BASE_URL, API_ENDPOINTS, BACKEND_URL_WS }; 