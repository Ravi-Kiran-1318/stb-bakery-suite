import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatCurrency';

const ProductCard = ({ product, onAddToCart, showAdminControls, onEdit, onDelete }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'te' ? 'te' : 'en';
  const name = lang === 'te' && product.nameTe ? product.nameTe : product.nameEN;

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
        whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.3)' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="card flex flex-col h-full overflow-hidden transition-all duration-200"
      >
        <div className="h-48 overflow-hidden bg-surface relative">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
          )}
          
          {!product.isAvailable && (
            <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-md shadow">
              Unavailable
            </div>
          )}

          {showAdminControls && (
            <div className="absolute top-2 right-2 flex gap-2">
              <button onClick={() => onEdit(product)} className="bg-white text-blue-600 p-1.5 rounded shadow hover:bg-blue-50">
                ✏️
              </button>
              <button onClick={() => onDelete(product._id)} className="bg-white text-red-600 p-1.5 rounded shadow hover:bg-red-50">
                🗑️
              </button>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            {product.category}
          </span>
          <h3 className="text-lg font-bold text-dark leading-tight mb-2 flex-grow">{name}</h3>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
            <span className="text-xl font-bold text-accent">{formatCurrency(product.price)}</span>
            {product.isAvailable && onAddToCart && (
              <button 
                onClick={() => onAddToCart(product)}
                className="btn-primary py-1.5 px-3 text-sm"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductCard;
