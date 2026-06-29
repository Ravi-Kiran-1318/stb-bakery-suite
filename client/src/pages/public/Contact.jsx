import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/PageWrapper';
import Footer from '../../components/Footer';
import WhatsAppButton from '../../components/WhatsAppButton';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  
  const shopWhatsApp = import.meta.env.VITE_SHOP_WHATSAPP || '+918074381678';

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
                      <p className="font-bold text-gray-900">Sri Tirupathi Venkatachalapathi Bakery</p>
                      <p>Yeleswaram,</p>
                      <p>Andhra Pradesh, India</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">📞</span>
                    <p>{shopWhatsApp}</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🕒</span> Opening Hours
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex justify-between">
                    <span>Monday &ndash; Sunday</span>
                    <span className="font-semibold text-amber-700">9:00 AM &ndash; 9:00 PM</span>
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
              className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 z-0 bg-gray-100 relative"
            >
              <iframe 
                title="Google Maps Bakery Location"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                loading="lazy" 
                allowFullScreen 
                src="https://maps.google.com/maps?q=Sri%20Tirupathi%20Venkatachalapathi%20Bakery,%20Yeleswaram&t=&z=16&ie=UTF8&iwloc=&output=embed"
              ></iframe>
            </motion.div>

          </div>
        </div>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Contact;
