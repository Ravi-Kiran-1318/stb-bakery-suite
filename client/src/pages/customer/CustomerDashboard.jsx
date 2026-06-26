import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import Footer from '../../components/Footer';
import MyOrders from './MyOrders';
import ProfileTab from './ProfileTab';
import RemindersTab from './RemindersTab';

const CustomerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'orders';

  useEffect(() => {
    // Redirect if invalid tab
    if (!['orders', 'profile', 'reminders', 'loyalty'].includes(activeTab)) {
      navigate('/customer/dashboard?tab=orders', { replace: true });
    }
  }, [activeTab, navigate]);

  const renderTab = () => {
    switch (activeTab) {
      case 'orders':
        return <MyOrders />;
      case 'profile':
      case 'loyalty':
        return <ProfileTab />;
      case 'reminders':
        return <RemindersTab />;
      default:
        return <MyOrders />;
    }
  };

  return (
    <PageWrapper>
      <div className="bg-gray-50 min-h-screen pt-16 flex flex-col">
        <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          {renderTab()}
        </div>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default CustomerDashboard;
