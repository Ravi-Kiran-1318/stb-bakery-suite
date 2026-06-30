import React from 'react';
import { Link } from 'react-router-dom';
import { FaCcVisa, FaCcMastercard, FaMobileAlt, FaWallet } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer 
      className="relative bg-[#fffdf7] text-[#5c3800] mt-12 border-t-[8px] border-[#f5d472]/30 bg-cover bg-center"
      style={{ backgroundImage: "url('/footer_bg.png')" }}
    >
      <div className="absolute inset-0 bg-[#fffdf7]/90 pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 md:pb-6">
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-y-10 gap-x-6 lg:gap-12">
          
          {/* Column 1: Brand */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-[#f5d472] to-[#c8922a] shadow-lg border border-[#c8922a]/30">
                <span className="text-xl">🪔</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-serif font-bold text-xl text-[#5c3800]">Sri Tirupathi</span>
                <span className="font-sans text-[0.65rem] text-[#c8922a] uppercase tracking-wider">Venkatachalapathi Bakery</span>
              </div>
            </Link>

            <p className="font-bold text-[#c8922a] mb-3 text-sm">
              Fresh from the oven — every single day. <span className="text-orange-400">♥</span>
            </p>
            <p className="text-xs leading-relaxed text-[#5c3800]/80 mb-6">
              We bring you the finest quality baked goodies made with pure ingredients, traditional recipes, and lots of love.
            </p>

            <div className="flex items-center gap-3">
              {['f', 'ig', 'wa', 'yt'].map((platform, idx) => (
                <a key={idx} href="#" className="w-8 h-8 rounded-full border border-[#c8922a] text-[#c8922a] flex items-center justify-center hover:bg-[#c8922a] hover:text-white transition-colors">
                  {platform === 'f' && <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>}
                  {platform === 'ig' && <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>}
                  {platform === 'wa' && <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>}
                  {platform === 'yt' && <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Our Services */}
          <div className="col-span-1 lg:border-l border-[#c8922a]/20 lg:pl-8">
            <h3 className="font-serif font-bold text-lg text-[#5c3800] mb-6 flex flex-col items-start relative">
              Our Services
              <div className="absolute -bottom-2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#c8922a] to-transparent flex items-center justify-center">
                <div className="w-1.5 h-1.5 rotate-45 bg-[#c8922a]" />
              </div>
            </h3>
            <ul className="space-y-4 text-sm font-medium mt-6">
              {[
                { label: 'Custom Cakes', icon: '🎂' },
                { label: 'Party Orders', icon: '🎉' },
                { label: 'Home Delivery', icon: '🛵' },
                { label: 'Bulk Orders', icon: '📦' },
                { label: 'Event Catering', icon: '🛎️' },
              ].map((service, idx) => (
                <li key={idx} className="flex items-center justify-start gap-3 hover:text-[#c8922a] transition-colors cursor-pointer">
                  <span className="text-[#c8922a] text-base">{service.icon}</span>
                  {service.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="col-span-1 lg:border-l border-[#c8922a]/20 lg:pl-8">
            <h3 className="font-serif font-bold text-lg text-[#5c3800] mb-6 flex flex-col items-start relative">
              Quick Links
              <div className="absolute -bottom-2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#c8922a] to-transparent flex items-center justify-center">
                <div className="w-1.5 h-1.5 rotate-45 bg-[#c8922a]" />
              </div>
            </h3>
            <ul className="space-y-4 text-sm font-medium mt-6">
              {['Home', 'About Us', 'Our Products', 'Cake Gallery', 'Contact Us'].map((link, idx) => (
                <li key={idx}>
                  <Link to={`/${link.toLowerCase().replace(' ', '-')}`} className="flex items-center justify-start gap-2 hover:text-[#c8922a] transition-colors">
                    <span className="text-[#c8922a]">→</span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="col-span-2 lg:col-span-1 lg:border-l border-[#c8922a]/20 lg:pl-8">
            <h3 className="font-serif font-bold text-lg text-[#5c3800] mb-6 flex flex-col items-center lg:items-start relative">
              Contact Us
              <div className="absolute -bottom-2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#c8922a] to-transparent flex items-center justify-center">
                <div className="w-1.5 h-1.5 rotate-45 bg-[#c8922a]" />
              </div>
            </h3>
            <ul className="space-y-5 text-sm mt-6">
              <li className="flex items-start justify-center lg:justify-start gap-3">
                <span className="text-[#c8922a] mt-0.5">📍</span>
                <span className="text-left">Yeleswaram,<br/>Andhra Pradesh, India</span>
              </li>
              <li className="flex items-center justify-center lg:justify-start gap-3">
                <span className="text-[#c8922a]">📞</span>
                <a href="tel:+918074381678" className="hover:text-[#c8922a]">8074381678</a>
              </li>
              <li className="flex items-center justify-center lg:justify-start gap-3">
                <span className="text-[#c8922a]">✉️</span>
                <a href="mailto:info@sritirupathibakery.com" className="hover:text-[#c8922a] truncate">info@sritirupathibakery.com</a>
              </li>
            </ul>
          </div>

          {/* Column 5: Stay Updated */}
          <div className="col-span-2 lg:col-span-1 lg:border-l border-[#c8922a]/20 lg:pl-8 flex flex-col items-center lg:items-start relative">
            <h3 className="font-serif font-bold text-lg text-[#5c3800] mb-6 flex flex-col items-center lg:items-start relative">
              Stay Updated
              <div className="absolute -bottom-2 w-12 h-[1px] bg-gradient-to-r from-transparent via-[#c8922a] to-transparent flex items-center justify-center">
                <div className="w-1.5 h-1.5 rotate-45 bg-[#c8922a]" />
              </div>
            </h3>
            <p className="text-xs text-center lg:text-left text-[#5c3800]/80 mb-4 mt-6">
              Subscribe to get updates on new products and exclusive offers.
            </p>
            <form className="flex w-full max-w-[250px] mx-auto lg:mx-0 relative mb-8 z-20" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-white border border-[#c8922a]/40 rounded-lg pl-3 pr-10 py-2.5 outline-none text-sm text-[#5c3800] placeholder-[#5c3800]/40 focus:border-[#c8922a]"
              />
              <button type="submit" className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center bg-orange-500 hover:bg-orange-600 rounded-md text-white transition-colors">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
              </button>
            </form>
            

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-[#c8922a]/20">
          <p className="text-xs text-[#5c3800]/80 font-medium">
            &copy; {new Date().getFullYear()} Sri Tirupathi Venkatachalapathi Bakery. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-[11px] md:text-xs font-bold text-[#c8922a] mt-4 md:mt-0">
            <span className="flex items-center gap-1"><FaCcVisa className="text-lg md:text-xl" /> VISA</span>
            <div className="w-1 h-1 rounded-full bg-[#c8922a]" />
            <span className="flex items-center gap-1"><FaCcMastercard className="text-lg md:text-xl" /> MASTERCARD</span>
            <div className="w-1 h-1 rounded-full bg-[#c8922a]" />
            <span className="flex items-center gap-1"><FaMobileAlt className="text-sm md:text-base" /> UPI</span>
            <div className="w-1 h-1 rounded-full bg-[#c8922a]" />
            <span className="flex items-center gap-1"><FaWallet className="text-sm md:text-base" /> PAYTM</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
