import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { ToastContext } from '../../context/ToastContext';

const CouponsTab = () => {
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useContext(ToastContext);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await axiosInstance.get('/coupons/active');
      // Assign a consistent gradient based on index if there's no color property
      const colors = [
        'from-amber-400 to-orange-500',
        'from-emerald-400 to-teal-500',
        'from-blue-400 to-indigo-500',
        'from-purple-400 to-fuchsia-500'
      ];
      const decorated = data.map((c, i) => ({
        ...c,
        color: colors[i % colors.length]
      }));
      setCoupons(decorated);
    } catch (error) {
      addToast('Failed to load coupons', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast('Coupon code copied!', 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading coupons...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Coupons & Offers</h2>
          <p className="text-gray-500 mt-1">Exclusive discounts just for you.</p>
        </div>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-400 text-6xl mb-4">🎟️</div>
          <h3 className="text-xl font-medium text-gray-700">No active coupons</h3>
          <p className="text-gray-500 mt-2">Check back later for exciting offers!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((coupon) => (
            <div 
              key={coupon._id} 
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full"
            >
              {/* Coupon Header (Colored) */}
              <div className={`bg-gradient-to-r ${coupon.color} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-full -ml-8 -mb-8 blur-xl"></div>
                
                <h3 className="text-3xl font-bold mb-1 relative z-10">{coupon.discountPercentage}% OFF</h3>
                <p className="font-medium text-white/90 relative z-10">Bakery Special</p>
              </div>
              
              {/* Coupon Body */}
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-gray-600 text-sm mb-4 flex-grow">Apply this code at checkout to get {coupon.discountPercentage}% off your order!</p>
                
                <div className="flex items-center text-xs text-gray-500 mb-6 space-x-4">
                  <div className="flex items-center">
                    <span className="mr-1">⏳</span> Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-200 w-full mb-6 relative">
                  <div className="absolute -left-8 -top-3 w-6 h-6 bg-gray-50 rounded-full border-r border-gray-200"></div>
                  <div className="absolute -right-8 -top-3 w-6 h-6 bg-gray-50 rounded-full border-l border-gray-200"></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="border border-dashed border-gray-300 bg-gray-50 px-4 py-2 rounded-lg font-mono font-bold text-gray-700 tracking-wider">
                    {coupon.code}
                  </div>
                  
                  <button
                    onClick={() => handleCopyCode(coupon.code)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      copiedCode === coupon.code 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    {copiedCode === coupon.code ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CouponsTab;
