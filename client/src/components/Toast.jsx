import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContext } from '../context/ToastContext';

const ToastContainer = () => {
  const { toasts, removeToast } = useContext(ToastContext);

  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return { border: 'border-green-500', icon: '✅' };
      case 'error':
        return { border: 'border-red-500', icon: '❌' };
      case 'warning':
        return { border: 'border-accent', icon: '⚠️' };
      case 'info':
      default:
        return { border: 'border-blue-500', icon: 'ℹ️' };
    }
  };

  return (
    <div className="fixed top-24 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = getToastConfig(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`bg-white shadow-md rounded-lg border-l-4 ${config.border} p-4 min-w-[250px] flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{config.icon}</span>
                <span className="text-sm font-medium text-dark">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-muted hover:text-dark ml-4"
              >
                &times;
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
