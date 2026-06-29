import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
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

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

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

  const fetchNotifications = async () => {
    try {
      const roleParam = user?.role === 'admin' ? '?role=admin' : '?role=customer';
      const { data } = await axiosInstance.get(`/notifications${roleParam}`);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

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

      if (actionTab) {
        if (referenceId && actionTab === 'orders') {
          navigate(`${basePath}?tab=${actionTab}&search=${referenceId}`);
        } else {
          navigate(`${basePath}?tab=${actionTab}`);
        }
      } else if (basePath === '/admin/dashboard') {
        navigate(`/admin/dashboard?tab=notifications`);
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

      {isOpen && (
        <>
          <div className="absolute -right-16 sm:right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-lg shadow-md z-50 border border-border overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b border-border bg-surface">
              <h3 className="font-semibold text-dark">Notifications</h3>
              <div className="flex gap-2">
                <button onClick={handleMarkAllRead} className="text-xs text-accent hover:underline">Mark All Read</button>
                <button onClick={handleClearAll} className="text-xs text-muted hover:text-red-500 hover:underline">Clear All</button>
              </div>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center border-b border-border">
                  <div className="text-3xl mb-2">🔔</div>
                  <p className="text-sm font-medium text-dark">No notifications yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n._id} 
                    onClick={() => handleMarkAsRead(n._id, n.actionTab, n.referenceId, n.recipientRole)}
                    className={`p-3 border-b border-border hover:bg-surface cursor-pointer transition-colors ${!n.read ? 'border-l-4 border-l-accent bg-amber-50/30' : ''}`}
                  >
                    <p className="text-sm text-dark">{n.message}</p>
                    <p className="text-xs text-muted mt-1">{getRelativeTime(n.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

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
