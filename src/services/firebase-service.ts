
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { notificationService } from './notification-service';

// تكوين Firebase - ستحتاج إلى استبدال هذه القيم بقيم مشروعك
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

class FirebaseService {
  private app: any = null;
  private messaging: any = null;
  private vapidKey = "your-vapid-key"; // مفتاح VAPID من Firebase Console

  // تهيئة Firebase
  async initialize(): Promise<void> {
    try {
      this.app = initializeApp(firebaseConfig);
      
      if ('serviceWorker' in navigator) {
        this.messaging = getMessaging(this.app);
        console.log('Firebase messaging initialized');
      }
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }

  // طلب إذن والحصول على رمز FCM
  async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        console.warn('Firebase messaging not initialized');
        return null;
      }

      // طلب إذن الإشعارات
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        
        // الحصول على رمز FCM
        const token = await getToken(this.messaging, {
          vapidKey: this.vapidKey
        });
        
        if (token) {
          console.log('FCM Token:', token);
          // يمكنك إرسال هذا الرمز إلى خادمك لحفظه
          await this.saveTokenToServer(token);
          return token;
        } else {
          console.log('No registration token available');
        }
      } else {
        console.log('Notification permission denied');
      }
      
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // استقبال الرسائل عندما يكون التطبيق مفتوحاً
  setupForegroundMessaging(): void {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload: MessagePayload) => {
      console.log('Message received in foreground:', payload);
      
      const { title, body } = payload.notification || {};
      
      if (title && body) {
        // عرض الإشعار باستخدام خدمة الإشعارات المحلية
        notificationService.sendNotification(title, body, {
          icon: '/lovable-uploads/ae3b276d-9725-433a-a054-3ade1f8e843b.png',
          badge: '/lovable-uploads/ae3b276d-9725-433a-a054-3ade1f8e843b.png',
          tag: 'firebase-notification',
          requireInteraction: true
        });
      }
    });
  }

  // حفظ الرمز في الخادم (يجب تنفيذ هذه الدالة حسب API الخادم)
  private async saveTokenToServer(token: string): Promise<void> {
    try {
      // هنا يجب إرسال الرمز إلى خادمك
      console.log('Token to save:', token);
      
      // مثال على كيفية إرسال الرمز (يحتاج إلى تخصيص حسب API الخادم)
      /*
      const response = await fetch('/api/save-fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          userId: 'user-id', // معرف المستخدم
          device: navigator.userAgent
        })
      });
      */
      
      // حفظ الرمز محلياً كـ fallback
      localStorage.setItem('fcm-token', token);
      localStorage.setItem('fcm-token-timestamp', Date.now().toString());
      
    } catch (error) {
      console.error('Failed to save FCM token:', error);
    }
  }

  // التحقق من تحديث الرمز
  async refreshToken(): Promise<string | null> {
    try {
      const savedTimestamp = localStorage.getItem('fcm-token-timestamp');
      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // أسبوع بالميلي ثانية
      
      // إذا مر أكثر من أسبوع، احصل على رمز جديد
      if (!savedTimestamp || (now - parseInt(savedTimestamp)) > oneWeek) {
        return await this.requestPermissionAndGetToken();
      }
      
      return localStorage.getItem('fcm-token');
    } catch (error) {
      console.error('Failed to refresh FCM token:', error);
      return null;
    }
  }

  // إرسال إشعار موضعي (للاختبار)
  async sendTestNotification(): Promise<void> {
    await notificationService.sendNotification(
      'إشعار تجريبي من Firebase',
      'تم تفعيل خدمة Firebase FCM بنجاح!'
    );
  }

  // الحصول على الرمز المحفوظ
  getSavedToken(): string | null {
    return localStorage.getItem('fcm-token');
  }

  // التحقق من دعم Firebase Messaging
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }
}

export const firebaseService = new FirebaseService();
