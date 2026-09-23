import { useEffect, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const registerToken = useCallback(async () => {
    if (!messaging || !user) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, { 
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
        });
        
        if (token) {
          // Send token to backend
          await axiosInstance.post('/push/fcm-token', { token });
        }
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      registerToken();
    }
  }, [user, registerToken]);

  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground ', payload);
      const title = payload.notification?.title || payload.data?.title || 'New Notification';
      const body = payload.notification?.body || payload.data?.body || '';
      
      addToast(`${title}: ${body}`, 'info');

      // Sync badge if in foreground
      if (navigator.setAppBadge) {
        // We could fetch actual unread count, but for now just show dot
        navigator.setAppBadge(1).catch(console.error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [addToast]);

  return { registerToken };
};
