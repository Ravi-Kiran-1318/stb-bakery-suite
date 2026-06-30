import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import WhatsAppButton from '../../components/WhatsAppButton';
import Footer from '../../components/Footer';
import PageWrapper from '../../components/PageWrapper';
import axiosInstance from '../../utils/axiosInstance';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  const [lovedProducts, setLovedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axiosInstance.get('/products');
        // Filter out loved products
        const loved = data.filter(p => p.isAvailable && p.isLoved);
        setLovedProducts(loved.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch loved products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.09 } },
  };
  const itemVariant = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] } },
  };

  const sidebarCategories = [
    { icon: '🎂', label: 'Cakes' },
    { icon: '🍪', label: 'Cookies' },
    { icon: '🎉', label: 'Party items' },
    { icon: '🎈', label: 'Decoration items' },
  ];

  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          <path d="M12 21C16.4183 21 20 17.4183 20 13C20 9.5 12 3 12 3C12 3 4 9.5 4 13C4 17.4183 7.58172 21 12 21Z" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 17C10.8954 17 10 16.1046 10 15" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      label: '100% Pure', sub: 'Ingredients',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 9V5" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 19V15" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12H5" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 12H15" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.87868 9.87868L7.05025 7.05025" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.9497 16.9497L14.1213 14.1213" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.9497 7.05025L14.1213 9.87868" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.87868 14.1213L7.05025 16.9497" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: 'Hygienic', sub: 'Preparation',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          <path d="M6 10H18V18C18 19.1046 17.1046 20 16 20H8C6.89543 20 6 19.1046 6 18V10Z" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 10C9 10 9 6 12 6C15 6 15 10 15 10" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="15" r="2" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: 'Freshly Baked', sub: 'Everyday',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          <rect x="3" y="10" width="10" height="9" rx="1" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13 10H17L21 14V19H13" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="7" cy="19" r="2" stroke="#b46a36" strokeWidth="1.5"/>
          <circle cx="17" cy="19" r="2" stroke="#b46a36" strokeWidth="1.5"/>
          <path d="M5 6H9" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M3 8H10" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      label: 'On-Time', sub: 'Delivery',
    },
  ];

  return (
    <PageWrapper>
      <div className="bg-[#fefaf3] min-h-screen">

        {/* ═══════════════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════════════ */}
        <div
          className="relative w-full"
          style={{
            minHeight: '85svh',
            backgroundImage: "url('/bg3.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* ── Gradient overlay for readability ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: [
                'linear-gradient(to top, rgba(254,250,243,1) 0%, rgba(254,250,243,0.0) 15%)',
                'linear-gradient(105deg, rgba(254,250,243,0.85) 0%, rgba(254,250,243,0.5) 40%, rgba(254,250,243,0.1) 65%, rgba(0,0,0,0.0) 100%)',
              ].join(', '),
            }}
          />

          <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-20 flex flex-col lg:flex-row items-center lg:items-center min-h-[85svh] py-16 lg:py-0">

            {/* ────────────────────────────────────
                LEFT / MAIN CONTENT
            ──────────────────────────────────── */}
            <motion.div
              className="flex flex-col w-full lg:max-w-[600px] text-center lg:text-left"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {/* Tagline */}
              <motion.div
                variants={itemVariant}
                className="flex items-center justify-center lg:justify-start gap-3 mb-4"
              >
                <div className="flex items-center opacity-80">
                  <svg viewBox="0 0 50 16" className="w-10 h-3" fill="none">
                    <path d="M0 8h50" stroke="#b46a36" strokeWidth="1" />
                    <path d="M15 4l4 4-4 4M21 4l4 4-4 4M27 4l4 4-4 4" stroke="#b46a36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-sans uppercase tracking-[0.15em] text-[9px] sm:text-[10px] font-bold" style={{ color: '#b46a36' }}>
                  BAKED WITH LOVE, SERVED WITH DEVOTION
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={itemVariant}
                className="font-serif font-bold leading-[1.05] mb-4"
                style={{
                  fontSize: 'clamp(2.8rem, 5.5vw, 4.2rem)',
                  color: '#2d170a',
                  letterSpacing: '-0.02em',
                }}
              >
                Freshly Baked,<br/>
                <span style={{ color: '#c37e50', fontStyle: 'italic' }}>
                  Deliciously Yours
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={itemVariant}
                className="mb-8 leading-relaxed mx-auto lg:mx-0 font-normal"
                style={{
                  fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
                  color: '#6e5a4f',
                  maxWidth: '480px',
                }}
              >
                Experience the perfect blend of tradition, quality,
                and flavor in every bite.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariant}
                className="flex flex-col sm:flex-row flex-wrap items-center lg:items-start justify-center lg:justify-start gap-4 mb-10"
              >
                <Link
                  to="/shop"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 font-medium rounded-[2rem] transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    padding: '10px 28px',
                    fontSize: '0.95rem',
                    background: '#b46a36',
                    color: '#ffffff',
                    border: 'none',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Order Online &rarr;
                </Link>

                <button
                  onClick={() => document.getElementById('loved-products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 font-medium rounded-[2rem] transition-all duration-200 hover:bg-[#b46a36]/5 active:scale-95 bg-transparent"
                  style={{
                    padding: '9px 28px',
                    fontSize: '0.95rem',
                    border: '1px solid #b46a36',
                    color: '#4e2815',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Explore Our Products
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-[#4e2815]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                  </svg>
                </button>

                <Link
                  to="/customer/dashboard?tab=customcakes"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 font-medium rounded-[2rem] transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                  style={{
                    padding: '9px 28px',
                    fontSize: '0.95rem',
                    background: '#fefaf3',
                    border: '1px solid #c37e50',
                    color: '#b46a36',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                  Customize & Order your cake
                </Link>
              </motion.div>

              {/* Feature Icons - Horizontal Row */}
              <motion.div
                variants={itemVariant}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-2"
              >
                {features.map((f, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 bg-white/85 backdrop-blur-sm rounded-full pr-5 pl-1.5 py-1.5 shadow-sm border border-white/50 w-[170px]"
                  >
                    <div
                      className="relative flex items-center justify-center rounded-full border border-[#d6bda5] bg-white flex-shrink-0 shadow-sm"
                      style={{ width: 42, height: 42 }}
                    >
                      <div className="absolute inset-0 rounded-full border border-[#f0e4d8] m-[2px]" />
                      <div className="relative z-10 text-[#7a482b]">
                        {f.icon}
                      </div>
                    </div>
                    <div className="flex flex-col text-left py-0.5">
                      <span className="text-[12px] font-bold leading-tight" style={{ color: '#4e2815' }}>{f.label}</span>
                      <span className="text-[10px] font-medium leading-tight mt-0.5" style={{ color: '#8a6e5d' }}>{f.sub}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ── DESKTOP SPACER ── */}
            <div className="flex-1 hidden lg:block" />

            {/* ────────────────────────────────────
                SIDEBAR CATEGORIES
            ──────────────────────────────────── */}
            <motion.div
              className="hidden lg:flex flex-col gap-3 flex-shrink-0"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.45, ease: 'easeOut' }}
            >
              {sidebarCategories.map((cat, i) => {
                const slug = cat.label.toLowerCase().replace(/\s+/g, '-');
                const linkPath = (slug === 'party-items' || slug === 'decoration-items') 
                  ? `/party-decorations?category=${slug}` 
                  : `/shop?category=${slug}`;
                
                return (
                  <Link
                    key={i}
                    to={linkPath}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-200 hover:scale-105 group bg-white shadow-sm border border-[#eae0d5]"
                    style={{
                      padding: '16px 14px',
                      minWidth: 84,
                      textDecoration: 'none',
                    }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full text-2xl transition-colors group-hover:bg-[#b56d36]/10"
                      style={{ width: 44, height: 44, background: 'rgba(181,109,54,0.08)' }}
                    >
                      {cat.icon}
                    </div>
                    <span className="text-xs font-bold text-center leading-tight" style={{ color: '#4e2815' }}>
                      {cat.label}
                    </span>
                  </Link>
                );
              })}
            </motion.div>

            {/* Mobile/Tablet horizontal category strip */}
            <div className="lg:hidden relative w-full pt-6 pb-8">
              <style>{`
                .hide-scrollbar {
                  -ms-overflow-style: none;  /* IE and Edge */
                  scrollbar-width: none;  /* Firefox */
                }
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <motion.div
                className="flex flex-row gap-3 overflow-x-auto justify-start w-full hide-scrollbar snap-x px-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
              {sidebarCategories.map((cat, i) => {
                const slug = cat.label.toLowerCase().replace(/\s+/g, '-');
                const linkPath = (slug === 'party-items' || slug === 'decoration-items') 
                  ? `/party-decorations?category=${slug}` 
                  : `/shop?category=${slug}`;
                
                return (
                  <Link
                    key={i}
                    to={linkPath}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl transition-all duration-200 active:scale-95 bg-white shadow-sm border border-[#eae0d5]"
                    style={{
                      padding: '12px 6px',
                      width: 84,
                      height: 90,
                      textDecoration: 'none',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full text-xl"
                      style={{ width: 38, height: 38, background: 'rgba(181,109,54,0.08)' }}
                    >
                      {cat.icon}
                    </div>
                    <span className="text-[10px] font-bold text-center leading-tight" style={{ color: '#4e2815' }}>
                      {cat.label}
                    </span>
                  </Link>
                );
              })}
              </motion.div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#fefaf3] to-transparent pointer-events-none"></div>
            </div>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            LOVED BY EVERYONE SECTION
        ═══════════════════════════════════════════════════════ */}
        <section
          id="loved-products"
          className="py-14 md:py-20 bg-[#fefaf3]"
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-10 md:mb-14">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="h-px w-10 bg-[#b56d36]" />
                <span className="text-[10px] md:text-xs font-bold tracking-[0.28em] uppercase text-[#b56d36]">
                  OUR BESTSELLERS
                </span>
                <div className="h-px w-10 bg-[#b56d36]" />
              </div>
              <h2
                className="font-serif font-bold mb-3"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#4e2815' }}
              >
                Loved by Everyone
              </h2>
              <p className="text-sm font-medium text-[#6e4f3a]">
                Handpicked favorites that our customers can't get enough of.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div
                  className="animate-spin rounded-full"
                  style={{ width: 40, height: 40, border: '3px solid rgba(181,109,54,0.2)', borderTopColor: '#d35400' }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6 mb-10 md:mb-12">
                {lovedProducts.length > 0 ? lovedProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                )) : (
                  <div className="col-span-full text-center py-10 text-[#6e4f3a] font-medium">
                    New loved products coming soon!
                  </div>
                )}
              </div>
            )}

            <div className="text-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 font-bold rounded-full transition-all duration-200 hover:scale-105"
                style={{
                  padding: '12px 32px',
                  fontSize: '1rem',
                  border: '1.5px solid rgba(181,109,54,0.4)',
                  color: '#4e2815',
                  background: 'white',
                  textDecoration: 'none',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                }}
              >
                View All Products
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-[#d35400]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            ABOUT US
        ═══════════════════════════════════════════════════════ */}
        <section id="about-us" className="py-14 md:py-20 bg-white border-t border-[#f1e6da]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-20">
              {/* Image/Graphic Side */}
              <div className="w-full lg:w-1/2 flex justify-center relative">
                <div
                  className="rounded-[40px] overflow-hidden p-2 relative"
                  style={{ background: 'linear-gradient(135deg, #fdf8f0 0%, #faecd8 100%)' }}
                >
                  <div className="rounded-[32px] overflow-hidden bg-white aspect-[4/5] w-full max-w-[420px] relative flex items-center justify-center shadow-lg">
                    <img src="/bg3.png" alt="Our Bakery" className="w-full h-full object-cover opacity-80" />

                    {/* Floating badge */}
                    <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center border-4 border-white shadow-xl" style={{ background: 'linear-gradient(135deg, #d35400 0%, #b56d36 100%)' }}>
                      <div className="text-center text-white">
                        <span className="block font-serif font-bold text-3xl md:text-4xl leading-none mb-1">10+</span>
                        <span className="block font-bold text-[10px] md:text-xs uppercase tracking-wider">Years<br />Experience</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Side */}
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <div className="h-px w-10 bg-[#b56d36]" />
                  <span className="text-[10px] md:text-xs font-bold tracking-[0.28em] uppercase text-[#b56d36]">
                    Our Story
                  </span>
                </div>
                
                <h2
                  className="font-serif font-bold mb-6"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#4e2815', lineHeight: 1.15 }}
                >
                  A Decade of Baking <br className="hidden lg:block" />
                  <span style={{ color: '#d35400' }}>Sweet Memories</span>
                </h2>

                <p className="text-[1rem] leading-[1.8] text-[#6e4f3a] mb-5 font-medium">
                  At Sri Tirupathi Venkatachalapathi Bakery, baking isn't just a business—it's a devotion. For over a decade, we have been a part of your daily celebrations, combining timeless traditional recipes with the finest ingredients to create treats that warm the heart.
                </p>
                <p className="text-[1rem] leading-[1.8] text-[#6e4f3a] mb-8 font-medium">
                  Every pastry, cake, and sweet is prepared fresh every single day. We pride ourselves on our uncompromising quality, hygienic standards, and the love we fold into every single batch. Thank you for making us a part of your family.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <div className="flex items-center gap-2 font-bold text-[0.85rem] uppercase tracking-wide bg-[#fdf8f0] text-[#4e2815] px-5 py-3 rounded-full border border-[#f1e6da] shadow-sm">
                    <span className="text-[#d35400] text-lg">🌟</span> 100% Eggless Options
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[0.85rem] uppercase tracking-wide bg-[#fdf8f0] text-[#4e2815] px-5 py-3 rounded-full border border-[#f1e6da] shadow-sm">
                    <span className="text-[#d35400] text-lg">👨‍🍳</span> Expert Bakers
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            WHATSAPP CTA BANNER
        ═══════════════════════════════════════════════════════ */}
        <section
          className="py-12 md:py-16 text-center px-4 relative overflow-hidden"
          style={{ background: '#fdf8f0' }}
        >
          {/* Subtle background pattern/overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('/bg3.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
          
          <div className="max-w-2xl mx-auto relative z-10">
            <h2
              className="font-serif font-bold mb-3"
              style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: '#4e2815' }}
            >
              Want to order directly?
            </h2>
            <p className="mb-8 text-[1rem] font-medium" style={{ color: '#6e4f3a' }}>
              Chat with us on WhatsApp for custom orders and quick queries
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-5">
              <WhatsAppButton message="Hello! I would like to place an order." />
              <Link
                to="/contact"
                className="flex items-center gap-2 font-bold rounded-full transition-all hover:bg-white shadow-sm"
                style={{
                  padding: '12px 32px',
                  fontSize: '0.95rem',
                  background: 'white',
                  color: '#4e2815',
                  border: '1.5px solid #eae0d5',
                  textDecoration: 'none',
                }}
              >
                <span>📞</span> Contact Us
              </Link>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Home;
