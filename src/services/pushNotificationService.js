import { BACKEND_URL } from '../config/api';

const publicVapidKey = 'BEnEohgZbNFsue1776DvufpNa-jYL4WTagex7PfLGzmUfp1IVi5pgWJj9tBCcDPromSc1bmbKAOdnOURia6DTLY'; // Thay thế bằng VAPID key của bạn

export const registerPushNotification = async () => {
  try {
    console.log('Starting push notification registration...');
    
    // Kiểm tra xem service worker có được hỗ trợ không
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.error('Push notifications are not supported');
      throw new Error('Push notifications are not supported');
    }

    // Đăng ký service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered successfully:', registration);

    // Yêu cầu quyền thông báo
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    
    if (permission !== 'granted') {
      console.error('Notification permission denied');
      throw new Error('Notification permission denied');
    }

    // Lấy subscription
    console.log('Getting push subscription...');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
    console.log('Push subscription obtained:', subscription);

    // Kiểm tra và chuẩn bị dữ liệu subscription
    const subscriptionData = {
      endpoint: subscription.endpoint
    };

    // Thêm keys nếu có
    if (subscription.getKey) {
      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');
      
      if (p256dh) {
        subscriptionData.p256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(p256dh)));
      }
      if (auth) {
        subscriptionData.auth = btoa(String.fromCharCode.apply(null, new Uint8Array(auth)));
      }
    }

    // Gửi subscription lên server
    console.log('Sending subscription to server...', subscriptionData);
    const response = await fetch(`${BACKEND_URL}/notification/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(subscriptionData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    console.log('Subscription sent to server successfully');
    return subscription;
  } catch (error) {
    console.error('Error in registerPushNotification:', error);
    throw error;
  }
};

export const unregisterPushNotification = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      // Hủy đăng ký trên server
      const response = await fetch(`${BACKEND_URL}/notification/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      // Hủy đăng ký subscription
      await subscription.unsubscribe();
      console.log('Successfully unsubscribed from push notifications');
    }
  } catch (error) {
    console.error('Error unregistering push notification:', error);
    throw error;
  }
};

// Hàm chuyển đổi VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
} 