import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();
  const SHOP_WHATSAPP = import.meta.env.VITE_SHOP_WHATSAPP || '+910000000000';

  return (
    <footer className="bg-gray-900 text-white py-10 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-2xl mb-4 font-bold tracking-wider">
              {t('common.bakeryName')}
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              Fresh from the oven — every single day.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-amber-500">Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-amber-500">Contact Us</h4>
            <p className="text-gray-400 text-sm mb-2">
              Tirupati, Andhra Pradesh, India
            </p>
            <p className="text-gray-400 text-sm mb-2">
              WhatsApp: {SHOP_WHATSAPP}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Sri Tirupati Venkatachalapathy Bakery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
