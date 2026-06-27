import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { useFavorites } from '../../context/FavoritesContext';
import ProductCard from '../../components/ProductCard';
import Loader from '../../components/Loader';

const FavoritesTab = () => {
  const { favoriteIds } = useFavorites();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        // In a real app we might have a specific endpoint or pass IDs as a query,
        // but fetching all available products and filtering is fine for this scale.
        const { data } = await axiosInstance.get('/products');
        
        const filtered = data.filter(product => favoriteIds.includes(product._id));
        setFavoriteProducts(filtered);
      } catch (error) {
        console.error('Failed to fetch favorite products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favoriteIds]);

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">My Favorites ❤️</h2>
      
      {favoriteProducts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm"
        >
          <div className="text-6xl mb-6 text-red-400">🤍</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">No favorites yet.</h3>
          <p className="text-gray-500 mb-8">Tap the heart icon on any product to save it here for later!</p>
          <Link 
            to="/shop" 
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-8 rounded-full transition-colors"
          >
            Explore Menu &rarr;
          </Link>
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
          {favoriteProducts.map(product => (
            <motion.div 
              key={product._id} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default FavoritesTab;
