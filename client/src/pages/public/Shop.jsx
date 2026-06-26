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
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field max-w-xs"
              />
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="input-field max-w-xs"
              >
                <option value="default">Sort by: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
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
