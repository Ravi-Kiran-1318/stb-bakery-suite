import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import Home from './pages/public/Home';
import Shop from './pages/public/Shop';
import Cart from './pages/public/Cart';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Contact from './pages/public/Contact';
import ProductDetails from './pages/public/ProductDetails';
import Gallery from './pages/public/Gallery';
import Events from './pages/public/Events';
import Checkout from './pages/customer/Checkout';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import ToastContainer from './components/Toast';
import PageWrapper from './components/PageWrapper';
import FloatingHomeButton from './components/FloatingHomeButton';
import MobileBottomNav from './components/MobileBottomNav';

// A helper component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Automatically scroll to the top when navigating, or scroll to hash if present
  React.useEffect(() => {
    if (location.hash) {
      // Small delay to ensure the DOM has rendered the new page before scrolling
      setTimeout(() => {
        const element = document.getElementById(location.hash.substring(1));
        if (element) {
          // Calculate position and offset by 120px to account for the fixed Navbar + extra breathing room
          const topPos = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: topPos - 120,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/shop" element={<PageWrapper><Shop /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/gallery" element={<PageWrapper><Gallery /></PageWrapper>} />
        <Route path="/events" element={<PageWrapper><Events /></PageWrapper>} />
        <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
        <Route
          path="/checkout"
          element={
            <PrivateRoute role="customer">
              <PageWrapper><Checkout /></PageWrapper>
            </PrivateRoute>
          }
        />
        <Route
          path="/order-confirmation/:orderId"
          element={
            <PrivateRoute role="customer">
              <PageWrapper><OrderConfirmation /></PageWrapper>
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/dashboard"
          element={
            <PrivateRoute role="customer">
              <PageWrapper><CustomerDashboard /></PageWrapper>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute role="admin">
              <PageWrapper><AdminDashboard /></PageWrapper>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<PageWrapper><div>404 Not Found</div></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <ToastContainer />
      <AnimatedRoutes />
      <FloatingHomeButton />
      <MobileBottomNav />
    </BrowserRouter>
  );
}

export default App;
