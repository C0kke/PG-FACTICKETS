import { useState, useEffect, useCallback } from 'react';
import webSocketService from '../services/webSocketService';
import nativeWebSocketService from '../services/nativeWebSocketService';
import notificationApiService from '../services/notificationApiService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [service, setService] = useState(null);

  const updateNotifications = useCallback(async () => {
    try {
      const storagedNotifications = await notificationApiService.fetchNotifications();
      setNotifications(storagedNotifications);
      const count = storagedNotifications.filter(n => !n.read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  const handleNewNotification = useCallback((notification) => {
    updateNotifications();
    
    if (Notification.permission === 'granted') {
      new Notification(notification.title || 'Nueva Notificación', {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  }, [updateNotifications]);

  useEffect(() => {
    let isMounted = true;
    
    const connectAndFetch = async () => {
      // 1. Obtener datos iniciales de la BD
      await updateNotifications();

      // 2. Intentar conexión WebSocket
      try {
        await webSocketService.connect();
        if (isMounted) {
          setService(webSocketService);
          setConnected(true);
        }
      } catch (error) {
        try {
          await nativeWebSocketService.connect();
          if (isMounted) {
            setService(nativeWebSocketService);
            setConnected(true);
          }
        } catch (nativeError) {
          if (isMounted) {
            setConnected(false);
          }
        }
      }
    };

    connectAndFetch();

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      isMounted = false;
    };
  }, [updateNotifications]);

  useEffect(() => {
    if (service) {
      const removeListener = service.addListener(handleNewNotification);
      return removeListener;
    }
  }, [service, handleNewNotification]);

  const markAsRead = useCallback(async (notificationId) => {
    await notificationApiService.markAsRead(notificationId);
    await updateNotifications();
  }, [updateNotifications]);

  const markAllAsRead = useCallback(async () => {
    await notificationApiService.markAllAsRead();
    await updateNotifications();
  }, [updateNotifications]);

  const clearNotifications = useCallback(async () => {
    await notificationApiService.clearNotifications();
    await updateNotifications();
  }, [updateNotifications]);

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updateNotifications
  };
};