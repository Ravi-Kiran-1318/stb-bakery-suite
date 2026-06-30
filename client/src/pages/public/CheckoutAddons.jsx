import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import PageWrapper from '../../components/PageWrapper';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { useTranslation } from 'react-i18next';

const CheckoutAddons = () => {
  const { addToCart, items, removeFromCart } = useCart();
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddons, setSelectedAddons] = useState(() => {
    return items
      .filter(item => !item.isGallery && !item.isCustomCake)
      .map(item => ({
        product: { _id: item.productId, nameEN: item.nameEN, nameTe: item.nameTe, imageUrl: item.imageUrl, price: item.price },
        qty: item.qty
      }));
  });
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'te' ? 'te' : 'en';

  useEffect(() => {
    // If cart is empty or no gallery/custom cake, redirect back
    const hasCake = items.some(item => item.isGallery || item.isCustomCake);
    if (!hasCake) {
      navigate('/cart');
    }
  }, [items, navigate]);

  useEffect(() => {
    fetchProductsForStep(step);
  }, [step]);

  const fetchProductsForStep = async (currentStep) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/products/all');
      
      let filtered = [];
      if (currentStep === 1) {
        filtered = data.filter(p => p.category === 'Chocolates & Biscuits' && p.isAvailable);
      } else if (currentStep === 2) {
        filtered = data.filter(p => (p.category === 'Party Items' || p.category === 'Decoration Items') && p.isAvailable);
      }
      setProducts(filtered);
    } catch (error) {
      console.error('Failed to fetch addons', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (product, delta, e) => {
    if (e) e.stopPropagation();
    setSelectedAddons(prev => {
      const existing = prev.find(p => (p.product?._id || p._id) === product._id);
      if (existing) {
        const newQty = (existing.qty || 1) + delta;
        if (newQty <= 0) {
          return prev.filter(p => (p.product?._id || p._id) !== product._id);
        }
        return prev.map(p => (p.product?._id || p._id) === product._id ? { product: existing.product || existing, qty: newQty } : p);
      } else if (delta > 0) {
        return [...prev, { product, qty: delta }];
      }
      return prev;
    });
  };

  const handleCardClick = (product) => {
    const isSelected = selectedAddons.some(p => (p.product?._id || p._id) === product._id);
    if (!isSelected) {
      updateQuantity(product, 1);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      window.scrollTo(0, 0);
    } else {
      // Finalize
      // Remove previously saved addons from cart to avoid duplicates
      const existingAddons = items.filter(item => !item.isGallery && !item.isCustomCake);
      existingAddons.forEach(item => {
        removeFromCart(item.productId);
      });

      // Add the currently selected ones
      selectedAddons.forEach(({ product, qty }) => {
        for (let i = 0; i < qty; i++) {
          addToCart(product);
        }
      });
      navigate('/checkout');
    }
  };

  const getStepTitle = () => {
    return step === 1 ? "Add Chocolates & Biscuits?" : "Add Party & Decoration Items?";
  };

  const getStepDescription = () => {
    return step === 1 
      ? "Make your cake even more special with our premium chocolates and biscuits."
      : "Complete your celebration with these amazing party accessories.";
  };

  return (
    <PageWrapper>
      <div className="bg-[#fefaf3] min-h-screen pt-24 pb-24 flex flex-col">
        <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 w-full">
          
          {/* Progress Bar */}
          <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-[#c37e50] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-[#c37e50]' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-[#c37e50] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2d170a] mb-3">
              {getStepTitle()}
            </h1>
            <p className="text-[#c37e50] text-lg max-w-2xl mx-auto">
              {getStepDescription()}
            </p>
          </div>

          {loading ? (
             <div className="flex justify-center items-center h-40">
               <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
             </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
              >
                {products.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-gray-500">
                    No items available in this category right now.
                  </div>
                ) : (
                  products.map(product => {
                    const selectedItem = selectedAddons.find(p => (p.product?._id || p._id) === product._id);
                    const isSelected = !!selectedItem;
                    const qty = selectedItem ? (selectedItem.qty || 1) : 0;
                    const name = lang === 'te' && product.nameTe ? product.nameTe : product.nameEN;
                    
                    return (
                      <div 
                        key={product._id}
                        onClick={() => handleCardClick(product)}
                        className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-200 bg-white shadow-sm flex flex-col ${isSelected ? 'border-[#c37e50] ring-2 ring-[#c37e50]/20 scale-[1.02]' : 'border-transparent hover:border-gray-200 hover:shadow-md'}`}
                      >
                        <div className="h-32 sm:h-48 overflow-hidden relative">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex justify-center items-center text-gray-400">No Image</div>
                          )}
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-[#c37e50] text-white rounded-full p-1 shadow-md">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{name}</h3>
                          <div className="mt-auto pt-2 flex flex-nowrap justify-between items-center gap-1 sm:gap-2">
                            <span className="font-bold text-[#c37e50] text-sm sm:text-base truncate mr-1">{formatCurrency(product.price)}</span>
                            {isSelected ? (
                              <div className="flex items-center bg-[#c37e50] text-white rounded-full overflow-hidden shrink-0" onClick={e => e.stopPropagation()}>
                                <button onClick={(e) => updateQuantity(product, -1, e)} className="px-2 sm:px-3 py-0.5 sm:py-1 hover:bg-[#a66840] font-bold text-sm">-</button>
                                <span className="px-1.5 sm:px-2 font-semibold text-xs sm:text-sm">{qty}</span>
                                <button onClick={(e) => updateQuantity(product, 1, e)} className="px-2 sm:px-3 py-0.5 sm:py-1 hover:bg-[#a66840] font-bold text-sm">+</button>
                              </div>
                            ) : (
                              <button 
                                className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1 rounded-full transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 shrink-0"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Fixed Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
            <div className="max-w-5xl mx-auto flex flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="text-gray-600 font-medium text-sm sm:text-base whitespace-nowrap">
                {(() => {
                  const currentStepSelectedAddons = selectedAddons.filter(addon => 
                    products.some(p => p._id === (addon.product?._id || addon._id))
                  );
                  const currentStepQty = currentStepSelectedAddons.reduce((acc, curr) => acc + curr.qty, 0);
                  
                  return currentStepQty > 0 ? (
                    <span>{currentStepQty} items</span>
                  ) : (
                    <span>No items</span>
                  );
                })()}
              </div>
              <button 
                onClick={handleNext}
                className="flex-1 max-w-[200px] sm:max-w-none sm:w-auto bg-[#2d170a] hover:bg-[#1a0d06] text-white font-bold py-2.5 sm:py-3 px-4 sm:px-8 rounded-xl shadow-lg transition-transform active:scale-95 text-sm sm:text-base whitespace-nowrap"
              >
                {(() => {
                  const currentStepSelectedAddons = selectedAddons.filter(addon => 
                    products.some(p => p._id === (addon.product?._id || addon._id))
                  );
                  return currentStepSelectedAddons.length > 0 ? 'Add & Continue' : 'Skip & Continue';
                })()}
              </button>
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
};

export default CheckoutAddons;
