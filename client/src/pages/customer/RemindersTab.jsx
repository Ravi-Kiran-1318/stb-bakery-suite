import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';

const RemindersTab = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [label, setLabel] = useState('');
  const [month, setMonth] = useState('01');
  const [day, setDay] = useState('01');
  const [submitting, setSubmitting] = useState(false);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.get('/users/reminders');
      setReminders(data);
    } catch (err) {
      console.error('Failed to fetch reminders', err);
      setError(err.response?.data?.message || 'Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dateStr = `${month}-${day}`;
      const { data } = await axiosInstance.post('/users/reminders', { label, date: dateStr });
      setReminders(data);
      setIsModalOpen(false);
      setLabel('');
    } catch (error) {
      alert('Failed to add reminder');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReminder = async (index) => {
    if (window.confirm('Delete this reminder?')) {
      try {
        const { data } = await axiosInstance.delete(`/users/reminders/${index}`);
        setReminders(data);
      } catch (error) {
        alert('Failed to delete reminder');
      }
    }
  };

  // Generate days based on month
  const getDaysInMonth = (m) => {
    const monthInt = parseInt(m, 10);
    if ([4, 6, 9, 11].includes(monthInt)) return 30;
    if (monthInt === 2) return 29; // Allow 29 for leap years
    return 31;
  };

  const days = Array.from({ length: getDaysInMonth(month) }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = [
    { val: '01', name: 'Jan' }, { val: '02', name: 'Feb' }, { val: '03', name: 'Mar' },
    { val: '04', name: 'Apr' }, { val: '05', name: 'May' }, { val: '06', name: 'Jun' },
    { val: '07', name: 'Jul' }, { val: '08', name: 'Aug' }, { val: '09', name: 'Sep' },
    { val: '10', name: 'Oct' }, { val: '11', name: 'Nov' }, { val: '12', name: 'Dec' }
  ];

  const formatDisplayDate = (mmdd) => {
    const [m, d] = mmdd.split('-');
    const monthName = months.find(mo => mo.val === m)?.name || m;
    return `${monthName} ${parseInt(d, 10)}`;
  };

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader /></div>;
  if (error) return <div className="min-h-[50vh] flex items-center justify-center"><ErrorState message={error} onRetry={fetchReminders} /></div>;

  return (
    <div className="max-w-3xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-gray-900">Occasion Reminders</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-full transition-colors shadow-sm"
        >
          + Add Reminder
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-6xl mb-6">🎂</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No reminders set.</h3>
          <p className="text-gray-500">Add one to get notified before special occasions!</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <ul className="divide-y divide-gray-100">
            <AnimatePresence>
              {reminders.map((reminder, idx) => (
                <motion.li 
                  key={`${reminder.label}-${idx}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-xl">
                      🎉
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{reminder.label}</p>
                      <p className="text-amber-600 font-medium">{formatDisplayDate(reminder.date)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteReminder(idx)}
                    className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Delete Reminder"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}

      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3">
        <span className="text-xl">💡</span>
        <p className="font-medium mt-0.5">We'll remind you 2 days before each occasion to order your cake! 🎂</p>
      </div>

      {/* Add Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Occasion</h3>
            <form onSubmit={handleAddReminder}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Label (e.g., Wife's Birthday)</label>
                <input 
                  type="text" 
                  required
                  className="input-field"
                  placeholder="Enter occasion name"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <div className="flex gap-4">
                  <select 
                    className="input-field flex-1"
                    value={month}
                    onChange={(e) => {
                      setMonth(e.target.value);
                      // Reset day if current day is out of bounds for new month
                      const newMaxDays = getDaysInMonth(e.target.value);
                      if (parseInt(day, 10) > newMaxDays) setDay(String(newMaxDays).padStart(2, '0'));
                    }}
                  >
                    {months.map(m => <option key={m.val} value={m.val}>{m.name}</option>)}
                  </select>
                  <select 
                    className="input-field flex-1"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-gray-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full shadow-md transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Reminder'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default RemindersTab;
