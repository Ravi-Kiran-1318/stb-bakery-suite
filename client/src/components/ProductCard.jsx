import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatCurrency';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

const ProductCard = ({ product, showAdminControls, onEdit, onDelete }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'te' ? 'te' : 'en';
  const name = lang === 'te' && product.nameTe ? product.nameTe : product.nameEN;

  const { items, addToCart, updateQty } = useCart();
  const cartItem = items.find((i) => i.productId === product._id);
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(product._id);

  // 3D Hover Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 200);
    y.set(yPct * 200);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        perspective: 1000,
      }}
      className={`relative w-full ${!product.isAvailable ? 'opacity-60 grayscale-[0.5]' : ''}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(212, 175, 55, 0.4)' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="card flex flex-col h-full overflow-hidden transition-all duration-200 shadow-[0_4px_16px_rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.2)] rounded-xl"
      >
        <Link to={`/product/${product._id}`} className="block aspect-square overflow-hidden bg-surface relative">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
          )}
          
          {!product.isAvailable && (
            <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-md shadow">
              Unavailable
            </div>
          )}

          {product.isAvailable && product.isSpecial && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-md shadow font-bold flex items-center gap-1">
              ⭐ Special
            </div>
          )}

          {/* Heart Icon for Favorites */}
          {!showAdminControls && (
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevent navigating to product details
                toggleFavorite(product._id);
              }}
              className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
            >
              <svg 
                className={`w-5 h-5 transition-colors ${isFav ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                fill={isFav ? "currentColor" : "none"} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
          )}

          {showAdminControls && (
            <div className="absolute top-2 right-2 flex gap-2" onClick={(e) => e.preventDefault()}>
              <button onClick={() => onEdit(product)} className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors" title="Edit">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button onClick={() => onDelete(product._id)} className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </Link>

        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <h3 className="text-sm sm:text-lg font-bold text-dark leading-tight mb-1 flex-grow line-clamp-2">{name}</h3>
          
          {(product.weight || (showAdminControls && product.quantity !== undefined)) && (
            <div className="flex items-center gap-2 mb-2 text-xs font-medium">
              {product.weight && <span className="text-muted bg-slate-100 px-2 py-0.5 rounded">{product.weight}</span>}
              {showAdminControls && product.quantity !== undefined && (
                <span className={`px-2 py-0.5 rounded ${product.quantity > 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                  Stock: {product.quantity}
                </span>
              )}
            </div>
          )}
          
          <div className="flex flex-wrap items-center justify-between mt-auto pt-3 border-t border-border gap-2">
            <span className="text-sm sm:text-xl font-bold text-accent pr-1">
              {formatCurrency(cartItem ? product.price * cartItem.qty : product.price)}
            </span>
            {product.isAvailable && !showAdminControls && (
              cartItem ? (
                <div className="flex items-center gap-1 sm:gap-3 bg-gray-50 rounded-lg p-0.5 sm:p-1 border border-amber-200/50 shadow-sm">
                  <button onClick={() => updateQty(product._id, cartItem.qty - 1)} className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center transition-colors hover:bg-white" style={{ color: '#D4AF37' }}>-</button>
                  <span className="font-bold text-dark text-xs sm:text-sm w-4 sm:w-6 text-center">{cartItem.qty}</span>
                  <button onClick={() => updateQty(product._id, cartItem.qty + 1)} className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center font-bold text-white shadow-sm" style={{ background: '#D4AF37' }}>+</button>
                </div>
              ) : (
                <button 
                  onClick={() => addToCart(product)}
                  className="flex items-center justify-center p-2 sm:py-1.5 sm:px-4 rounded-lg transition-all hover:scale-105 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #c8922a 100%)', color: '#1a0a00' }}
                  title="Add to Cart"
                >
                  {/* Text for larger screens */}
                  <span className="hidden sm:inline-block text-sm font-bold">Add to Cart</span>
                  {/* Icon for mobile screens */}
                  <svg className="w-4 h-4 sm:hidden stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </button>
              )
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductCard;
