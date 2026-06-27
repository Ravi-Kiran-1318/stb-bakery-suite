import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../../components/ProductCard';
import PageWrapper from '../../components/PageWrapper';
import Footer from '../../components/Footer';
import axiosInstance from '../../utils/axiosInstance';
import { useCart } from '../../context/CartContext';

const CATEGORIES = ['All', 'Bread', 'Bun', 'Cake', 'Pastry', 'Snacks', 'Beverages', 'Other'];

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axiosInstance.get('/products');
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setToastMessage('✓ Added to cart');
    setTimeout(() => setToastMessage(''), 2000);
  };

  // Filter and Sort Logic
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (product.nameEN && product.nameEN.toLowerCase().includes(searchLower)) ||
      (product.nameTe && product.nameTe.toLowerCase().includes(searchLower));
    
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortOrder === 'price-low') return a.price - b.price;
    if (sortOrder === 'price-high') return b.price - a.price;
    return 0; // default
  });

  const fadeUpItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <PageWrapper>
      <div className="bg-white min-h-screen pt-16 flex flex-col">
        
        {/* Main Content Area */}
        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          
          <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <h1 className="text-4xl font-serif font-bold text-gray-900">Our Menu</h1>
            
            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-amber-500">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search our menu..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-gray-100 rounded-full focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Custom Sort Dropdown */}
              <div className="relative w-full sm:w-56 group">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="w-full pl-5 pr-10 py-2.5 bg-white border-2 border-gray-100 rounded-full focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm text-gray-700 font-medium text-left flex items-center justify-between"
                >
                  <span className="truncate">
                    {sortOrder === 'default' ? 'Sort: Recommended' : sortOrder === 'price-low' ? 'Price: Low to High' : 'Price: High to Low'}
                  </span>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isSortOpen ? 'rotate-180 text-amber-500' : 'group-focus-within:text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isSortOpen && (
                  <>
                    {/* Invisible backdrop to close dropdown when clicking outside */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)}></div>
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-1">
                      {[
                        { value: 'default', label: 'Sort: Recommended' },
                        { value: 'price-low', label: 'Price: Low to High' },
                        { value: 'price-high', label: 'Price: High to Low' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortOrder(option.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3 transition-colors ${
                            sortOrder === option.value
                              ? 'bg-amber-50 text-amber-700 font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter Bar */}
          <div className="flex overflow-x-auto pb-4 mb-8 gap-3 hide-scrollbar">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold transition-all ${
                  activeCategory === category 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-amber-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-700">No products found.</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or category filter.</p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
              initial="hidden"
              animate="show"
              variants={{
                show: { transition: { staggerChildren: 0.05 } }
              }}
            >
              {filteredProducts.map(product => (
                <motion.div key={product._id} variants={fadeUpItem}>
                  <ProductCard 
                    product={product} 
                    onAddToCart={handleAddToCart}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

        </div>

        <Footer />

        {/* Toast Notification */}
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 font-semibold"
          >
            {toastMessage}
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Shop;
