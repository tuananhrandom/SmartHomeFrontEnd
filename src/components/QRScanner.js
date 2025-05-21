import React, { useRef, useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

function QRScanner({ onResult, onClose }) {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const modalRef = useRef(null);

  const stopScanning = async () => {
    try {
      if (codeReaderRef.current) {
        await codeReaderRef.current.stopAsyncDecode();
        codeReaderRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
          track.stop();
          track.enabled = false;
        });
        videoRef.current.srcObject = null;
        videoRef.current.load(); // Reset video element
      }
    } catch (error) {
      console.error('Lỗi khi dừng quét:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        stopScanning().then(() => {
          onClose();
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      stopScanning();
    };
  }, [onClose]);

  useEffect(() => {
    let isComponentMounted = true;

    const startScanning = async () => {
      try {
        if (!isComponentMounted) return;

        codeReaderRef.current = new BrowserQRCodeReader();
        const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
        
        if (!isComponentMounted) return;
        
        if (videoInputDevices.length === 0) {
          alert('Không tìm thấy camera');
          onClose();
          return;
        }

        // Tìm camera sau
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('sau')
        );
        
        const selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;
        
        if (!isComponentMounted) return;

        await codeReaderRef.current.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result) => {
          if (result && isComponentMounted) {
            onResult(result.getText());
            stopScanning().then(() => {
              onClose();
            });
          }
        });
      } catch (error) {
        console.error('Lỗi khi quét QR code:', error);
        if (isComponentMounted) {
          onClose();
        }
      }
    };

    startScanning();

    return () => {
      isComponentMounted = false;
      stopScanning();
    };
  }, [onResult, onClose]);

  return (
    <div className="qr-scanner-modal">
      <div className="qr-scanner-content" ref={modalRef}>
        <video ref={videoRef} style={{ width: '100%', maxWidth: '300px' }} />
      </div>
    </div>
  );
}

export default QRScanner; 