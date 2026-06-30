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
      <div 
        className="min-h-screen pt-4 flex flex-col bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/contact_bg.png')" }}
      >
        <div className="flex-grow max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-12 py-8 w-full backdrop-blur-[1px] bg-white/70">
          
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2"
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
              className="space-y-6"
            >
              <div>
                <WhatsAppButton message="Hi! I have an inquiry." className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-full shadow-md flex items-center justify-center gap-2 w-max" label="Contact Us on WhatsApp" />
              </div>
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Us</h2>
                
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

              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🕒</span> Opening Hours
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex justify-between">
                    <span>Monday &ndash; Sunday</span>
                    <span className="font-semibold text-amber-700">9:00 AM &ndash; 9:00 PM</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Right: Map */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full h-[350px] rounded-3xl overflow-hidden shadow-xl border-4 border-amber-100 z-0 bg-gray-100 relative"
            >
              <iframe 
                src="https://maps.google.com/maps?q=Sri%20Tirupathi%20Venkatachalapathi%20Bakery,%20Yeleswaram&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=13.6288,79.4184646"
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute top-4 left-4 bg-white px-4 py-2.5 rounded-lg shadow-lg font-bold text-blue-600 flex items-center gap-2 hover:bg-gray-50 transition-colors z-10"
              >
                Open in Maps <span className="text-lg">↗</span>
              </a>
            </motion.div>

          </div>
        </div>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Contact;
