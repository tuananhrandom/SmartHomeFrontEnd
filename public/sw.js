// Log khi service worker được cài đặt
self.addEventListener('install', (event) => {
  console.log('Service Worker đang được cài đặt...');
  // Đảm bảo service worker được kích hoạt ngay lập tức
  self.skipWaiting();
});

// Log khi service worker được kích hoạt
self.addEventListener('activate', (event) => {
  console.log('Service Worker đang được kích hoạt...');
  // Đảm bảo service worker kiểm soát tất cả các clients
  event.waitUntil(clients.claim());
});

// Xử lý thông báo đẩy
self.addEventListener("push", function (event) {
  console.log('Nhận được sự kiện push:', event);
  
  if (!event.data) {
    console.log('Không có dữ liệu trong sự kiện push');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Dữ liệu push nhận được:', data);
    
    const options = {
      body: data.body || 'Có thông báo mới',
      icon: "/logo192.png",
      badge: "/logo192.png",
      vibrate: [100, 50, 100],
      data: {
        url: data.url || "/",
        timestamp: new Date().toISOString()
      },
      requireInteraction: true, // Thông báo sẽ không tự đóng
      actions: [
        {
          action: 'open',
          title: 'Mở'
        },
        {
          action: 'close',
          title: 'Đóng'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Thông báo mới', options)
        .then(() => console.log('Hiển thị thông báo thành công'))
        .catch(error => {
          console.error('Lỗi khi hiển thị thông báo:', error);
          // Thử hiển thị thông báo đơn giản nếu thông báo phức tạp thất bại
          return self.registration.showNotification('Thông báo mới', {
            body: 'Có thông báo mới từ hệ thống'
          });
        })
    );
  } catch (error) {
    console.error('Lỗi khi xử lý dữ liệu push:', error);
    // Hiển thị thông báo lỗi đơn giản
    event.waitUntil(
      self.registration.showNotification('Thông báo mới', {
        body: 'Có thông báo mới từ hệ thống'
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Thông báo được click:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({type: 'window'}).then(function(clientList) {
      // Nếu có cửa sổ đang mở, focus vào cửa sổ đó
      for (let client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Nếu không có cửa sổ nào đang mở, mở cửa sổ mới
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});