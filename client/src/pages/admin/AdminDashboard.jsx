import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

import OrdersTab from './OrdersTab';
import ProductsTab from './ProductsTab';
import RevenueTab from './RevenueTab';
import CustomersTab from './CustomersTab';
import CouponsTab from './CouponsTab';
import NotificationsTab from './NotificationsTab';

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'products', label: 'Products', icon: '🥐' },
    { id: 'revenue', label: 'Revenue', icon: '📊' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'coupons', label: 'Coupons', icon: '🏷️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'orders': return <OrdersTab />;
      case 'products': return <ProductsTab />;
      case 'revenue': return <RevenueTab />;
      case 'customers': return <CustomersTab />;
      case 'coupons': return <CouponsTab />;
      case 'notifications': return <NotificationsTab />;
      default: return <OrdersTab />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-surface">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -250, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-[calc(100vh-64px)] sticky top-16 relative overflow-hidden shadow-[2px_0_10px_rgba(0,0,0,0.02)]"
      >
        <div className="p-6 z-10">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-amber-500 text-xs">◈</span>
            <h2 className="text-sm font-bold text-amber-700 uppercase tracking-widest">Dashboard</h2>
            <span className="text-amber-500 text-xs">◈</span>
          </div>
          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-4 px-6 py-3.5 rounded-xl transition-all duration-300 text-sm font-bold ${
                  activeTab === tab.id
                    ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Lord Tirupati Image at bottom with fade mask */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/50 to-white z-10" />
          <img 
            src="/src/assets/admin1.png" 
            alt="Lord Tirupati" 
            className="w-full h-full object-cover object-bottom opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 p-4 md:p-8 pb-24 md:pb-8"
      >
        {renderContent()}
      </motion.main>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around p-2 z-40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-16 ${
              activeTab === tab.id ? 'text-accent bg-amber-50' : 'text-muted hover:text-dark hover:bg-surface'
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
