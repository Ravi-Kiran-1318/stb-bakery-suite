import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../context/I18nContext';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const { t } = useI18n();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    // Add event listener to detect clicks outside
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const roleParam = user?.role === 'admin' ? '?role=admin' : '?role=customer';
      const { data } = await axiosInstance.get(`/notifications${roleParam}`);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (socket) {
      socket.on('new_notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id, actionTab, referenceId, recipientRole) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read', error);
    } finally {
      setIsOpen(false);
      
      let basePath = user?.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
      if (recipientRole === 'admin') basePath = '/admin/dashboard';
      if (recipientRole === 'customer') basePath = '/customer/dashboard';

      const timestamp = Date.now();

      if (actionTab) {
        if (basePath === '/customer/dashboard' && (actionTab === 'gallery-cakes' || actionTab === 'custom-cakes')) {
          const tabName = actionTab === 'gallery-cakes' ? 'Gallery Cakes' : 'Custom Cakes';
          navigate(`/custom-cakes?tab=${encodeURIComponent(tabName)}&t=${timestamp}`);
        } else if (basePath === '/admin/dashboard' && (actionTab === 'gallery-cakes' || actionTab === 'custom-cakes')) {
          // Admin handles both under the custom-cakes tab
          navigate(`/admin/dashboard?tab=custom-cakes&t=${timestamp}`);
        } else if (referenceId && actionTab === 'orders') {
          navigate(`${basePath}?tab=${actionTab}&search=${referenceId}&t=${timestamp}`);
        } else {
          navigate(`${basePath}?tab=${actionTab}&t=${timestamp}`);
        }
      } else if (basePath === '/admin/dashboard') {
        navigate(`/admin/dashboard?tab=notifications&t=${timestamp}`);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const roleParam = user?.role === 'admin' ? '?role=admin' : '?role=customer';
      await axiosInstance.patch(`/notifications/mark-all-read${roleParam}`);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleClearAll = async () => {
    try {
      const roleParam = user?.role === 'admin' ? '?role=admin' : '?role=customer';
      await axiosInstance.delete(`/notifications/clear-all${roleParam}`);
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear notifications', error);
    }
  };

  const getRelativeTime = (dateString) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
    if (Math.abs(daysDifference) > 0) return rtf.format(daysDifference, 'day');
    
    const hoursDifference = Math.round((new Date(dateString) - new Date()) / (1000 * 60 * 60));
    if (Math.abs(hoursDifference) > 0) return rtf.format(hoursDifference, 'hour');
    
    const minutesDifference = Math.round((new Date(dateString) - new Date()) / (1000 * 60));
    return rtf.format(minutesDifference, 'minute');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full transition-colors hover:bg-white/10"
        style={{ color: 'rgba(212,175,55,0.8)' }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" 
          className={`w-5 h-5 ${unreadCount > 0 ? 'animate-[rock_1s_ease-in-out_infinite]' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-[100dvh] w-[90%] sm:w-[400px] bg-white z-[110] shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
                <h3 className="text-lg font-bold text-gray-900">{t('Notifications.Title', null, 'Notifications')}</h3>
                <div className="flex items-center gap-3">
                  <button onClick={handleMarkAllRead} className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">{t('Notifications.MarkAllRead', null, 'Mark All Read')}</button>
                  <button onClick={handleClearAll} className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors">{t('Notifications.ClearAll', null, 'Clear All')}</button>
                  <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500 ml-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pb-safe">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center h-full opacity-60">
                    <div className="text-4xl mb-3">🔔</div>
                    <p className="text-base font-medium text-gray-700">{t('Notifications.Empty', null, 'No notifications yet.')}</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id} 
                      onClick={() => handleMarkAsRead(n._id, n.actionTab, n.referenceId, n.recipientRole)}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? 'border-l-4 border-l-amber-500 bg-amber-50/30' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5 text-xl">
                          {n.message.includes('quote') ? '🍰' : n.message.includes('success') ? '🎉' : '🔔'}
                        </div>
                        <div>
                          <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.message}</p>
                          <p className="text-xs text-gray-500 mt-1.5 font-medium">{getRelativeTime(n.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes rock {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(15deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
