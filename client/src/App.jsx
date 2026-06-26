import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import Home from './pages/customer/Home';
import Shop from './pages/customer/Shop';
import Cart from './pages/customer/Cart';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Contact from './pages/customer/Contact';
import Checkout from './pages/customer/Checkout';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import ToastContainer from './components/Toast';
import PageWrapper from './components/PageWrapper';

// A helper component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/shop" element={<PageWrapper><Shop /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
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
    </BrowserRouter>
  );
}

export default App;
