import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import NotificationBell from './NotificationBell';
import { FaOm, FaStarAndCrescent, FaCross, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { items: cart = [] } = useContext(CartContext);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemCount = cart.length;

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
    { label: 'About Us', to: '/#about-us' },
    { label: 'Our Products', to: '/shop' },
    { label: 'Specials', to: '/shop?category=specials' },
    { label: 'Cake Gallery', to: '/gallery' },
    { label: 'Events', to: '/events' },
    { label: 'Contact', to: '/contact' },
  ];

  const cakeGalleryCategories = [
    '1 Year Baby Cakes',
    '6 Months Baby Cakes',
    'Step Cakes',
    'Barbie Doll Cakes',
    "Father's Day Cakes",
    "Mother's Day Cakes",
    'Christmas Cakes',
    'New Year Cakes',
    'Photo Cakes',
    'Cartoon Cakes',
    'Pastry Cakes',
    'Chocolate Cakes',
    'Eggless Cakes',
    'Political Party Cakes'
  ];

  const adminNavLinks = [
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'products', label: 'Products', icon: '🥐' },
    { id: 'revenue', label: 'Revenue', icon: '📊' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️' },
    { id: 'events', label: 'Events', icon: '🎉' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ];

  // Helper to handle smooth scrolling for hash links
  const handleNavClick = (e, to) => {
    if (to.startsWith('/#')) {
      const targetId = to.substring(2);
      // If we are already on the home page (where the section exists)
      if (window.location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 bg-white"
      style={{
        borderBottom: '1px solid #f1f5f9',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* ── Navbar inner container — responsive padding ── */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-20">
        <div className="flex items-center justify-between h-16 md:h-[72px]">

          {/* ── LOGO ── */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img 
              src="/src/assets/adminT.png" 
              alt="Sri Tirupathi Venkatachalapathi Bakery" 
              className="h-12 md:h-14 object-contain"
            />
          </Link>

          {/* ── DESKTOP NAV LINKS (lg+) ── */}
          <div className="hidden lg:flex items-center gap-2 lg:gap-4 ml-4 xl:ml-8">
            {navLinks.map((item) => (
              item.label === 'Cake Gallery' ? (
                <div key={item.label} className="relative group flex items-center h-full py-5">
                  <Link
                    to={item.to}
                    onClick={(e) => handleNavClick(e, item.to)}
                    className="px-2 py-2 text-sm font-bold transition-all duration-200 hover:text-amber-600 relative text-gray-900 flex items-center gap-1"
                  >
                    {item.label}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-full transition-all duration-300 rounded-full bg-amber-500" />
                  </Link>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[550px] z-50 hidden group-hover:block">
                    <div className="rounded-lg shadow-2xl p-6 overflow-hidden bg-white border border-gray-100 grid grid-cols-3 gap-x-6 gap-y-4">
                      {cakeGalleryCategories.map(cat => (
                        <Link key={cat} to={`/gallery?category=${encodeURIComponent(cat)}`} className="text-[13px] font-semibold transition-colors hover:text-amber-600 text-gray-700 whitespace-nowrap">
                          {cat}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
              <Link
                key={item.label}
                to={item.to}
                onClick={(e) => handleNavClick(e, item.to)}
                className="px-2 py-2 text-sm font-bold transition-all duration-200 hover:text-amber-600 relative group text-gray-900"
              >
                {item.label}
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-full transition-all duration-300 rounded-full bg-amber-500"
                />
              </Link>
              )
            ))}
          </div>

          {/* ── RIGHT ACTIONS ── */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-full transition-colors hover:bg-gray-100 text-gray-800"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
                className="relative p-2 rounded-full transition-colors hover:bg-gray-100 text-gray-800"
                aria-label="Cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                {cartItemCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full bg-amber-500 text-white shadow-sm"
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
              className="border border-gray-300 rounded-full w-8 h-8 items-center justify-center text-xs font-bold transition-colors hover:bg-gray-100 hidden sm:flex text-gray-800"
            >
              {i18n.language === 'en' ? 'తె' : 'EN'}
            </button>

            {/* Auth — desktop only */}
            {!user ? (
              <div className="hidden lg:flex items-center gap-3 ml-2">
                <Link
                  to="/login"
                  className="text-sm font-bold transition-colors hover:text-amber-600 whitespace-nowrap text-gray-800"
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
              <div className="relative group ml-1 hidden lg:block h-full flex items-center">
                <div className="flex items-center gap-1 text-sm font-bold cursor-pointer h-full py-5 text-gray-800 hover:text-amber-600 transition-colors">
                  My Profile
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
                {/* Invisible wrapper to cover the gap */}
                <div className="absolute right-0 top-full pt-1 w-48 z-50 hidden group-hover:block">
                  <div className="rounded-lg shadow-2xl py-1 overflow-hidden" style={{ background: '#0f0a04', border: '1px solid rgba(212,175,55,0.25)' }}>
                    <Link to="/customer/dashboard?tab=orders" className="block px-4 py-2.5 text-sm transition-colors hover:bg-white/10" style={{ color: 'rgba(212,175,55,0.8)' }}>My Orders</Link>
                    <Link to="/customer/dashboard?tab=occasions" className="block px-4 py-2.5 text-sm transition-colors hover:bg-white/10" style={{ color: 'rgba(212,175,55,0.8)' }}>Occasion Reminders</Link>
                    <div style={{ borderTop: '1px solid rgba(212,175,55,0.2)', margin: '4px 0' }} />
                    <button onClick={handleLogout} className="w-full flex items-center justify-between text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/30 transition-colors">
                      Logout
                      <FaSignOutAlt size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3 ml-2">
                <div className="relative group h-full flex items-center">
                  <div className="flex items-center gap-1 text-sm font-bold cursor-pointer h-full py-5 text-gray-800 hover:text-amber-600 transition-colors">
                    <img src="/src/assets/admin1.png" alt="Admin" className="w-8 h-8 rounded-full border-2 border-amber-500 mr-1 object-cover object-top" />
                    Admin Dashboard
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="absolute right-0 top-full pt-1 w-40 z-50 hidden group-hover:block">
                    <div className="rounded-lg shadow-xl py-1 overflow-hidden bg-white border border-gray-100">
                      <Link to="/admin/dashboard" className="block px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-amber-50 text-gray-800">Dashboard</Link>
                      <button onClick={handleLogout} className="w-full flex items-center justify-between text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                        Logout
                        <FaSignOutAlt size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full transition-colors hover:bg-gray-100 lg:hidden ml-1 text-gray-800"
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

      {/* ── MOBILE SIDEBAR MENU ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[80%] max-w-sm bg-white z-[60] flex flex-col shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <img src="/src/assets/adminT.png" alt="Logo" className="h-8 object-contain" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto pb-8">
                {/* Admin Nav Links or Customer Nav Links */}
                {location.pathname.startsWith('/admin/dashboard') && user?.role === 'admin' ? (
                  <>
                    {adminNavLinks.map((item) => (
                      <Link
                        key={item.id}
                        to={`/admin/dashboard?tab=${item.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-colors hover:bg-amber-50 text-gray-800"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-colors hover:bg-red-50 text-red-500 mt-2">
                      <span className="text-xl"><FaSignOutAlt /></span>
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    {navLinks.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={(e) => {
                          setMobileMenuOpen(false);
                          handleNavClick(e, item.to);
                        }}
                        className="block px-4 py-3 rounded-xl text-base font-bold transition-colors hover:bg-amber-50 text-gray-800"
                      >
                        {item.label}
                      </Link>
                    ))}
                    
                    {user && user.role === 'customer' && (
                      <>
                        <div className="my-2 border-t border-gray-100" />
                        <Link to="/customer/dashboard?tab=orders" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-bold hover:bg-amber-50 text-gray-800">My Orders</Link>
                        <Link to="/customer/dashboard?tab=occasions" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-bold hover:bg-amber-50 text-gray-800">Occasion Reminders</Link>
                      </>
                    )}

                    {user && user.role !== 'customer' && !location.pathname.startsWith('/admin/dashboard') && (
                      <>
                        <div className="my-2 border-t border-gray-100" />
                        <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-bold hover:bg-amber-50 text-gray-800">Admin Dashboard</Link>
                      </>
                    )}

                    {user && (
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-colors hover:bg-red-50 text-red-500 mt-2">
                        <span className="text-xl"><FaSignOutAlt /></span>
                        <span>Logout</span>
                      </button>
                    )}
                  </>
                )}

                <div className="my-4 border-t border-gray-100" />

                <button
                  onClick={toggleLanguage}
                  className="w-full text-left px-4 py-3 rounded-xl text-base font-bold transition-colors hover:bg-amber-50 text-gray-800"
                >
                  Switch to: {i18n.language === 'en' ? 'తెలుగు' : 'English'}
                </button>

                {!user && (
                  <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 mt-4">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-center font-bold border rounded-xl transition-colors hover:bg-amber-50 text-gray-800 border-amber-300"
                    >
                      Login
                    </Link>
                    <Link
                      to="/shop"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-center font-bold rounded-xl shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #f5d472, #c8922a)', color: '#1a0a00' }}
                    >
                      Order Online
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
