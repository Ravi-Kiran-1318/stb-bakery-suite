import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { ToastContext } from '../context/ToastContext';

const NotificationPrompt = () => {
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const { addToast } = useContext(ToastContext);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      addToast('This browser does not support push notifications', 'error');
      return;
    }

    setLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        
        // Get VAPID public key from backend
        const { data } = await axiosInstance.get('/push/vapid-public-key');
        const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

        // Subscribe to push manager
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });

        // Send subscription to backend
        await axiosInstance.post('/push/subscribe', subscription);
        
        addToast('Push notifications enabled!', 'success');
      } else {
        addToast('Notification permission denied', 'warning');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      addToast('Failed to enable push notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (permission === 'granted') {
    return null; // Don't show anything if already granted
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between shadow-sm">
      <div className="flex items-center gap-3 mb-3 sm:mb-0">
        <div className="bg-amber-100 p-2 rounded-full text-amber-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-sm">Stay Updated (Native Push)</h4>
          <p className="text-xs text-gray-600">Get instant alerts for your orders, even when the app is closed.</p>
          <p className="text-[10px] text-gray-500 mt-1 italic">
            * iOS Users: You must first "Add to Home Screen" via Safari's share menu.
          </p>
        </div>
      </div>
      <button 
        onClick={handleEnableNotifications}
        disabled={loading || permission === 'denied'}
        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto"
      >
        {loading ? 'Enabling...' : permission === 'denied' ? 'Blocked by Browser' : 'Enable Notifications'}
      </button>
    </div>
  );
};

export default NotificationPrompt;
