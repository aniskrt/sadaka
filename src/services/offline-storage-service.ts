interface OfflineQuranData {
  chapters: any[];
  verses: { [chapterId: number]: any[] };
  lastUpdated: string;
  downloadedChapters: number[];
}

interface DownloadProgress {
  chapterId: number;
  chapterName: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
}

class OfflineStorageService {
  private dbName = 'QuranOfflineDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // إنشاء مخزن للسور
        if (!db.objectStoreNames.contains('chapters')) {
          db.createObjectStore('chapters', { keyPath: 'id' });
        }
        
        // إنشاء مخزن للآيات
        if (!db.objectStoreNames.contains('verses')) {
          const versesStore = db.createObjectStore('verses', { keyPath: 'chapterId' });
          versesStore.createIndex('chapterId', 'chapterId', { unique: true });
        }
        
        // إنشاء مخزن للبيانات الوصفية
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  async saveChapter(chapter: any): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chapters'], 'readwrite');
      const store = transaction.objectStore('chapters');
      const request = store.put(chapter);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveVerses(chapterId: number, verses: any[]): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['verses'], 'readwrite');
      const store = transaction.objectStore('verses');
      const request = store.put({ chapterId, verses });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getChapter(chapterId: number): Promise<any | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chapters'], 'readonly');
      const store = transaction.objectStore('chapters');
      const request = store.get(chapterId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getVerses(chapterId: number): Promise<any[] | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['verses'], 'readonly');
      const store = transaction.objectStore('verses');
      const request = store.get(chapterId);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.verses : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getDownloadedChapters(): Promise<number[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get('downloadedChapters');
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : []);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateDownloadedChapters(chapterIds: number[]): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put({ key: 'downloadedChapters', value: chapterIds });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async downloadChapter(chapterId: number, onProgress?: (progress: number) => void): Promise<void> {
    try {
      // تحميل بيانات السورة
      onProgress?.(10);
      const chapterResponse = await fetch(`https://api.quranapi.pages.dev/chapters/${chapterId}`);
      if (!chapterResponse.ok) throw new Error('فشل في تحميل بيانات السورة');
      const chapterData = await chapterResponse.json();
      
      onProgress?.(30);
      
      // تحميل آيات السورة
      const versesResponse = await fetch(`https://api.quranapi.pages.dev/chapters/${chapterId}/verses`);
      if (!versesResponse.ok) throw new Error('فشل في تحميل آيات السورة');
      const versesData = await versesResponse.json();
      
      onProgress?.(70);
      
      // حفظ البيانات محلياً
      await this.saveChapter(chapterData.chapter || chapterData);
      await this.saveVerses(chapterId, versesData.verses || []);
      
      onProgress?.(90);
      
      // تحديث قائمة السور المحملة
      const downloadedChapters = await this.getDownloadedChapters();
      if (!downloadedChapters.includes(chapterId)) {
        downloadedChapters.push(chapterId);
        await this.updateDownloadedChapters(downloadedChapters);
      }
      
      onProgress?.(100);
    } catch (error) {
      console.error(`خطأ في تحميل السورة ${chapterId}:`, error);
      throw error;
    }
  }

  async downloadMultipleChapters(
    chapterIds: number[], 
    onProgress?: (overall: number, current: DownloadProgress) => void
  ): Promise<void> {
    const total = chapterIds.length;
    
    for (let i = 0; i < chapterIds.length; i++) {
      const chapterId = chapterIds[i];
      const overallProgress = Math.round((i / total) * 100);
      
      try {
        onProgress?.(overallProgress, {
          chapterId,
          chapterName: `السورة ${chapterId}`,
          progress: 0,
          status: 'downloading'
        });
        
        await this.downloadChapter(chapterId, (progress) => {
          onProgress?.(overallProgress, {
            chapterId,
            chapterName: `السورة ${chapterId}`,
            progress,
            status: 'downloading'
          });
        });
        
        onProgress?.(overallProgress, {
          chapterId,
          chapterName: `السورة ${chapterId}`,
          progress: 100,
          status: 'completed'
        });
        
      } catch (error) {
        onProgress?.(overallProgress, {
          chapterId,
          chapterName: `السورة ${chapterId}`,
          progress: 0,
          status: 'error'
        });
      }
    }
    
    onProgress?.(100, {
      chapterId: 0,
      chapterName: 'مكتمل',
      progress: 100,
      status: 'completed'
    });
  }

  async isChapterDownloaded(chapterId: number): Promise<boolean> {
    const downloadedChapters = await this.getDownloadedChapters();
    return downloadedChapters.includes(chapterId);
  }

  async deleteChapter(chapterId: number): Promise<void> {
    if (!this.db) await this.initDB();
    
    const transaction = this.db!.transaction(['chapters', 'verses', 'metadata'], 'readwrite');
    
    // حذف السورة
    transaction.objectStore('chapters').delete(chapterId);
    
    // حذف الآيات
    transaction.objectStore('verses').delete(chapterId);
    
    // تحديث قائمة السور المحملة
    const downloadedChapters = await this.getDownloadedChapters();
    const updatedChapters = downloadedChapters.filter(id => id !== chapterId);
    await this.updateDownloadedChapters(updatedChapters);
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.initDB();
    
    const transaction = this.db!.transaction(['chapters', 'verses', 'metadata'], 'readwrite');
    
    transaction.objectStore('chapters').clear();
    transaction.objectStore('verses').clear();
    transaction.objectStore('metadata').clear();
  }

  async getStorageSize(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { used: 0, quota: 0 };
  }
}

export const offlineStorageService = new OfflineStorageService();