import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

import OrdersTab from './OrdersTab';
import ProductsTab from './ProductsTab';
// import RevenueTab from './RevenueTab';
// import CustomersTab from './CustomersTab';

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
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'orders': return <OrdersTab />;
      case 'products': return <ProductsTab />;
      // case 'revenue': return <RevenueTab />;
      // case 'customers': return <CustomersTab />;
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
        className="hidden md:flex flex-col w-56 bg-white border-r border-border h-[calc(100vh-64px)] sticky top-16"
      >
        <div className="p-4">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Dashboard</h2>
          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-amber-50 text-accent border-l-4 border-accent'
                    : 'text-dark hover:bg-surface border-l-4 border-transparent'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
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
