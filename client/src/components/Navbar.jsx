import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { items: cart = [] } = useContext(CartContext);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + (item.qty || 0), 0);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'te' : 'en');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border-b border-border sticky top-0 z-40 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <span className="font-display font-bold text-xl text-accent">STB Bakery</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {(!user || user.role === 'customer') && (
              <>
                <Link to="/" className="text-dark hover:text-accent font-medium text-sm transition-colors">{t('nav.home')}</Link>
                <Link to="/shop" className="text-dark hover:text-accent font-medium text-sm transition-colors">{t('nav.shop')}</Link>
                <Link to="/cart" className="relative text-dark hover:text-accent font-medium text-sm transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {user && <NotificationBell />}

            <button 
              onClick={toggleLanguage}
              className="border border-border rounded-full w-8 h-8 flex items-center justify-center text-xs font-semibold hover:bg-surface transition-colors"
            >
              {i18n.language === 'en' ? 'తె' : 'EN'}
            </button>

            {!user ? (
              <div className="flex space-x-3 ml-4">
                <Link to="/login" className="text-dark hover:text-accent font-medium text-sm transition-colors pt-2">{t('nav.login')}</Link>
                <Link to="/signup" className="btn-primary text-sm">Sign Up</Link>
              </div>
            ) : user.role === 'customer' ? (
              <div className="relative group ml-2 cursor-pointer">
                <div className="flex items-center gap-1 text-dark hover:text-accent font-medium text-sm transition-colors">
                  Profile
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-border">
                  <Link to="/customer/dashboard?tab=orders" className="block px-4 py-2 text-sm text-dark hover:bg-surface">My Orders</Link>
                  <Link to="/customer/dashboard?tab=loyalty" className="block px-4 py-2 text-sm text-dark hover:bg-surface">Loyalty Points</Link>
                  <Link to="/customer/dashboard?tab=occasions" className="block px-4 py-2 text-sm text-dark hover:bg-surface">Occasion Reminders</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                </div>
              </div>
            ) : (
              <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors ml-4">Logout</button>
            )}
          </div>

          {/* Mobile Menu Button & Always Visible Items */}
          <div className="flex items-center gap-3 md:hidden">
            {user && <NotificationBell />}
            <button 
              onClick={toggleLanguage}
              className="border border-border rounded-full w-8 h-8 flex items-center justify-center text-xs font-semibold hover:bg-surface"
            >
              {i18n.language === 'en' ? 'తె' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted hover:text-dark focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden bg-white"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {(!user || user.role === 'customer') && (
                <>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-dark hover:bg-surface hover:text-accent">{t('nav.home')}</Link>
                  <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-dark hover:bg-surface hover:text-accent">{t('nav.shop')}</Link>
                  <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-dark hover:bg-surface hover:text-accent flex items-center justify-between">
                    {t('nav.cart')}
                    {cartItemCount > 0 && <span className="bg-accent text-white px-2 py-0.5 rounded-full text-xs">{cartItemCount} items</span>}
                  </Link>
                </>
              )}

              {!user ? (
                <div className="pt-4 flex flex-col gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-center text-dark font-medium border border-border rounded-md">Login</Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-center text-white bg-accent rounded-md">Sign Up</Link>
                </div>
              ) : user.role === 'customer' ? (
                <>
                  <div className="border-t border-border my-2 pt-2">
                    <p className="px-3 text-xs font-semibold text-muted uppercase">My Account</p>
                    <Link to="/customer/dashboard?tab=orders" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-dark hover:bg-surface">My Orders</Link>
                    <Link to="/customer/dashboard?tab=loyalty" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-dark hover:bg-surface">Loyalty Points</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                </>
              ) : (
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 mt-4 rounded-md text-base font-medium text-red-600 border border-red-200">Logout</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
