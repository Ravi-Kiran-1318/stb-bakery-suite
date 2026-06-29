import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/notifications?role=admin');
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, actionTab, referenceId) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      
      if (actionTab) {
        if (referenceId && actionTab === 'orders') {
          navigate(`/admin/dashboard?tab=${actionTab}&search=${referenceId}`);
        } else {
          navigate(`/admin/dashboard?tab=${actionTab}`);
        }
      }
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.patch('/notifications/mark-all-read?role=admin');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        await axiosInstance.delete('/notifications/clear-all?role=admin');
        setNotifications([]);
      } catch (error) {
        console.error('Failed to clear notifications', error);
      }
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

  if (loading) return <div className="flex justify-center p-12"><Loader /></div>;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-500 text-sm mt-1">Stay updated with your latest alerts</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleMarkAllRead}
            className="px-4 py-2 text-sm font-semibold text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
          >
            Mark All Read
          </button>
          <button 
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100"
            >
              <div className="text-5xl mb-4">🔕</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-500">You don't have any notifications right now.</p>
            </motion.div>
          ) : (
            notifications.map((n) => (
              <motion.div
                layout
                key={n._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => handleMarkAsRead(n._id, n.actionTab, n.referenceId)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start ${
                  !n.read 
                    ? 'border-amber-200 bg-amber-50/50 shadow-sm' 
                    : 'border-gray-100 bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`mt-1 p-2 rounded-full ${!n.read ? 'bg-amber-100' : 'bg-gray-100'}`}>
                  {n.type === 'new_order' ? '📦' : n.type === 'payment_received' ? '💳' : '🔔'}
                </div>
                <div className="flex-grow">
                  <p className={`text-base ${!n.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {n.message}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{getRelativeTime(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <div className="w-3 h-3 bg-amber-500 rounded-full mt-2"></div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsTab;
