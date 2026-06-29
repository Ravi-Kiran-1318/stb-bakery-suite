import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatCurrency';

const Cart = () => {
  const { items, updateQty, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'te' ? 'te' : 'en';

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  return (
    <PageWrapper>
      <div className="bg-white min-h-[100dvh] pt-16 flex flex-col pb-24 lg:pb-0">
        <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">
            Your Cart {items.length > 0 && <span className="text-xl text-gray-500 font-sans font-normal ml-2">({items.length} items)</span>}
          </h1>

          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100"
            >
              <div className="text-6xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty.</h2>
              <p className="text-gray-500 mb-8">Looks like you haven't added any delicious treats yet!</p>
              <Link 
                to="/shop" 
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-8 rounded-full transition-colors inline-block"
              >
                Browse Products &rarr;
              </Link>
            </motion.div>
          ) : (
            <div className="flex flex-col md:flex-row gap-12">
              {/* Cart Items List */}
              <div className="flex-grow space-y-6">
                {items.map(item => {
                  const name = lang === 'te' && item.nameTe ? item.nameTe : item.nameEN;
                  return (
                    <motion.div 
                      key={item.productId}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white border border-gray-200 p-4 rounded-2xl shadow-sm relative overflow-hidden"
                    >
                      {/* Image & Info Wrapper for mobile */}
                      <div className="flex items-center gap-4 w-full sm:w-auto flex-grow">
                        {/* Image */}
                        <div className="w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] sm:text-xs text-center leading-tight">No img</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-grow min-w-0">
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg line-clamp-2 leading-tight mb-1 pr-8 sm:pr-0">{name}</h3>
                          <p className="text-gray-500 font-medium text-sm sm:text-base">{formatCurrency(item.price)}</p>
                        </div>
                        
                        {/* Mobile Delete Button (Absolute on mobile) */}
                        <button 
                          onClick={() => removeFromCart(item.productId)}
                          className="sm:hidden absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-9">
                          <button 
                            onClick={() => updateQty(item.productId, item.qty - 1)}
                            className="px-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold h-full border-r border-gray-300 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-10 text-center font-semibold text-gray-900">{item.qty}</span>
                          <button 
                            onClick={() => updateQty(item.productId, item.qty + 1)}
                            className="px-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold h-full border-l border-gray-300 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">{formatCurrency(item.price * item.qty)}</span>
                          <button 
                            onClick={() => removeFromCart(item.productId)}
                            className="hidden sm:block text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"
                            title="Remove item"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Secondary Actions */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button 
                    onClick={handleClearCart}
                    className="text-gray-500 hover:text-red-600 font-medium transition-colors"
                  >
                    Clear Cart
                  </button>
                  <Link 
                    to="/shop"
                    className="text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                  >
                    &larr; Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Summary sidebar */}
              <div className="w-full md:w-80 flex-shrink-0">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                  
                  <div className="flex justify-between items-center mb-4 text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <p className="text-sm text-gray-500 italic">
                      * Delivery fee calculated at checkout
                    </p>
                  </div>

                  <div className="flex justify-between items-center mb-8 text-lg font-bold text-gray-900">
                    <span>Total Estimated</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  <button 
                    onClick={handleProceedToCheckout}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2"
                  >
                    Proceed to Checkout &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Cart;
