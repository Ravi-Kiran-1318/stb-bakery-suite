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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemCount = cart.reduce((total, item) => total + (item.qty || 0), 0);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'te' : 'en');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about' },
    { label: 'Our Products', to: '/shop' },
    { label: 'Specials', to: '/shop?category=specials' },
    { label: 'Gallery', to: '/gallery' },
    { label: 'Events', to: '/events' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50"
      style={{
        background: 'linear-gradient(to bottom, rgba(5,3,2,0.97) 0%, rgba(10,6,3,0.94) 100%)',
        borderBottom: '1px solid rgba(212,175,55,0.25)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 2px 32px rgba(0,0,0,0.6)',
      }}
    >
      {/* ── Navbar inner container — responsive padding ── */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-20">
        <div className="flex items-center justify-between h-16 md:h-[72px]">

          {/* ── LOGO ── */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div
              className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'radial-gradient(circle at 40% 35%, #f5d472 0%, #c8922a 55%, #7a4a00 100%)',
                boxShadow: '0 0 12px rgba(212,175,55,0.5)',
                border: '1.5px solid rgba(212,175,55,0.6)',
              }}
            >
              <span style={{ fontSize: '17px', lineHeight: 1 }}>🪔</span>
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="font-serif font-bold"
                style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: '#EFDBB2', letterSpacing: '0.04em' }}
              >
                Sri Tirupathi
              </span>
              <span
                className="hidden sm:block font-sans"
                style={{ fontSize: '0.58rem', color: '#D4AF37', letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.85 }}
              >
                Venkatachalapathi Bakery
              </span>
            </div>
          </Link>

          {/* ── DESKTOP NAV LINKS (lg+) ── */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="px-3 py-2 text-sm font-medium transition-all duration-200 rounded-sm hover:text-[#EFDBB2] relative group"
                style={{ color: 'rgba(212,175,55,0.85)' }}
              >
                {item.label}
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] w-0 group-hover:w-4/5 transition-all duration-300 rounded-full"
                  style={{ background: '#D4AF37' }}
                />
              </Link>
            ))}
          </div>

          {/* ── RIGHT ACTIONS ── */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-full transition-colors hover:bg-white/10"
                style={{ color: 'rgba(212,175,55,0.8)' }}
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.form
                    initial={{ opacity: 0, scaleX: 0.7 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.7 }}
                    onSubmit={handleSearch}
                    className="absolute right-0 top-11 z-50"
                  >
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-48 sm:w-56 px-4 py-2 text-sm rounded-lg outline-none"
                      style={{ background: '#1a1006', border: '1px solid rgba(212,175,55,0.4)', color: '#EFDBB2' }}
                    />
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            {(!user || user?.role === 'customer') && (
              <Link
                to="/cart"
                className="relative p-2 rounded-full transition-colors hover:bg-white/10"
                style={{ color: 'rgba(212,175,55,0.8)' }}
                aria-label="Cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                {cartItemCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                    style={{ background: '#D4AF37', color: '#000' }}
                  >
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Bell */}
            {user && <NotificationBell />}

            {/* Language Toggle — desktop only */}
            <button
              onClick={toggleLanguage}
              className="border rounded-full w-8 h-8 items-center justify-center text-xs font-semibold transition-colors hover:bg-white/10 hidden sm:flex"
              style={{ borderColor: 'rgba(212,175,55,0.4)', color: '#EFDBB2' }}
            >
              {i18n.language === 'en' ? 'తె' : 'EN'}
            </button>

            {/* Auth — desktop only */}
            {!user ? (
              <div className="hidden lg:flex items-center gap-2 ml-1">
                <Link
                  to="/login"
                  className="text-sm font-medium transition-colors hover:text-[#EFDBB2] whitespace-nowrap"
                  style={{ color: 'rgba(212,175,55,0.8)' }}
                >
                  Login
                </Link>
                <Link
                  to="/shop"
                  id="order-online-btn"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #c8922a 100%)',
                    color: '#1a0a00',
                    boxShadow: '0 0 16px rgba(212,175,55,0.4)',
                    border: '1px solid rgba(212,175,55,0.6)',
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                  Order Online
                </Link>
              </div>
            ) : user.role === 'customer' ? (
              <div className="relative group ml-1 hidden lg:block">
                <div className="flex items-center gap-1 text-sm font-semibold cursor-pointer" style={{ color: '#D4AF37' }}>
                  My Profile
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-2xl py-1 z-50 hidden group-hover:block" style={{ background: '#0f0a04', border: '1px solid rgba(212,175,55,0.25)' }}>
                  <Link to="/customer/dashboard?tab=orders" className="block px-4 py-2.5 text-sm hover:bg-white/5" style={{ color: 'rgba(212,175,55,0.8)' }}>My Orders</Link>
                  <Link to="/customer/dashboard?tab=loyalty" className="block px-4 py-2.5 text-sm hover:bg-white/5" style={{ color: 'rgba(212,175,55,0.8)' }}>Loyalty Points</Link>
                  <Link to="/customer/dashboard?tab=occasions" className="block px-4 py-2.5 text-sm hover:bg-white/5" style={{ color: 'rgba(212,175,55,0.8)' }}>Occasion Reminders</Link>
                  <div style={{ borderTop: '1px solid rgba(212,175,55,0.2)', margin: '4px 0' }} />
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20">Logout</button>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3 ml-1">
                <Link to="/admin/dashboard" className="text-sm font-semibold hover:text-[#EFDBB2]" style={{ color: '#D4AF37' }}>Admin Dashboard</Link>
                <button onClick={handleLogout} className="text-sm font-semibold text-red-400 hover:text-red-300">Logout</button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full transition-colors hover:bg-white/10 lg:hidden ml-1"
              style={{ color: '#D4AF37' }}
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE DROPDOWN MENU ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden"
            style={{ background: 'rgba(4,2,1,0.98)', borderTop: '1px solid rgba(212,175,55,0.18)' }}
          >
            <div className="px-4 py-4 space-y-0.5">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-[15px] font-medium transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(212,175,55,0.88)' }}
                >
                  {item.label}
                </Link>
              ))}

              <div style={{ borderTop: '1px solid rgba(212,175,55,0.18)', margin: '10px 0 8px' }} />

              {/* Language on mobile */}
              <button
                onClick={toggleLanguage}
                className="w-full text-left px-4 py-3 rounded-lg text-[15px] font-medium transition-colors hover:bg-white/5"
                style={{ color: 'rgba(212,175,55,0.7)' }}
              >
                Switch to: {i18n.language === 'en' ? 'తెలుగు' : 'English'}
              </button>

              <div style={{ borderTop: '1px solid rgba(212,175,55,0.18)', margin: '8px 0' }} />

              {!user ? (
                <div className="flex flex-col gap-2.5 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-center font-semibold border rounded-xl transition-colors hover:bg-white/5"
                    style={{ color: '#EFDBB2', borderColor: 'rgba(212,175,55,0.35)' }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-center font-bold rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #D4AF37, #c8922a)', color: '#1a0a00' }}
                  >
                    Order Online
                  </Link>
                </div>
              ) : user.role === 'customer' ? (
                <div className="flex flex-col gap-0.5 pt-1">
                  <Link to="/customer/dashboard?tab=orders" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-[15px] font-medium hover:bg-white/5" style={{ color: 'rgba(212,175,55,0.8)' }}>My Orders</Link>
                  <Link to="/customer/dashboard?tab=loyalty" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-[15px] font-medium hover:bg-white/5" style={{ color: 'rgba(212,175,55,0.8)' }}>Loyalty Points</Link>
                  <Link to="/customer/dashboard?tab=occasions" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-[15px] font-medium hover:bg-white/5" style={{ color: 'rgba(212,175,55,0.8)' }}>Occasion Reminders</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 rounded-lg text-[15px] font-medium text-red-400 hover:bg-red-900/20">Logout</button>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5 pt-1">
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-[15px] font-medium hover:bg-white/5" style={{ color: 'rgba(212,175,55,0.8)' }}>Admin Dashboard</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 rounded-lg text-[15px] font-medium text-red-400 hover:bg-red-900/20">Logout</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
