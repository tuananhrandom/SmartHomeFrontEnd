// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { BACKEND_URL } from '../config/api';
// import CameraView from './CameraView';
// import '../styles/SharedCameraTable.css';

// function SharedCameraTable() {
//   const [sharedCameras, setSharedCameras] = useState([]);
//   const [isOpenCameraView, setIsOpenCameraView] = useState(false);
//   const [selectedCameraId, setSelectedCameraId] = useState('');
//   const { currentUser } = useAuth();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     fetchSharedCameras();
//   }, []);

//   const fetchSharedCameras = async () => {
//     try {
//       const response = await fetch(`${BACKEND_URL}/camera/shared-with-me`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setSharedCameras(Array.isArray(data) ? data : []);
//       }
//     } catch (error) {
//       console.error('Error fetching shared cameras:', error);
//     }
//   };

//   const handleOpenCameraView = (cameraId) => {
//     setIsOpenCameraView(true);
//     setSelectedCameraId(cameraId);
//   };

//   const handleClosePopup = () => {
//     setIsOpenCameraView(false);
//   };

//   return (
//     <div className="shared-camera-container">
//       <h2 className="shared-camera-title">Camera được chia sẻ với tôi</h2>
//       {sharedCameras.length === 0 ? (
//         <div className="shared-camera-empty">
//           <p>Chưa có camera nào được chia sẻ với bạn</p>
//         </div>
//       ) : (
//         <div className="shared-camera-list">
//           {sharedCameras.map(camera => (
//             <div className="shared-camera-item" key={camera.cameraId}>
//               <div className="shared-camera-info">
//                 <div className="shared-camera-name">
//                   {camera.cameraName}
//                   <span className="shared-camera-id">ID: {camera.cameraId}</span>
//                 </div>
//                 <div className="shared-camera-status">
//                   Trạng thái: {camera.cameraStatus === 1 ? 'Online' : 'Offline'}
//                 </div>
//               </div>
//               <div className="shared-camera-actions">
//                 {camera.cameraStatus === 1 && (
//                   <button
//                     className="shared-camera-view-button"
//                     onClick={() => handleOpenCameraView(camera.cameraId)}
//                   >
//                     <img src="play.png" alt="Xem camera" />
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <CameraView
//         selectedCameraId={selectedCameraId}
//         isOpen={isOpenCameraView}
//         OnClose={handleClosePopup}
//         isRecording={false}
//         isShared={true}
//       />
//     </div>
//   );
// }

// export default SharedCameraTable; 