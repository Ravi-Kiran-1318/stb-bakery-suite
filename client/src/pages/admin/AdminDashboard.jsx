import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

import OrdersTab from './OrdersTab';
import ProductsTab from './ProductsTab';
import RevenueTab from './RevenueTab';
import CustomersTab from './CustomersTab';
import NotificationsTab from './NotificationsTab';
import GalleryAdminTab from './GalleryAdminTab';
import PartyDecorationAdminTab from './PartyDecorationAdminTab';

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
    { id: 'gallery', label: 'Cake Gallery', icon: '🖼️' },
    { id: 'party-decorations', label: 'Party & Decor', icon: '🎉' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'orders': return <OrdersTab />;
      case 'products': return <ProductsTab />;
      case 'revenue': return <RevenueTab />;
      case 'customers': return <CustomersTab />;
      case 'gallery': return <GalleryAdminTab />;
      case 'party-decorations': return <PartyDecorationAdminTab />;
      case 'notifications': return <NotificationsTab />;
      default: return <OrdersTab />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-[#f8fafc]">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -250, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 h-[calc(100vh-64px)] sticky top-16 relative overflow-hidden"
      >
        <div className="p-6 z-10 relative">
          <div className="mb-8 px-2">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Admin Dashboard</h2>
          </div>
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className={`text-xl transition-transform duration-200 ${activeTab === tab.id ? 'scale-110 drop-shadow-sm' : ''}`}>{tab.icon}</span>
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
        className="flex-1 p-4 md:p-8 pb-32 md:pb-8"
      >
        {renderContent()}
      </motion.main>
    </div>
  );
};

export default AdminDashboard;
