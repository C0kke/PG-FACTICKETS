import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.listeners = [];
  }

  connect() {
    if (this.connected || (this.client && this.client.active)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const socket = new SockJS(`${import.meta.env.VITE_API_BACKEND}/ws`);
      
      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {},
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = (frame) => {
        this.connected = true;

        const userId = this.getUserId();

        this.client.subscribe('/topic/notifications', (message) => {
          const notification = JSON.parse(message.body);
          this.notifyListeners(notification);
        });

        resolve();
      };

      this.client.onStompError = (frame) => {
        this.connected = false;
        reject(new Error('Error connecting to WebSocket'));
      };

      this.client.onDisconnect = () => {
        this.connected = false;
      };

      this.client.activate();
    });
  }

  disconnect() {
    if (this.client && this.connected) {
      this.client.deactivate();
      this.connected = false;
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners(notification) {
    this.listeners.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error en listener de notificación:', error);
      }
    });
  }
  
  getNotifications() { return []; }
  getUnreadCount() { return 0; }
  markAsRead(notificationId) { }
  markAllAsRead() { }
  clearNotifications() { }

  getUserId() { 
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser).id : null;
    } catch (e) {
      return null;
    }
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;