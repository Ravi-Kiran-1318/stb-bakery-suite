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
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const { data } = await axiosInstance.get('/products');
        const available = data.filter(p => p.isAvailable);
        setBestsellers(available.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch bestsellers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBestsellers();
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
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-7 md:h-7">
          <path d="M20 5C20 5 8 12 8 22C8 28.627 13.373 34 20 34C26.627 34 32 28.627 32 22C32 12 20 5 20 5Z" stroke="#D4AF37" strokeWidth="1.5" fill="rgba(212,175,55,0.1)" />
          <circle cx="20" cy="22" r="4" fill="#D4AF37" />
        </svg>
      ),
      label: 'Pure Ingredients', sub: 'Always Fresh',
    },
    {
      icon: (
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-7 md:h-7">
          <rect x="8" y="12" width="24" height="18" rx="3" stroke="#D4AF37" strokeWidth="1.5" fill="rgba(212,175,55,0.1)" />
          <path d="M8 17h24" stroke="#D4AF37" strokeWidth="1.2" />
          <path d="M14 22h5M14 26h9" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M19 8l2 4M21 8l-2 4" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
      label: 'Hygienic &', sub: 'Quality Assured',
    },
    {
      icon: (
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-7 md:h-7">
          <rect x="4" y="18" width="26" height="12" rx="3" stroke="#D4AF37" strokeWidth="1.5" fill="rgba(212,175,55,0.1)" />
          <path d="M4 21h26" stroke="#D4AF37" strokeWidth="1" />
          <circle cx="12" cy="33" r="2.5" stroke="#D4AF37" strokeWidth="1.5" />
          <circle cx="22" cy="33" r="2.5" stroke="#D4AF37" strokeWidth="1.5" />
          <path d="M28 18V13h8l-4 5" stroke="#D4AF37" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      ),
      label: 'Fast & Reliable', sub: 'Delivery',
    },
    {
      icon: (
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-7 md:h-7">
          <path d="M20 8C20 8 10 14 10 22C10 27.523 14.477 32 20 32C25.523 32 30 27.523 30 22C30 14 20 8 20 8Z" stroke="#D4AF37" strokeWidth="1.5" fill="rgba(212,175,55,0.1)" />
          <path d="M20 15L21.5 18.5L25 19L22.5 21.5L23 25L20 23.5L17 25L17.5 21.5L15 19L18.5 18.5L20 15Z" fill="#D4AF37" />
        </svg>
      ),
      label: 'Made with', sub: 'Devotion',
    },
  ];

  return (
    <PageWrapper>
      <div className="bg-[#060301] min-h-screen">

        {/* ═══════════════════════════════════════════════════════
            HERO SECTION
            - Mobile  : full-screen, centered content, no sidebar
            - Tablet  : min-h-screen, left-aligned, no sidebar
            - Desktop : 100vh, left-text + right sidebar
        ═══════════════════════════════════════════════════════ */}
        <div
          className="relative w-full"
          style={{
            minHeight: '100svh',          /* uses small viewport height on mobile browsers */
            backgroundImage: "url('/NewBg.png')",
            backgroundSize: 'cover',
            backgroundPosition: '65% center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* ── Gradient overlay ── */}
          {/* Mobile: full dark; Desktop: dark-left transparent-right */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: [
                /* always: bottom vignette so features text is readable */
                'linear-gradient(to top, rgba(2,1,0,0.95) 0%, rgba(2,1,0,0.0) 40%)',
                /* left text area */
                'linear-gradient(105deg, rgba(2,1,0,0.97) 0%, rgba(4,2,0,0.92) 30%, rgba(5,3,0,0.72) 48%, rgba(2,1,0,0.18) 68%, rgba(0,0,0,0.0) 100%)',
              ].join(', '),
            }}
          />

          {/* ── Content wrapper ── */}
          <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-20 flex flex-col lg:flex-row items-center lg:items-center min-h-[100svh]">

            {/* ────────────────────────────────────
                LEFT / MAIN CONTENT
            ──────────────────────────────────── */}
            <motion.div
              className="flex flex-col w-full lg:max-w-[560px] pt-16 pb-10 sm:pt-20 lg:pt-0 lg:pb-0 text-center lg:text-left"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {/* Sanskrit tagline */}
              <motion.p
                variants={itemVariant}
                className="mb-3 md:mb-4 font-serif italic tracking-[0.22em] uppercase"
                style={{ fontSize: 'clamp(0.62rem, 1.5vw, 0.72rem)', color: 'rgba(212,175,55,0.72)' }}
              >
                &#8741; OM NAMO VENKATESAYA &#8741;
              </motion.p>

              {/* Decorative rule — centered on mobile, left on desktop */}
              <motion.div
                variants={itemVariant}
                className="flex items-center gap-2 mb-4 md:mb-5 justify-center lg:justify-start"
              >
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#D4AF37]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#D4AF37]" />
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={itemVariant}
                className="font-serif font-bold leading-[1.08] mb-4 md:mb-5"
                style={{
                  fontSize: 'clamp(2rem, 6vw, 3.6rem)',
                  color: '#fff',
                  textShadow: '0 2px 20px rgba(0,0,0,0.9)',
                  letterSpacing: '-0.01em',
                }}
              >
                Divine Blessings,{' '}
                <br className="hidden xs:block" />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #f2c94c 0%, #D4AF37 50%, #b8860b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Delicious
                </span>{' '}
                Moments
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={itemVariant}
                className="mb-6 md:mb-8 leading-relaxed mx-auto lg:mx-0"
                style={{
                  fontSize: 'clamp(0.85rem, 2vw, 0.98rem)',
                  color: 'rgba(235,220,190,0.78)',
                  maxWidth: '430px',
                }}
              >
                From our hearts to your home — experience the taste
                of purity, made with devotion and the finest ingredients.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariant}
                className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mb-8 md:mb-10"
              >
                <Link
                  to="/shop"
                  id="hero-order-online-btn"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    padding: 'clamp(10px,2vw,13px) clamp(22px,4vw,30px)',
                    fontSize: 'clamp(0.82rem, 1.8vw, 0.92rem)',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #c08a1e 100%)',
                    color: '#1a0900',
                    border: '1px solid rgba(212,175,55,0.5)',
                    boxShadow: '0 0 22px rgba(212,175,55,0.4)',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Order Online
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>

                <button
                  id="hero-explore-btn"
                  onClick={() => document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 hover:bg-white/10 active:scale-95"
                  style={{
                    padding: 'clamp(10px,2vw,13px) clamp(22px,4vw,30px)',
                    fontSize: 'clamp(0.82rem, 1.8vw, 0.92rem)',
                    border: '1.5px solid rgba(212,175,55,0.5)',
                    color: '#EFDBB2',
                    background: 'rgba(212,175,55,0.07)',
                    backdropFilter: 'blur(8px)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Explore Our Products
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                  </svg>
                </button>
              </motion.div>

              {/* Feature Icons — horizontal scroll on very small screens */}
              <motion.div
                variants={itemVariant}
                className="flex gap-4 md:gap-6 justify-center lg:justify-start flex-wrap"
              >
                {features.map((f, i) => (
                  <div key={i} className="flex flex-col items-center text-center min-w-[56px]">
                    <div
                      className="flex items-center justify-center mb-1.5 rounded-full"
                      style={{
                        width: 44, height: 44,
                        background: 'rgba(212,175,55,0.08)',
                        border: '1px solid rgba(212,175,55,0.2)',
                      }}
                    >
                      {f.icon}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold leading-tight" style={{ color: '#EFDBB2' }}>{f.label}</span>
                    <span className="text-[9px] sm:text-[10px] leading-tight" style={{ color: 'rgba(212,175,55,0.6)' }}>{f.sub}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ── DESKTOP SPACER ── */}
            <div className="flex-1 hidden lg:block" />

            {/* ────────────────────────────────────
                SIDEBAR CATEGORIES
                - Mobile/Tablet : horizontal strip at bottom of hero
                - Desktop       : vertical pills on the right
            ──────────────────────────────────── */}

            {/* Desktop sidebar (lg+) */}
            <motion.div
              className="hidden lg:flex flex-col gap-2.5 flex-shrink-0"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.45, ease: 'easeOut' }}
            >
              {sidebarCategories.map((cat, i) => (
                <Link
                  key={i}
                  to={`/shop?category=${cat.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex flex-col items-center gap-1.5 rounded-xl transition-all duration-200 hover:scale-105 group"
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(6,3,1,0.75)',
                    border: '1px solid rgba(212,175,55,0.22)',
                    backdropFilter: 'blur(14px)',
                    minWidth: 72,
                    boxShadow: '0 4px 18px rgba(0,0,0,0.5)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,3,1,0.75)'; }}
                >
                  <div
                    className="flex items-center justify-center rounded-full text-xl"
                    style={{ width: 40, height: 40, background: 'rgba(212,175,55,0.1)' }}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight" style={{ color: 'rgba(212,175,55,0.85)' }}>
                    {cat.label}
                  </span>
                </Link>
              ))}
            </motion.div>

            {/* Mobile/Tablet horizontal category strip (below lg) */}
            <div className="lg:hidden relative w-full pt-4 pb-8">
              <motion.div
                className="flex flex-row gap-3 overflow-x-auto justify-start w-full hide-scrollbar snap-x px-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
              {sidebarCategories.map((cat, i) => (
                <Link
                  key={i}
                  to={`/shop?category=${cat.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex flex-col items-center gap-1 rounded-xl transition-all duration-200 active:scale-95"
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(6,3,1,0.75)',
                    border: '1px solid rgba(212,175,55,0.22)',
                    backdropFilter: 'blur(12px)',
                    minWidth: 60,
                    textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 36, height: 36, background: 'rgba(212,175,55,0.1)', fontSize: 18 }}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-[9px] font-bold text-center leading-tight" style={{ color: 'rgba(212,175,55,0.85)' }}>
                    {cat.label}
                  </span>
                </Link>
              ))}
              </motion.div>
              {/* Fade gradient on the right to indicate more items to scroll */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#060301] to-transparent pointer-events-none"></div>
            </div>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            FEATURED PRODUCTS
        ═══════════════════════════════════════════════════════ */}
        <section
          id="featured-products"
          className="py-14 md:py-20"
          style={{ background: 'linear-gradient(to bottom, #080503, #0f0a04)' }}
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="text-center mb-10 md:mb-14">
              <span className="text-[10px] md:text-xs font-bold tracking-[0.28em] uppercase text-[#D4AF37] block mb-3">
                Freshly Made
              </span>
              <h2
                className="font-serif font-bold"
                style={{ fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', color: '#EFDBB2' }}
              >
                Our Bestsellers
              </h2>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="h-px w-14 bg-gradient-to-r from-transparent to-[#D4AF37]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <div className="h-px w-14 bg-gradient-to-l from-transparent to-[#D4AF37]" />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div
                  className="animate-spin rounded-full"
                  style={{ width: 40, height: 40, border: '2px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37' }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-10 md:mb-12">
                {bestsellers.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            <div className="text-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 font-semibold rounded-full transition-all duration-200 hover:scale-105"
                style={{
                  padding: '10px 28px',
                  fontSize: 'clamp(0.82rem, 2vw, 0.9rem)',
                  border: '1.5px solid rgba(212,175,55,0.45)',
                  color: '#D4AF37',
                  background: 'rgba(212,175,55,0.06)',
                  textDecoration: 'none',
                }}
              >
                View All Products
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            WHY CHOOSE US
        ═══════════════════════════════════════════════════════ */}
        <section className="py-14 md:py-20" style={{ background: '#0b0702' }}>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center mb-10 md:mb-14">
              <span className="text-[10px] md:text-xs font-bold tracking-[0.28em] uppercase text-[#D4AF37] block mb-3">
                Our Promise
              </span>
              <h2
                className="font-serif font-bold"
                style={{ fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', color: '#EFDBB2' }}
              >
                Why Choose Sri Tirupathi
              </h2>
            </div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
            >
              {[
                { emoji: '🌅', title: 'Fresh Daily', desc: 'Every product is baked fresh every morning with no preservatives.' },
                { emoji: '🎂', title: 'Custom Cakes', desc: 'Order your perfect celebration cake crafted to your wishes.' },
                { emoji: '🚚', title: 'Home Delivery', desc: 'Fast and reliable delivery to your doorstep within 10 km.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={itemVariant}
                  className="text-center rounded-2xl transition-all duration-300 hover:-translate-y-1"
                  style={{
                    padding: 'clamp(24px, 4vw, 36px) clamp(16px, 3vw, 28px)',
                    background: 'rgba(212,175,55,0.04)',
                    border: '1px solid rgba(212,175,55,0.12)',
                  }}
                >
                  <div style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', marginBottom: 14 }}>{item.emoji}</div>
                  <h3 className="font-bold mb-2 md:mb-3" style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: '#EFDBB2' }}>{item.title}</h3>
                  <p style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.88rem)', lineHeight: 1.65, color: 'rgba(212,175,55,0.6)', margin: 0 }}>{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            ABOUT US
        ═══════════════════════════════════════════════════════ */}
        <section id="about-us" className="py-14 md:py-20" style={{ background: '#080503' }}>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16">
              {/* Image/Graphic Side */}
              <div className="w-full lg:w-1/2 flex justify-center relative">
                <div
                  className="rounded-t-[100px] rounded-b-[20px] overflow-hidden border-2 p-1"
                  style={{ borderColor: 'rgba(212,175,55,0.3)', background: 'linear-gradient(to bottom, rgba(212,175,55,0.1), transparent)' }}
                >
                  <div className="rounded-t-[94px] rounded-b-[16px] overflow-hidden bg-[#1a0f0a] aspect-[4/5] w-full max-w-[400px] relative flex items-center justify-center">
                    <img src="/NewBg.png" alt="Our Bakery" className="w-full h-full object-cover opacity-60" />

                    {/* Floating badge */}
                    <div className="absolute -bottom-6 -right-6 md:bottom-8 md:-right-8 w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center border-4 border-[#080503] shadow-2xl" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #b87c14 100%)' }}>
                      <div className="text-center text-[#1a0900]">
                        <span className="block font-serif font-bold text-3xl md:text-4xl leading-none mb-1">10+</span>
                        <span className="block font-bold text-xs md:text-sm uppercase tracking-wider">Years<br />Experience</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Side */}
              <div className="w-full lg:w-1/2 text-center lg:text-left mt-8 lg:mt-0">
                <span className="text-[10px] md:text-xs font-bold tracking-[0.28em] uppercase text-[#D4AF37] block mb-3">
                  Our Story
                </span>
                <h2
                  className="font-serif font-bold mb-6"
                  style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#EFDBB2', lineHeight: 1.2 }}
                >
                  A Decade of Baking <br className="hidden lg:block" />
                  <span style={{ color: '#D4AF37' }}>Sweet Memories</span>
                </h2>

                <p className="text-[0.95rem] leading-[1.8] text-[rgba(235,220,190,0.7)] mb-5">
                  At Sri Tirupathi Venkatachalapathi Bakery, baking isn't just a business—it's a devotion. For over a decade, we have been a part of your daily celebrations, combining timeless traditional recipes with the finest ingredients to create treats that warm the heart.
                </p>
                <p className="text-[0.95rem] leading-[1.8] text-[rgba(235,220,190,0.7)] mb-8">
                  Every pastry, cake, and sweet is prepared fresh every single day. We pride ourselves on our uncompromising quality, hygienic standards, and the love we fold into every single batch. Thank you for making us a part of your family.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-[#D4AF37]">
                  <div className="flex items-center gap-2 font-bold text-[0.85rem] uppercase tracking-wide bg-[#D4AF37]/10 px-4 py-2.5 rounded-full border border-[#D4AF37]/30">
                    <span>🌟</span> 100% Eggless Options
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[0.85rem] uppercase tracking-wide bg-[#D4AF37]/10 px-4 py-2.5 rounded-full border border-[#D4AF37]/30">
                    <span>👨‍🍳</span> Expert Bakers
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
          className="py-12 md:py-16 text-center px-4"
          style={{ background: 'linear-gradient(135deg, #b87c14 0%, #D4AF37 50%, #b87c14 100%)' }}
        >
          <div className="max-w-xl mx-auto">
            <h2
              className="font-bold mb-2"
              style={{ fontSize: 'clamp(1.2rem, 4vw, 1.9rem)', color: '#1a0900' }}
            >
              Want to order directly?
            </h2>
            <p className="mb-8 text-sm" style={{ color: 'rgba(26,9,0,0.65)' }}>
              Chat with us on WhatsApp for custom orders and quick queries
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4">
              <div style={{ background: 'rgba(255,255,255,0.28)', borderRadius: 50, padding: '4px 6px' }}>
                <WhatsAppButton message="Hello! I would like to place an order." />
              </div>
              <Link
                to="/contact"
                className="flex items-center gap-2 font-semibold rounded-full transition-all hover:bg-black/90"
                style={{
                  padding: '12px 28px',
                  fontSize: '0.9rem',
                  background: '#140700',
                  color: '#D4AF37',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
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
