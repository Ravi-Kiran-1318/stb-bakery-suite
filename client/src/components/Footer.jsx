import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const decorativeSeparator = (
    <div className="flex items-center justify-center gap-2 my-5 opacity-80">
      <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
      <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
    </div>
  );

  const leftSeparator = (
    <div className="flex items-center justify-start gap-2 my-5 opacity-80">
      <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#D4AF37]" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#D4AF37]" />
    </div>
  );

  return (
    <footer
      className="relative text-white mt-12"
      style={{
        backgroundImage: "url('/fbg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      {/* ── Overlay to darken the background ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(5,2,1,0.96) 0%, rgba(8,4,1,0.85) 40%, rgba(4,2,0,0.98) 100%)',
        }}
      />

      <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-20 pt-16 md:pt-24 pb-6">
        
        {/* ════════════════════════════════════════════
            TOP SECTION: LEFT & RIGHT COLUMNS
        ════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-0">
          
          {/* ── LEFT COLUMN ── */}
          <div className="w-full lg:max-w-[380px] text-center lg:text-left">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center justify-center lg:justify-start gap-4 mb-2">
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #f5d472 0%, #c8922a 60%, #5c3800 100%)',
                  boxShadow: '0 0 20px rgba(212,175,55,0.3)',
                  border: '1.5px solid rgba(212,175,55,0.6)',
                }}
              >
                <span className="text-2xl md:text-3xl leading-none">🪔</span>
              </div>
              <div className="flex flex-col text-left leading-none">
                <span
                  className="font-serif font-bold tracking-wide"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 1.9rem)', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                >
                  Sri Tirupathi
                </span>
                <span
                  className="font-sans mt-1"
                  style={{ fontSize: '0.75rem', color: '#D4AF37', letterSpacing: '0.08em' }}
                >
                  Venkatachalapathi Bakery
                </span>
              </div>
            </Link>

            <div className="hidden lg:block">{leftSeparator}</div>
            <div className="lg:hidden">{decorativeSeparator}</div>

            {/* Description */}
            <p className="font-bold text-[#EFDBB2] mb-3 text-[1.05rem]">
              Fresh from the oven — every single day.
            </p>
            <p className="text-[0.9rem] leading-[1.8] text-[rgba(235,220,190,0.7)] mb-8">
              We bring you the finest quality baked goodies made with pure ingredients,
              traditional recipes, and lots of love.
            </p>

            {/* Social Icons */}
            <div className="flex items-center justify-center lg:justify-start gap-4">
              {['f', 'ig', 'wa', 'yt'].map((platform, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 hover:bg-[#D4AF37]/10"
                  style={{ border: '1px solid rgba(212,175,55,0.5)', color: '#D4AF37' }}
                >
                  {/* Dummy icons - will replace with real ones later */}
                  {platform === 'f' && (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
                  )}
                  {platform === 'ig' && (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  )}
                  {platform === 'wa' && (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  )}
                  {platform === 'yt' && (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="w-full lg:max-w-[420px]">
            
            {/* Get In Touch */}
            <div className="mb-10 text-center lg:text-left">
              <h3 className="font-serif text-[1.4rem] font-bold text-[#D4AF37] mb-1">Get In Touch</h3>
              <div className="hidden lg:block">{leftSeparator}</div>
              <div className="lg:hidden">{decorativeSeparator}</div>
              
              <ul className="space-y-5">
                <li className="flex items-start justify-center lg:justify-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-[#D4AF37]/40 text-[#D4AF37]">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.069-3.769-6.665-6.665l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                  </div>
                  <div className="flex flex-col mt-0.5">
                    <a href="tel:+919876543210" className="text-[0.95rem] text-[rgba(235,220,190,0.85)] hover:text-[#D4AF37] transition-colors">+91 98765 43210</a>
                  </div>
                </li>
                
                <li className="flex items-start justify-center lg:justify-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-[#D4AF37]/40 text-[#D4AF37]">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  </div>
                  <div className="flex flex-col mt-0.5">
                    <a href="mailto:info@srtirupathibakery.com" className="text-[0.95rem] text-[rgba(235,220,190,0.85)] hover:text-[#D4AF37] transition-colors">info@srtirupathibakery.com</a>
                  </div>
                </li>

                <li className="flex items-start justify-center lg:justify-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-[#D4AF37]/40 text-[#D4AF37]">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  </div>
                  <div className="flex flex-col mt-0.5 text-left max-w-[240px]">
                    <span className="text-[0.95rem] leading-[1.6] text-[rgba(235,220,190,0.85)]">
                      Tiruchanoor Road,<br />Tirupati, Andhra Pradesh - 517501
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent my-8 lg:hidden" />

            {/* Stay Updated */}
            <div className="text-center lg:text-left">
              <h3 className="font-serif text-[1.4rem] font-bold text-[#D4AF37] mb-1">Stay Updated</h3>
              <div className="hidden lg:block">{leftSeparator}</div>
              <div className="lg:hidden">{decorativeSeparator}</div>
              
              <p className="text-[0.9rem] leading-[1.6] text-[rgba(235,220,190,0.7)] mb-5">
                Subscribe to get updates on new products and exclusive offers.
              </p>
              
              <form className="flex w-full relative" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full bg-[rgba(6,3,1,0.6)] border border-[#D4AF37]/40 rounded-lg pl-4 pr-14 py-3 outline-none text-[#EFDBB2] placeholder-[#EFDBB2]/40 focus:border-[#D4AF37] transition-colors"
                />
                <button 
                  type="submit" 
                  className="absolute right-1 top-1 bottom-1 w-12 flex items-center justify-center bg-gradient-to-r from-[#D4AF37] to-[#b8860b] rounded-md text-black hover:scale-[1.03] transition-transform"
                >
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 -rotate-45 ml-1"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                </button>
              </form>
            </div>
            
          </div>
        </div>

        {/* ════════════════════════════════════════════
            MIDDLE SECTION: FEATURES BAR
        ════════════════════════════════════════════ */}
        <div className="mt-16 md:mt-24 border border-[#D4AF37]/30 rounded-2xl bg-[rgba(10,5,2,0.4)] backdrop-blur-md p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#D4AF37]/20 [&>div]:pt-4 md:[&>div]:pt-0 md:[&>div]:px-2 first:[&>div]:pt-0">
            
            <div className="flex items-center gap-3 md:flex-col md:text-center xl:flex-row xl:text-left justify-center lg:justify-start">
              <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" className="w-8 h-8 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8m0 0a4.5 4.5 0 00-4.5-4.5h-.75M12 13a4.5 4.5 0 014.5-4.5h.75m-9 9a4.5 4.5 0 00-4.5-4.5h-.75M12 17a4.5 4.5 0 014.5-4.5h.75" /></svg>
              <div>
                <p className="text-[0.75rem] md:text-[0.8rem] text-[#EFDBB2]">Pure Ingredients</p>
                <p className="text-[0.65rem] md:text-[0.7rem] text-[#D4AF37]/70">Always Fresh</p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:flex-col md:text-center xl:flex-row xl:text-left justify-center lg:justify-start">
              <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" className="w-8 h-8 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M14 22h5M14 26h9M8 17h24M8 12h24v6H8z" /></svg>
              <div>
                <p className="text-[0.75rem] md:text-[0.8rem] text-[#EFDBB2]">Hygienic & Safe</p>
                <p className="text-[0.65rem] md:text-[0.7rem] text-[#D4AF37]/70">Quality Assured</p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:flex-col md:text-center xl:flex-row xl:text-left justify-center lg:justify-start">
              <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" className="w-8 h-8 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
              <div>
                <p className="text-[0.75rem] md:text-[0.8rem] text-[#EFDBB2]">Fast & Reliable</p>
                <p className="text-[0.65rem] md:text-[0.7rem] text-[#D4AF37]/70">Delivery</p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:flex-col md:text-center xl:flex-row xl:text-left justify-center lg:justify-start">
              <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" className="w-8 h-8 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
              <div>
                <p className="text-[0.75rem] md:text-[0.8rem] text-[#EFDBB2]">Made with Love</p>
                <p className="text-[0.65rem] md:text-[0.7rem] text-[#D4AF37]/70">and Devotion</p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:flex-col md:text-center xl:flex-row xl:text-left justify-center lg:justify-start">
              <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" className="w-8 h-8 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25m18 0v-2.25a1.5 1.5 0 00-1.5-1.5h-3.75m3.75 3.75H3m18 0h-3.75m-10.5 0h-3.75m3.75 0V7.5a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v3.75m-6 0h6" /></svg>
              <div>
                <p className="text-[0.75rem] md:text-[0.8rem] text-[#EFDBB2]">Custom Cakes</p>
                <p className="text-[0.65rem] md:text-[0.7rem] text-[#D4AF37]/70">for Every Occasion</p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:flex-col md:text-center xl:flex-row xl:text-left justify-center lg:justify-start">
              <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" className="w-8 h-8 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
              <div>
                <p className="text-[0.75rem] md:text-[0.8rem] text-[#EFDBB2]">100% Customer</p>
                <p className="text-[0.65rem] md:text-[0.7rem] text-[#D4AF37]/70">Satisfaction</p>
              </div>
            </div>

          </div>
        </div>

        {/* ════════════════════════════════════════════
            BOTTOM SECTION: COPYRIGHT & PAYMENTS
        ════════════════════════════════════════════ */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <div className="text-[#D4AF37] opacity-80">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5zM12 9l-3 6h6l-3-6z" /></svg>
            </div>
            <p className="text-[0.8rem] text-[#EFDBB2]/80">
              &copy; {new Date().getFullYear()} Sri Tirupathi Venkatachalapathi Bakery. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[#EFDBB2]/60 font-bold tracking-wider text-[0.7rem]">
            <span>VISA</span>
            <span>MASTERCARD</span>
            <span>UPI</span>
            <span>PAYTM</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
