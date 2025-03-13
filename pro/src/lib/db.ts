import { Message } from '../types';

export interface ChatSession {
  id?: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

// 如果浏览器不支持IndexedDB，我们提供一个内存存储
let memoryStorage: Record<string, ChatSession> = {};

class ChatDB {
  private dbName: string;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(dbName: string) {
    this.dbName = dbName;
  }

  private connect(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('chats')) {
          db.createObjectStore('chats', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async saveChat(session: ChatSession): Promise<string> {
    try {
      if (!session.id) {
        session.id = Date.now().toString();
      }

      const db = await this.connect();
      const transaction = db.transaction('chats', 'readwrite');
      const store = transaction.objectStore('chats');

      return new Promise((resolve, reject) => {
        const request = store.put(session);
        request.onsuccess = () => resolve(session.id as string);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error saving to IndexedDB, using memory storage:', error);
      // 备用方案：使用内存存储
      if (!session.id) {
        session.id = Date.now().toString();
      }
      memoryStorage[session.id] = { ...session };
      return session.id;
    }
  }

  async getChat(id: string): Promise<ChatSession | undefined> {
    try {
      const db = await this.connect();
      const transaction = db.transaction('chats', 'readonly');
      const store = transaction.objectStore('chats');

      return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error reading from IndexedDB, using memory storage:', error);
      // 备用方案：使用内存存储
      return memoryStorage[id];
    }
  }

  async getAllChats(): Promise<ChatSession[]> {
    try {
      const db = await this.connect();
      const transaction = db.transaction('chats', 'readonly');
      const store = transaction.objectStore('chats');

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const chats = request.result;
          // 按时间戳排序，最近的排在前面
          chats.sort((a, b) => b.timestamp - a.timestamp);
          resolve(chats);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error reading from IndexedDB, using memory storage:', error);
      // 备用方案：使用内存存储
      return Object.values(memoryStorage).sort((a, b) => b.timestamp - a.timestamp);
    }
  }

  async deleteChat(id: string): Promise<void> {
    try {
      const db = await this.connect();
      const transaction = db.transaction('chats', 'readwrite');
      const store = transaction.objectStore('chats');

      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error deleting from IndexedDB, using memory storage:', error);
      // 备用方案：使用内存存储
      delete memoryStorage[id];
    }
  }
}

export const chatDB = new ChatDB('DeepseekChats');