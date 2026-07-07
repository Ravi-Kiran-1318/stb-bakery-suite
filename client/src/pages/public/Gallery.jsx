import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import PageWrapper from '../../components/PageWrapper';
import Footer from '../../components/Footer';
import HowItWorksStepper from '../../components/HowItWorksStepper';
import { CartContext } from '../../context/CartContext';
import { ToastContext } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View states: 'categories' | 'cakes'
  const [viewState, setViewState] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const { addToCart } = useContext(CartContext);
  const { addToast } = useContext(ToastContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedCake, setSelectedCake] = useState(null);
  const [requestData, setRequestData] = useState({
    requestedDate: '',
    requestedTime: '',
    weight: '',
    flavour: '',
    color: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchGalleryCakes = async () => {
      try {
        const { data } = await axiosInstance.get('/products?isGallery=true');
        setItems(data);
      } catch (error) {
        console.error('Failed to fetch gallery items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGalleryCakes();
  }, []);

  // Compute unique categories and assign a thumbnail (first item's image)
  const categoriesMap = {};
  items.forEach(item => {
    if (!categoriesMap[item.category]) {
      categoriesMap[item.category] = {
        name: item.category,
        thumbnail: item.imageUrl,
        count: 0
      };
    }
    categoriesMap[item.category].count += 1;
  });
  
  const categoryCards = Object.values(categoriesMap);
  const categoryCakes = selectedCategory ? items.filter(i => i.category === selectedCategory) : [];

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setViewState('cakes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCategories = () => {
    setViewState('categories');
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openRequestModal = (cake) => {
    // Check if user is logged in
    if (!user) {
      addToast('Please login to request a quote', 'error');
      navigate('/login', { state: { from: '/gallery' } });
      return;
    }

    setSelectedCake(cake);
    setRequestData({
      requestedDate: '',
      requestedTime: '',
      weight: cake.weight || '',
      flavour: cake.flavour || '',
      color: cake.color || '',
      description: cake.nameEN || 'Gallery Cake Request',
    });
    setRequestModalOpen(true);
  };

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestData.requestedDate) {
      addToast('Please select a required date', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axiosInstance.post('/custom-cakes', {
        ...requestData,
        isGalleryRequest: true,
        galleryCakeId: selectedCake._id,
        basePrice: selectedCake.price
      });
      
      // WhatsApp redirection
      let waNumber = import.meta.env.VITE_SHOP_WHATSAPP || '0000000000';
      if (waNumber.length === 10) waNumber = '91' + waNumber;
      const rawText = `Hello sir/ Madam,\n\nI just submitted a quote request for a Gallery Cake.\n\n*Cake Name:* ${selectedCake.nameEN}\n*Base Price:* ₹${selectedCake.price}\n*Image:* ${selectedCake.imageUrl}\n\n*My Details:*\n- Weight: ${requestData.weight}\n- Flavour: ${requestData.flavour || 'N/A'}\n- Color: ${requestData.color || 'N/A'}\n- Date Required: ${requestData.requestedDate}\n- Time Required: ${requestData.requestedTime || 'N/A'}\n- Notes: ${requestData.description || 'N/A'}\n\nPlease check my request in the dashboard and provide a quote!`;
      const text = encodeURIComponent(rawText);
      
      addToast('Request sent successfully! Opening WhatsApp...', 'success');
      
      setRequestModalOpen(false);
      setSelectedCake(null);
      
      setTimeout(() => {
        window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
        navigate('/customer/dashboard?tab=customcakes');
      }, 300);
      
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="bg-[#fefaf3] min-h-screen pt-14 sm:pt-16 flex flex-col">
        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6 sm:pb-12 w-full">
          
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#2d170a] mb-3 sm:mb-4">
              {viewState === 'categories' ? 'Custom Cake Gallery' : selectedCategory}
            </h1>
            <p className="text-lg text-[#5c4033] max-w-2xl mx-auto">
              {viewState === 'categories' 
                ? 'Explore our beautiful collection of custom cakes designed for every special occasion.'
                : 'Browse our beautiful designs and add your favorite to the cart.'}
            </p>
          </div>

          {viewState === 'categories' && (
            <div className="mb-12">
              <HowItWorksStepper hideCTA={true} />
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-[#5c4033]">
              <span className="text-4xl block mb-4">🎂</span>
              <p className="text-xl">Our custom cake gallery is currently empty. Check back soon!</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {viewState === 'categories' && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                >
                  {categoryCards.map(cat => (
                    <div 
                      key={cat.name}
                      onClick={() => handleCategoryClick(cat.name)}
                      className="group cursor-pointer rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img 
                          src={cat.thumbnail} 
                          alt={cat.name}
                          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h3 className="font-bold text-xl drop-shadow-md">{cat.name}</h3>
                          <p className="text-sm font-semibold text-amber-300">{cat.count} Designs</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {viewState === 'cakes' && (
                <motion.div
                  key="cakes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <button 
                    onClick={handleBackToCategories}
                    className="mb-8 flex items-center gap-2 text-[#c37e50] font-bold hover:text-[#a0633b] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Occasions
                  </button>

                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                    {categoryCakes.map((cake) => (
                      <div key={cake._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col group">
                        <div className="relative h-32 sm:h-64 overflow-hidden">
                          <img 
                            src={cake.imageUrl} 
                            alt={cake.nameEN} 
                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-3 sm:p-5 flex flex-col flex-grow">
                          <h3 className="font-bold text-sm sm:text-lg text-[#2d170a] leading-tight mb-1 sm:mb-2 line-clamp-2">{cake.nameEN}</h3>
                          
                          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                            {cake.weight && (
                              <span className="bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                                {cake.weight}
                              </span>
                            )}
                            {cake.flavour && (
                              <span className="bg-amber-50 text-amber-700 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                                {cake.flavour}
                              </span>
                            )}
                          </div>
                          
                          {cake.descriptionEN && (
                            <p className="hidden sm:block text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">{cake.descriptionEN}</p>
                          )}
                          
                          <div className="flex items-center justify-between mt-auto pt-2 sm:pt-4 border-t border-gray-100">
                            <span className="text-base sm:text-xl font-bold text-[#c37e50]">₹{cake.price}</span>
                            <button 
                              onClick={() => openRequestModal(cake)}
                              className="bg-[#c37e50] hover:bg-[#a0633b] text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors transform hover:scale-105 active:scale-95 whitespace-nowrap"
                            >
                              Request Quote
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Request Modal */}
          {requestModalOpen && selectedCake && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto pt-20 pb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-auto"
              >
                <div className="p-4 sm:p-6 bg-[#fefaf3] border-b border-[#f3e8d6] flex justify-between items-center">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2d170a]">Request Gallery Cake</h3>
                  <button onClick={() => setRequestModalOpen(false)} className="text-[#a0633b] hover:text-[#2d170a]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                
                <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
                  <div className="flex gap-4 mb-6 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <img src={selectedCake.imageUrl} alt={selectedCake.nameEN} className="w-20 h-20 object-cover rounded-lg shadow-sm" />
                    <div>
                      <h4 className="font-bold text-[#2d170a]">{selectedCake.nameEN}</h4>
                      <p className="text-sm text-amber-800 font-semibold mt-1">Base Price: ₹{selectedCake.price}</p>
                      <p className="text-xs text-amber-700/70 mt-1">Submit this request for the admin to provide a final quote based on your requirements.</p>
                    </div>
                  </div>

                  <form onSubmit={handleRequestSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#5c4033] mb-1">Required Date *</label>
                        <input type="date" name="requestedDate" required value={requestData.requestedDate} onChange={handleRequestChange} min={new Date().toISOString().split('T')[0]} className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#5c4033] mb-1">Time (Optional)</label>
                        <div className="relative">
                          <div 
                            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                            className={`w-full border rounded-lg p-2.5 bg-white flex justify-between items-center cursor-pointer select-none transition-all ${isTimeDropdownOpen ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-gray-200 hover:border-amber-300'}`}
                          >
                            <span className={requestData.requestedTime ? "text-gray-900 font-medium" : "text-gray-500"}>
                              {requestData.requestedTime || "Select a time slot"}
                            </span>
                            <svg className={`w-4 h-4 transition-transform ${isTimeDropdownOpen ? 'rotate-180 text-amber-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                          
                          {/* Invisible overlay to close dropdown when clicking outside */}
                          {isTimeDropdownOpen && (
                            <div className="fixed inset-0 z-40" onClick={() => setIsTimeDropdownOpen(false)}></div>
                          )}
                          
                          {isTimeDropdownOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-amber-100 rounded-xl shadow-xl overflow-hidden ring-1 ring-amber-900/5">
                              {['10:00 AM - 12:00 PM', '12:00 PM - 02:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM', '06:00 PM - 08:00 PM'].map(time => (
                                <div 
                                  key={time}
                                  className={`px-4 py-3 sm:py-2.5 cursor-pointer text-sm sm:text-base border-b border-amber-50 last:border-0 transition-colors ${requestData.requestedTime === time ? 'bg-amber-100 text-amber-900 font-bold' : 'text-[#5c4033] hover:bg-amber-50 active:bg-amber-100'}`}
                                  onClick={() => {
                                    handleRequestChange({ target: { name: 'requestedTime', value: time } });
                                    setIsTimeDropdownOpen(false);
                                  }}
                                >
                                  {time}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#5c4033] mb-1">Weight (e.g. 1kg) *</label>
                        <input type="text" name="weight" required value={requestData.weight} onChange={handleRequestChange} className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" placeholder="1 Kg" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#5c4033] mb-1">Flavour (Optional)</label>
                        <input type="text" name="flavour" value={requestData.flavour} onChange={handleRequestChange} className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" placeholder="e.g. Chocolate" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#5c4033] mb-1">Color Theme (Optional)</label>
                      <input type="text" name="color" value={requestData.color} onChange={handleRequestChange} className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" placeholder="e.g. Pink and White" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#5c4033] mb-1">Notes / Text on Cake (Optional)</label>
                      <textarea name="description" value={requestData.description} onChange={handleRequestChange} rows="3" className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none" placeholder="Any specific instructions or text to write on the cake..."></textarea>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                      <button type="button" onClick={() => setRequestModalOpen(false)} className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 bg-[#c37e50] text-white rounded-xl font-bold hover:bg-[#a0633b] transition-colors shadow-md disabled:opacity-50">
                        {isSubmitting ? 'Sending...' : 'Send Request'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}

        </div>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Gallery;
