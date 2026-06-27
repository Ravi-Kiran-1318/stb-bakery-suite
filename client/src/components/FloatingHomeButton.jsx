import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingHomeButton = () => {
  const location = useLocation();
  
  // Don't show the floating home button if we are already on the home page
  if (location.pathname === '/') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50"
      >
        <Link
          to="/"
          className="flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-r from-[#D4AF37] to-[#EFDBB2] text-[#332200] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all hover:-translate-y-1 group"
          title="Go to Home Page"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-5 h-5 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform"
          >
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.99 8.99a.75.75 0 1 1-1.06 1.06l-1.25-1.25V20.25a.75.75 0 0 1-.75.75H13.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75v-7.609l-1.25 1.25a.75.75 0 0 1-1.06-1.06l8.99-8.99Z" />
          </svg>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingHomeButton;
