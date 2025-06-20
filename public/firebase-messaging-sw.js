
// استيراد Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// تكوين Firebase (نفس التكوين المستخدم في التطبيق)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// الحصول على خدمة الرسائل
const messaging = firebase.messaging();

// معالجة الرسائل في الخلفية
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const { title, body, icon } = payload.notification || {};
  
  const notificationTitle = title || 'صدقة جارية';
  const notificationOptions = {
    body: body || 'لديك إشعار جديد',
    icon: icon || '/lovable-uploads/ae3b276d-9725-433a-a054-3ade1f8e843b.png',
    badge: '/lovable-uploads/ae3b276d-9725-433a-a054-3ade1f8e843b.png',
    tag: 'firebase-background',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'فتح التطبيق'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ],
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// معالجة النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('Firebase notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // فتح التطبيق
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
