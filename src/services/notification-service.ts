
// إعادة تصدير الخدمة المحسنة للحفاظ على التوافق
export { enhancedNotificationService as notificationService } from './enhanced-notification-service';

// تصدير إضافي للخدمة القديمة إذا لزم الأمر
import { enhancedNotificationService } from './enhanced-notification-service';

// واجهة مبسطة للتوافق مع الكود الحالي
class NotificationServiceLegacy {
  // تفويض جميع المكالمات للخدمة المحسنة
  async requestPermission(): Promise<boolean> {
    const result = await enhancedNotificationService.requestPermission();
    return result.granted;
  }

  async sendNotification(title: string, body: string, options?: NotificationOptions): Promise<void> {
    await enhancedNotificationService.sendNotification(title, body, options);
  }

  async scheduleNotification(title: string, body: string, timestamp: number): Promise<void> {
    await enhancedNotificationService.scheduleNotification(title, body, timestamp);
  }

  async playAdhan(prayerName: string, prayerNameAr: string): Promise<void> {
    await enhancedNotificationService.playAdhan(prayerName, prayerNameAr);
  }

  stopAdhan(): void {
    enhancedNotificationService.stopAdhan();
  }

  isSupported(): boolean {
    return enhancedNotificationService.isSupported();
  }

  getPermissionStatus(): NotificationPermission {
    return enhancedNotificationService.getPermissionStatus().permission;
  }

  isPWAInstallable(): boolean {
    return enhancedNotificationService.isPushSupported();
  }

  isPWAInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  async registerBackgroundSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'REGISTER_SYNC',
        data: { tag }
      });
    }
  }

  async initializeServices(): Promise<void> {
    await enhancedNotificationService.startAllServices();
  }

  async stopServices(): Promise<void> {
    await enhancedNotificationService.stopAllServices();
  }

  isPeriodicSyncSupported(): boolean {
    return 'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype;
  }

  async sendFirebaseTestNotification(): Promise<void> {
    await enhancedNotificationService.sendTestNotification();
  }

  async syncPrayerTimes(): Promise<void> {
    await this.registerBackgroundSync('sync-prayer-times');
  }

  async syncQuranProgress(): Promise<void> {
    await this.registerBackgroundSync('sync-quran-progress');
  }

  async syncDhikrCount(): Promise<void> {
    await this.registerBackgroundSync('sync-dhikr-count');
  }

  async syncAllUserData(): Promise<void> {
    await this.registerBackgroundSync('sync-user-data');
  }
}

// تصدير الخدمة القديمة للتوافق
export const legacyNotificationService = new NotificationServiceLegacy();

// تصدير افتراضي
export default enhancedNotificationService;
