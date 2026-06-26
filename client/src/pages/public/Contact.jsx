import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import PageWrapper from '../../components/PageWrapper';
import Footer from '../../components/Footer';
import WhatsAppButton from '../../components/WhatsAppButton';
import { useTranslation } from 'react-i18next';

// Fix for default Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Contact = () => {
  const { t } = useTranslation();
  
  // Coordinates from env or fallback to a default location in Tirupati
  const shopLat = parseFloat(import.meta.env.VITE_SHOP_LAT) || 13.6288;
  const shopLng = parseFloat(import.meta.env.VITE_SHOP_LNG) || 79.4192;
  const shopWhatsApp = import.meta.env.VITE_SHOP_WHATSAPP || '+910000000000';

  return (
    <PageWrapper>
      <div className="bg-white min-h-screen pt-16 flex flex-col">
        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4"
            >
              Get in Touch
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              We'd love to hear from you. Visit our bakery or message us directly on WhatsApp for orders and inquiries.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* Left: Find Us */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-10"
            >
              <div>
                <WhatsAppButton label="Contact Us on WhatsApp" className="!px-6 !py-3 !rounded-xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Find Us</h2>
                
                <div className="space-y-4 text-gray-700 text-lg">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl mt-1">📍</span>
                    <div>
                      <p className="font-bold text-gray-900">{t('common.bakeryName')}</p>
                      <p>Tirupati,</p>
                      <p>Andhra Pradesh, India</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">📞</span>
                    <p>{shopWhatsApp}</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🕒</span> Opening Hours
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex justify-between">
                    <span>Monday &ndash; Saturday</span>
                    <span className="font-semibold">7:00 AM &ndash; 9:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold text-amber-600">8:00 AM &ndash; 6:00 PM</span>
                  </li>
                </ul>
              </div>

              <div>
                <WhatsAppButton message="Hi! I have an inquiry." />
              </div>
            </motion.div>

            {/* Right: Map */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 z-0"
            >
              <MapContainer 
                center={[shopLat, shopLng]} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[shopLat, shopLng]}>
                  <Popup>
                    <strong className="text-gray-900">{t('common.bakeryName')} 🎂</strong><br/>
                    Baked fresh every day.
                  </Popup>
                </Marker>
              </MapContainer>
            </motion.div>

          </div>
        </div>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Contact;
