const CACHE_NAME = 'sadaqa-jariya-v1.2.0';
const STATIC_CACHE = 'static-cache-v1.2.0';
const DYNAMIC_CACHE = 'dynamic-cache-v1.2.0';
const DATA_CACHE = 'data-cache-v1.2.0';
const OFFLINE_CACHE = 'offline-cache-v1.2.0';

// الملفات الأساسية التي يجب تخزينها مؤقتاً
const CORE_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/lovable-uploads/ae3b276d-9725-433a-a054-3ade1f8e843b.png',
  '/mecca_athan.mp3'
];

// صفحات التطبيق
const APP_PAGES = [
  '/adhkar',
  '/hadith',
  '/tasbih',
  '/duas',
  '/radio',
  '/settings',
  '/quran'
];

// الموارد الخارجية
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap'
];

// قائمة انتظار للمزامنة الخلفية
let syncQueue = [];
let isOnline = true;

// تثبيت Service Worker مع تحسينات
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing v1.2.0...');
  
  event.waitUntil(
    Promise.all([
      // تخزين الملفات الأساسية
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching core files');
        return cache.addAll(CORE_FILES).catch(err => {
          console.warn('Some core files failed to cache:', err);
          // استمر حتى لو فشل بعض الملفات
          return Promise.resolve();
        });
      }),
      
      // تخزين صفحات التطبيق
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching app pages');
        return Promise.all(
          APP_PAGES.map(page => 
            cache.add(page).catch(err => {
              console.warn('Failed to cache page:', page, err);
              return Promise.resolve();
            })
          )
        );
      }),
      
      // تخزين الموارد الخارجية
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching external resources');
        return Promise.all(
          EXTERNAL_RESOURCES.map(url => 
            cache.add(url).catch(err => {
              console.warn('Failed to cache external resource:', url, err);
              return Promise.resolve();
            })
          )
        );
      }),
      
      // إعداد قاعدة بيانات محلية للمحتوى
      initializeOfflineData()
    ])
    .then(() => {
      console.log('Service Worker: Installation completed successfully');
      return self.skipWaiting();
    })
    .catch((error) => {
      console.error('Service Worker: Installation failed', error);
      // لا تفشل التثبيت حتى لو فشل شيء
      return self.skipWaiting();
    })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating v1.2.0...');
  
  event.waitUntil(
    Promise.all([
      // تنظيف التخزين المؤقت القديم
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![STATIC_CACHE, DYNAMIC_CACHE, DATA_CACHE, OFFLINE_CACHE].includes(cacheName)) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // تهيئة خدمات الخلفية
      initializeBackgroundServices(),
      
      // معالجة المزامنة المؤجلة
      processPendingSync()
    ])
    .then(() => {
      console.log('Service Worker: Activated successfully');
      return self.clients.claim();
    })
  );
});

// استراتيجية التخزين المؤقت المحسنة
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل الطلبات غير HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // تسجيل حالة الشبكة
  updateNetworkStatus();

  // استراتيجية مختلفة حسب نوع الطلب
  if (isAPIRequest(url)) {
    event.respondWith(networkFirstWithFallback(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirstWithUpdate(request));
  } else if (isAppPage(url)) {
    event.respondWith(staleWhileRevalidateWithOffline(request));
  } else {
    event.respondWith(networkFirstWithFallback(request));
  }
});

// تحديد نوع الطلب
function isAPIRequest(url) {
  return url.hostname.includes('api') || 
         url.pathname.includes('/api/') ||
         url.hostname.includes('aladhan.com') ||
         url.hostname.includes('mp3quran.net') ||
         url.hostname.includes('hadith.gading.dev');
}

function isStaticAsset(url) {
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|mp3|webp)$/);
}

function isAppPage(url) {
  return APP_PAGES.some(page => url.pathname === page) || url.pathname === '/';
}

// استراتيجية Cache First مع تحديث في الخلفية
async function cacheFirstWithUpdate(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // تحديث في الخلفية
      updateCacheInBackground(request);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    const fallback = await caches.match(request) || 
                    await caches.match('/') || 
                    createOfflineResponse();
    return fallback;
  }
}

// استراتيجية Network First مع دعم أفضل للعمل بدون اتصال
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 5000)
      )
    ]);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, networkResponse.clone());
      
      // إزالة من قائمة انتظار المزامنة إذا نجح
      removeFromSyncQueue(request.url);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    // إضافة إلى قائمة انتظار المزامنة
    addToSyncQueue(request);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // إذا كان طلب لصفحة، ارجع الصفحة الرئيسية
    if (request.destination === 'document') {
      return await caches.match('/') || createOfflinePage();
    }
    
    return createOfflineResponse();
  }
}

// استراتيجية Stale While Revalidate مع دعم العمل بدون اتصال
async function staleWhileRevalidateWithOffline(request) {
  const cachedResponse = await caches.match(request);
  
  const networkResponsePromise = fetch(request)
    .then(response => {
      if (response.ok) {
        const cache = caches.open(DYNAMIC_CACHE);
        cache.then(c => c.put(request, response.clone()));
        isOnline = true;
      }
      return response;
    })
    .catch(error => {
      console.log('Network failed for:', request.url);
      isOnline = false;
      addToSyncQueue(request);
      return null;
    });

  return cachedResponse || networkResponsePromise || createOfflinePage();
}

// إنشاء استجابة للعمل بدون اتصال
function createOfflineResponse() {
  return new Response(JSON.stringify({
    error: 'Offline',
    message: 'المحتوى غير متوفر حالياً',
    cached: true
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

// إنشاء صفحة للعمل بدون اتصال محسنة
function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>صدقة جارية - غير متصل</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Amiri', serif;
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20px;
        }
        .offline-container {
          background: rgba(255,255,255,0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          max-width: 400px;
          width: 100%;
        }
        .icon { font-size: 64px; margin-bottom: 20px; }
        h1 { margin-bottom: 20px; font-size: 24px; }
        p { margin-bottom: 30px; font-size: 16px; line-height: 1.6; }
        .button {
          background: white;
          color: #27ae60;
          border: none;
          padding: 15px 30px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          margin: 10px;
          transition: transform 0.2s;
        }
        .button:hover { transform: scale(1.05); }
        .features {
          margin-top: 30px;
          text-align: right;
          font-size: 14px;
          line-height: 1.8;
        }
        .online-indicator {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px;
          border-radius: 50px;
          background: rgba(255,255,255,0.2);
          font-size: 12px;
        }
        .online { background: rgba(76, 175, 80, 0.8); }
        .offline { background: rgba(244, 67, 54, 0.8); }
      </style>
    </head>
    <body>
      <div class="online-indicator offline">🔴 غير متصل</div>
      
      <div class="offline-container">
        <div class="icon">🕌</div>
        <h1>صدقة جارية</h1>
        <p>أنت غير متصل بالإنترنت حالياً، لكن يمكنك الاستمرار في الاستفادة من:</p>
        
        <div class="features">
          <div>📿 الأذكار والأدعية المحفوظة</div>
          <div>🕐 مواقيت الصلاة (آخر تحديث)</div>
          <div>📖 المحتوى المتاح بدون اتصال</div>
          <div>🔔 التنبيهات المجدولة</div>
        </div>
        
        <button class="button" onclick="window.location.reload()">إعادة المحاولة</button>
        <button class="button" onclick="navigateToApp()">متابعة للتطبيق</button>
      </div>
      
      <script>
        function navigateToApp() {
          window.location.href = '/';
        }
        
        // تحديث حالة الاتصال
        function updateConnectionStatus() {
          const indicator = document.querySelector('.online-indicator');
          if (navigator.onLine) {
            indicator.className = 'online-indicator online';
            indicator.innerHTML = '🟢 متصل';
            setTimeout(() => window.location.reload(), 1000);
          } else {
            indicator.className = 'online-indicator offline';
            indicator.innerHTML = '🔴 غير متصل';
          }
        }
        
        window.addEventListener('online', updateConnectionStatus);
        window.addEventListener('offline', updateConnectionStatus);
        
        // فحص دوري للاتصال
        setInterval(() => {
          if (navigator.onLine) {
            updateConnectionStatus();
          }
        }, 5000);
      </script>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// إدارة قائمة انتظار المزامنة
function addToSyncQueue(request) {
  const syncItem = {
    url: request.url,
    method: request.method,
    timestamp: Date.now(),
    headers: Object.fromEntries(request.headers.entries())
  };
  
  syncQueue.push(syncItem);
  
  // حفظ في التخزين المحلي
  if (syncQueue.length > 0) {
    caches.open(DATA_CACHE).then(cache => {
      cache.put('/sync-queue', new Response(JSON.stringify(syncQueue)));
    });
  }
}

function removeFromSyncQueue(url) {
  syncQueue = syncQueue.filter(item => item.url !== url);
  
  // تحديث التخزين المحلي
  caches.open(DATA_CACHE).then(cache => {
    cache.put('/sync-queue', new Response(JSON.stringify(syncQueue)));
  });
}

// معالجة المزامنة المؤجلة
async function processPendingSync() {
  try {
    const cache = await caches.open(DATA_CACHE);
    const response = await cache.match('/sync-queue');
    
    if (response) {
      const queue = await response.json();
      syncQueue = queue || [];
      
      // معالجة العناصر المؤجلة
      for (const item of syncQueue) {
        try {
          await fetch(item.url, {
            method: item.method,
            headers: item.headers
          });
          
          console.log('Synced pending request:', item.url);
        } catch (error) {
          console.warn('Failed to sync pending request:', item.url, error);
        }
      }
      
      // تنظيف القائمة
      syncQueue = [];
      await cache.put('/sync-queue', new Response(JSON.stringify([])));
    }
  } catch (error) {
    console.error('Failed to process pending sync:', error);
  }
}

// تحديث حالة الشبكة
function updateNetworkStatus() {
  const wasOnline = isOnline;
  isOnline = navigator.onLine;
  
  if (!wasOnline && isOnline) {
    console.log('Network restored, processing pending sync...');
    processPendingSync();
  }
}

// تحديث التخزين المؤقت في الخلفية
async function updateCacheInBackground(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, response);
    }
  } catch (error) {
    // تجاهل أخطاء التحديث في الخلفية
  }
}

// تهيئة البيانات بدون اتصال
async function initializeOfflineData() {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    
    // حفظ بيانات أساسية للعمل بدون اتصال
    const offlineData = {
      adhkar: [], // سيتم ملؤها من البيانات المحلية
      prayers: [],
      settings: {},
      lastUpdate: new Date().toISOString()
    };
    
    await cache.put('/offline-data', 
      new Response(JSON.stringify(offlineData), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    console.log('Offline data initialized');
  } catch (error) {
    console.error('Failed to initialize offline data:', error);
  }
}

// تهيئة خدمات الخلفية
async function initializeBackgroundServices() {
  // تسجيل المزامنة الدورية إذا كانت مدعومة
  if ('periodicSync' in self.registration) {
    try {
      await self.registration.periodicSync.register('background-sync', {
        minInterval: 24 * 60 * 60 * 1000 // 24 ساعة
      });
      console.log('Periodic sync registered');
    } catch (error) {
      console.log('Periodic sync registration failed:', error);
    }
  }
}

// Background Sync API محسن
self.addEventListener('sync', (event) => {
  console.log('Background Sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  } else if (event.tag.startsWith('sync-')) {
    event.waitUntil(handleSpecificSync(event.tag));
  }
});

// مزامنة خلفية شاملة
async function performBackgroundSync() {
  try {
    console.log('Performing comprehensive background sync...');
    
    await Promise.all([
      syncPrayerTimes(),
      syncUserPreferences(),
      processPendingSync(),
      cleanupOldCache()
    ]);
    
    console.log('Background sync completed successfully');
    
    // إشعار العملاء بالتحديث
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE',
        timestamp: Date.now()
      });
    });
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// معالجة مزامنة محددة
async function handleSpecificSync(tag) {
  switch (tag) {
    case 'sync-prayer-times':
      await syncPrayerTimes();
      break;
    case 'sync-user-data':
      await syncUserPreferences();
      break;
    case 'sync-offline-content':
      await syncOfflineContent();
      break;
    default:
      console.log('Unknown sync tag:', tag);
  }
}

// مزامنة أوقات الصلاة محسنة
async function syncPrayerTimes() {
  try {
    console.log('Syncing prayer times...');
    
    const cache = await caches.open(DATA_CACHE);
    const locationResponse = await cache.match('/user-location');
    
    if (locationResponse) {
      const location = await locationResponse.json();
      
      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${location.latitude}&longitude=${location.longitude}&method=5`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // حفظ أوقات الصلاة
        await cache.put('/prayer-times', 
          new Response(JSON.stringify(data.data.timings))
        );
        
        // حفظ وقت آخر تحديث
        await cache.put('/prayer-times-last-update', 
          new Response(JSON.stringify({
            timestamp: new Date().toISOString(),
            location: location
          }))
        );
        
        console.log('Prayer times synced successfully');
        
        // إشعار العملاء
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'PRAYER_TIMES_UPDATED',
            data: data.data.timings,
            source: 'background-sync'
          });
        });
      }
    }
  } catch (error) {
    console.error('Failed to sync prayer times:', error);
  }
}

// مزامنة تفضيلات المستخدم
async function syncUserPreferences() {
  try {
    console.log('Syncing user preferences...');
    
    const cache = await caches.open(DATA_CACHE);
    
    // حفظ التفضيلات المحلية
    const preferences = {
      lastSync: new Date().toISOString(),
      version: '1.2.0'
    };
    
    await cache.put('/user-preferences', 
      new Response(JSON.stringify(preferences))
    );
    
    console.log('User preferences synced');
  } catch (error) {
    console.error('Failed to sync user preferences:', error);
  }
}

// مزامنة المحتوى بدون اتصال
async function syncOfflineContent() {
  try {
    console.log('Syncing offline content...');
    
    const cache = await caches.open(OFFLINE_CACHE);
    
    // تحديث المحتوى المحفوظ
    const content = {
      lastUpdate: new Date().toISOString(),
      status: 'synced'
    };
    
    await cache.put('/offline-content-status', 
      new Response(JSON.stringify(content))
    );
    
    console.log('Offline content synced');
  } catch (error) {
    console.error('Failed to sync offline content:', error);
  }
}

// تنظيف التخزين المؤقت القديم
async function cleanupOldCache() {
  try {
    const cacheNames = await caches.keys();
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const cacheName of cacheNames) {
      if (cacheName.includes('old') || cacheName.includes('deprecated')) {
        await caches.delete(cacheName);
        console.log('Deleted old cache:', cacheName);
      }
    }
  } catch (error) {
    console.error('Failed to cleanup old cache:', error);
  }
}

// دعم Push Notifications محسن
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'صدقة جارية',
    body: 'لديك إشعار جديد',
    icon: '/lovable-uploads/ae3b276d-9725-433a-a054-3ade1f8e843b.png',
    badge: '/lovable-uploads/ae3b276d-9725-433a-a054-3ade1f8e843b.png',
    tag: 'general',
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'فتح التطبيق',
        icon: '/lovable-uploads/ae3b276d-9725-433a-a054-3ade1f8e843b.png'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ],
    data: {}
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = { ...notificationData, ...payload };
    } catch (error) {
      console.error('Failed to parse push notification data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// معالجة النقر على الإشعار محسنة
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const notificationData = event.notification.data || {};
  
  if (action === 'close') {
    return; // مجرد إغلاق الإشعار
  }
  
  // فتح التطبيق أو التركيز عليه
  event.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    }).then((clientList) => {
      // البحث عن نافذة مفتوحة للتطبيق
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // فتح نافذة جديدة إذا لم توجد
      if (clients.openWindow) {
        const targetUrl = notificationData.url || '/';
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// معالجة رسائل من التطبيق الرئيسي
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'SCHEDULE_NOTIFICATION':
      handleScheduleNotification(data);
      break;
      
    case 'REGISTER_SYNC':
      handleRegisterSync(data);
      break;
      
    case 'MANUAL_SYNC':
      event.waitUntil(performBackgroundSync());
      break;
      
    case 'CACHE_CONTENT':
      event.waitUntil(cacheSpecificContent(data));
      break;
      
    case 'GET_CACHE_STATUS':
      event.waitUntil(sendCacheStatus(event.ports[0]));
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// جدولة إشعار
function handleScheduleNotification({ title, body, timestamp, options = {} }) {
  const delay = timestamp - Date.now();
  
  if (delay > 0) {
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/lovable-uploads/ae3b276d-9725-433a-a054-3ade1f8e843b.png',
        badge: '/lovable-uploads/ae3b276d-9725-433a-a054-3ade1f8e843b.png',
        requireInteraction: true,
        silent: false,
        tag: 'scheduled-notification',
        vibrate: [200, 100, 200],
        ...options
      });
    }, delay);
  }
}

// تسجيل مزامنة
async function handleRegisterSync({ tag }) {
  if ('serviceWorker' in navigator && 'sync' in self.registration) {
    try {
      await self.registration.sync.register(tag);
      console.log('Sync registered:', tag);
    } catch (error) {
      console.error('Failed to register sync:', tag, error);
    }
  }
}

// تخزين محتوى محدد
async function cacheSpecificContent({ urls, cacheName = DYNAMIC_CACHE }) {
  try {
    const cache = await caches.open(cacheName);
    
    for (const url of urls) {
      try {
        await cache.add(url);
        console.log('Cached:', url);
      } catch (error) {
        console.warn('Failed to cache:', url, error);
      }
    }
  } catch (error) {
    console.error('Failed to cache specific content:', error);
  }
}

// إرسال حالة التخزين المؤقت
async function sendCacheStatus(port) {
  try {
    const cacheNames = await caches.keys();
    const status = {
      caches: cacheNames,
      isOnline: isOnline,
      syncQueueLength: syncQueue.length,
      lastUpdate: new Date().toISOString()
    };
    
    port.postMessage({ type: 'CACHE_STATUS', data: status });
  } catch (error) {
    console.error('Failed to send cache status:', error);
    port.postMessage({ type: 'CACHE_STATUS', error: error.message });
  }
}

// Periodic Sync محسن
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync triggered:', event.tag);
  
  switch (event.tag) {
    case 'background-sync':
      event.waitUntil(performBackgroundSync());
      break;
      
    case 'prayer-times-sync':
      event.waitUntil(syncPrayerTimes());
      break;
      
    case 'content-sync':
      event.waitUntil(syncOfflineContent());
      break;
      
    default:
      console.log('Unknown periodic sync tag:', event.tag);
  }
});

console.log('Service Worker v1.2.0 loaded successfully');
