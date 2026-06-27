import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import Footer from '../../components/Footer';
import MyOrders from './MyOrders';
import ProfileTab from './ProfileTab';
import RemindersTab from './RemindersTab';
import FavoritesTab from './FavoritesTab';
import CouponsTab from './CouponsTab';
import AddressesTab from './AddressesTab';
import CustomOrdersTab from './CustomOrdersTab';

const CustomerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'orders';

  useEffect(() => {
    // Redirect if invalid tab
    if (!['orders', 'profile', 'reminders', 'loyalty', 'favorites', 'coupons', 'addresses', 'customcakes'].includes(activeTab)) {
      navigate('/customer/dashboard?tab=orders', { replace: true });
    }
  }, [activeTab, navigate]);

  const renderTab = () => {
    switch (activeTab) {
      case 'orders':
        return <MyOrders />;
      case 'favorites':
        return <FavoritesTab />;
      case 'profile':
      case 'loyalty':
        return <ProfileTab />;
      case 'reminders':
        return <RemindersTab />;
      case 'coupons':
        return <CouponsTab />;
      case 'addresses':
        return <AddressesTab />;
      case 'customcakes':
        return <CustomOrdersTab />;
      default:
        return <MyOrders />;
    }
  };

  const tabs = [
    { id: 'orders', label: '📦 My Orders' },
    { id: 'favorites', label: '❤️ Favorites' },
    { id: 'customcakes', label: '🎂 Custom Cakes' },
    { id: 'coupons', label: '🎟️ Coupons' },
    { id: 'addresses', label: '📍 Addresses' },
    { id: 'reminders', label: '📅 Reminders' },
    { id: 'profile', label: '👤 Profile' },
  ];

  return (
    <PageWrapper>
      <div className="bg-gray-50 min-h-screen pt-16 flex flex-col">
        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col lg:flex-row gap-8">
          
          {/* Navigation Menu (Sidebar on Desktop, Wrapped Grid on Mobile) */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="hidden lg:block text-xl font-bold text-gray-800 mb-4 px-2">Dashboard Menu</h2>
              <div className="flex flex-row flex-wrap lg:flex-col gap-2 lg:gap-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => navigate(`/customer/dashboard?tab=${tab.id}`)}
                    className={`flex items-center justify-center lg:justify-start text-center lg:text-left px-4 py-3 rounded-xl font-medium transition-all text-sm lg:text-base flex-grow lg:flex-grow-0 lg:w-full ${
                      activeTab === tab.id 
                        ? 'bg-amber-500 text-white shadow-md font-bold' 
                        : 'bg-gray-50 text-gray-700 hover:bg-amber-100 hover:text-amber-800 border border-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow min-w-0">
            {renderTab()}
          </div>

        </div>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default CustomerDashboard;
