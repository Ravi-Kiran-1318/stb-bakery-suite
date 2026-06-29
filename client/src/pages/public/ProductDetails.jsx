import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../utils/axiosInstance';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import ProductCard from '../../components/ProductCard';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { items, addToCart, updateQty } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const lang = i18n.language === 'te' ? 'te' : 'en';

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        // Fetch all products to find this one and related ones
        // In a very large app, we would use a dedicated GET /api/products/:id endpoint
        const response = await api.get('/products');
        const allProducts = response.data;
        
        const currentProduct = allProducts.find(p => p._id === id);
        
        if (!currentProduct) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        setProduct(currentProduct);

        // Filter out current product and optionally filter by category
        let related = allProducts.filter(p => p._id !== id && p.isAvailable);
        
        // Try to show same category first, if we have enough
        const sameCategory = related.filter(p => p.category === currentProduct.category);
        if (sameCategory.length >= 4) {
          related = sameCategory;
        }

        // Shuffle and pick 4
        related = related.sort(() => 0.5 - Math.random()).slice(0, 4);
        setRelatedProducts(related);

      } catch (err) {
        console.error('Failed to fetch product details:', err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    // Scroll to top when the ID changes (so if user clicks a related product, it scrolls up)
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h2 className="text-3xl font-bold text-accent mb-4">{error || 'Product not found'}</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary py-2 px-6 rounded-lg">
          Back to Shop
        </button>
      </div>
    );
  }

  const name = lang === 'te' && product.nameTe ? product.nameTe : product.nameEN;
  const description = lang === 'te' && product.descriptionTe ? product.descriptionTe : product.descriptionEN;
  
  const cartItem = items.find((i) => i.productId === product._id);

  return (
    <div className="min-h-screen pt-16 md:pt-24 pb-16 md:pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      
      {/* Breadcrumbs */}
      <nav className="text-muted text-xs sm:text-sm mb-6 md:mb-8">
        <Link to="/" className="hover:text-accent transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-accent truncate">{name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-12 mb-12 md:mb-20">
        
        {/* Left Side: Large Image */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full sm:w-3/4 md:w-1/2 lg:w-5/12 max-w-md mx-auto md:mx-0"
        >
          <div className="rounded-xl md:rounded-2xl overflow-hidden shadow-[0_5px_15px_rgba(212,175,55,0.15)] md:shadow-[0_10px_30px_rgba(212,175,55,0.2)] border border-[rgba(212,175,55,0.3)] bg-surface relative">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={name} 
                className="w-full h-auto max-h-[500px] object-contain block"
              />
            ) : (
              <div className="text-muted text-xl p-12 text-center">No Image Available</div>
            )}
            {!product.isAvailable && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-3xl font-bold text-white tracking-widest uppercase border-4 border-white py-2 px-6 rounded-lg rotate-12 opacity-80">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Side: Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-1/2 flex flex-col justify-center"
        >
          <span className="text-[10px] sm:text-sm font-semibold tracking-widest text-muted uppercase mb-1 md:mb-2 block">
            {product.category}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark mb-2 md:mb-3 leading-tight">
            {name}
          </h1>
          
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-accent mb-4 md:mb-6">
            {formatCurrency(product.price)}
          </div>

          <p className="text-xs sm:text-lg text-muted mb-6 md:mb-8 leading-relaxed line-clamp-3 md:line-clamp-none">
            {description || 'No detailed description available for this item.'}
          </p>

          <div className="pt-4 md:pt-6 border-t border-border">
            {product.isAvailable ? (
              cartItem ? (
                <div className="flex flex-col gap-2 md:gap-4">
                  <span className="text-muted text-xs md:text-sm">Quantity in Cart</span>
                  <div className="flex items-center gap-3 md:gap-6">
                    <button 
                      onClick={() => updateQty(product._id, cartItem.qty - 1)} 
                      className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl transition-all hover:bg-white/10" 
                      style={{ border: '2px solid rgba(212,175,55,0.4)', color: '#D4AF37' }}
                    >
                      -
                    </button>
                    <span className="font-bold text-dark text-lg md:text-2xl w-6 md:w-8 text-center">{cartItem.qty}</span>
                    <button 
                      onClick={() => updateQty(product._id, cartItem.qty + 1)} 
                      className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                      style={{ background: '#D4AF37', color: '#1a0a00' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full md:w-auto py-3 md:py-4 px-6 md:px-10 text-base md:text-lg font-bold rounded-xl md:rounded-xl transition-all hover:scale-105 shadow-[0_5px_15px_rgba(212,175,55,0.3)]"
                  style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #c8922a 100%)', color: '#1a0a00' }}
                >
                  Add to Cart
                </button>
              )
            ) : (
              <button disabled className="w-full md:w-auto py-4 px-10 text-lg font-bold rounded-xl bg-gray-600 text-gray-300 cursor-not-allowed">
                Currently Unavailable
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-10 md:pt-12 border-t border-border mt-10 md:mt-12"
        >
          <h2 className="text-xl md:text-3xl font-bold text-dark mb-4 md:mb-8 text-center">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default ProductDetails;
