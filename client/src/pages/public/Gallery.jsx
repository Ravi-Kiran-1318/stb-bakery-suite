import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import PageWrapper from '../../components/PageWrapper';
import Footer from '../../components/Footer';
import { CartContext } from '../../context/CartContext';
import { ToastContext } from '../../context/ToastContext';

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View states: 'categories' | 'cakes'
  const [viewState, setViewState] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const { addToCart } = useContext(CartContext);
  const { addToast } = useContext(ToastContext);
  const navigate = useNavigate();

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

  const handleAddToCart = (cake) => {
    const cartItem = {
      productId: cake._id,
      nameEN: cake.nameEN,
      nameTe: cake.nameTe,
      price: cake.price,
      imageUrl: cake.imageUrl,
      qty: 1
    };
    addToCart(cartItem);
    addToast(`${cake.nameEN} added to cart!`, 'success');
  };

  return (
    <PageWrapper>
      <div className="bg-[#fefaf3] min-h-screen pt-16 sm:pt-20 flex flex-col">
        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 w-full">
          
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
                              onClick={() => handleAddToCart(cake)}
                              className="bg-[#c37e50] hover:bg-[#a0633b] text-white p-1.5 sm:p-2 rounded-full shadow-md transition-colors transform hover:scale-105 active:scale-95"
                              title="Add to Cart"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
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

        </div>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Gallery;
