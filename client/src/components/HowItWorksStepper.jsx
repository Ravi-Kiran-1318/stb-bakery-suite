import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useI18n } from '../context/I18nContext';

const stepsIcons = [
  {
    id: 1,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"></path>
      </svg>
    )
  },
  {
    id: 2,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
      </svg>
    )
  },
  {
    id: 3,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
    )
  },
  {
    id: 4,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    )
  },
  {
    id: 5,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
      </svg>
    )
  }
];

const HowItWorksStepper = ({ hideCTA = false }) => {
  const [activeStep, setActiveStep] = useState(1);
  const { t } = useI18n();

  // Re-build steps with translations
  const steps = stepsIcons.map((step, index) => ({
    ...step,
    title: t(`HomePage.HowItWorks.Steps.${index}.Title`, null, 'Step Title'),
    description: t(`HomePage.HowItWorks.Steps.${index}.Desc`, null, 'Step Description')
  }));

  // Auto-play the stepper
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        const isMobile = window.innerWidth < 768;
        const maxSteps = isMobile ? 4 : steps.length;
        return prev >= maxSteps ? 1 : prev + 1;
      });
    }, 2000); // Change step every 2 seconds
    
    const handleResize = () => {
      if (window.innerWidth < 768 && activeStep > 4) {
        setActiveStep(4);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeStep, steps.length]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-8">
      <div className="bg-[#fefaf3] rounded-3xl shadow-sm border border-[#f3e8d6] p-6 sm:p-12 relative overflow-hidden">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-100/40 to-transparent rounded-bl-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#c37e50]/5 to-transparent rounded-tr-full pointer-events-none"></div>

        <div className="text-center mb-12 sm:mb-20 relative z-10">
          <h4 className="text-amber-600 font-bold tracking-widest text-xs sm:text-sm uppercase mb-3">
            {t('HomePage.HowItWorks.Tagline', null, 'How It Works')}
          </h4>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2d170a]">
            {t('HomePage.HowItWorks.Title', null, 'Delicious cakes, just 5 simple steps away.')}
          </h2>
        </div>

        {/* Desktop View (Horizontal Stepper) */}
        <div className="hidden md:block relative z-10">
          <div className="flex justify-between items-start relative">
            
            {/* Background Line */}
            <div className="absolute top-8 left-10 right-10 h-0.5 bg-amber-100 z-0"></div>
            
            {/* Animated Progress Line */}
            <div className="absolute top-8 left-10 right-10 h-0.5 z-0">
              <motion.div 
                className="h-full bg-amber-500"
                initial={{ width: "0%" }}
                animate={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>

            {steps.map((step) => {
              const isActive = step.id === activeStep;
              const isPast = step.id < activeStep;

              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center w-1/5 group cursor-pointer" onClick={() => setActiveStep(step.id)}>
                  
                  {/* Icon Circle */}
                  <motion.div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors duration-300 ${
                      isActive || isPast ? 'bg-amber-500 text-white shadow-lg' : 'bg-white border-2 border-amber-200 text-amber-500'
                    }`}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {step.icon}
                  </motion.div>

                  {/* Step Number Badge - Below Icon */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-3 transition-colors duration-300 ${
                    isActive || isPast ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-100 text-amber-500'
                  }`}>
                    {step.id}
                  </div>

                  {/* Text Content */}
                  <div className="text-center px-2">
                    <h3 className={`font-bold text-sm mb-2 transition-colors ${isActive ? 'text-amber-500' : 'text-[#2d170a]'}`}>
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile View (Horizontal Stepper - 4 Steps only) */}
        <div className="md:hidden relative z-10">
          <div className="flex justify-between items-start relative px-1">
            
            {/* Background Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-amber-100 z-0"></div>
            
            {/* Animated Progress Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 z-0">
              <motion.div 
                className="h-full bg-amber-500"
                initial={{ width: "0%" }}
                animate={{ width: `${((Math.min(activeStep, 4) - 1) / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>

            {steps.slice(0, 4).map((step) => {
              const isActive = step.id === activeStep;
              const isPast = step.id < activeStep;

              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center w-1/4 group cursor-pointer" onClick={() => setActiveStep(step.id)}>
                  
                  {/* Icon Circle */}
                  <motion.div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors duration-300 ${
                      isActive || isPast ? 'bg-amber-500 text-white shadow-md' : 'bg-white border-2 border-amber-200 text-amber-500'
                    }`}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {React.cloneElement(step.icon, { className: "w-5 h-5" })}
                  </motion.div>

                  {/* Step Number Badge - Below Icon */}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-2 transition-colors duration-300 ${
                    isActive || isPast ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-100 text-amber-500'
                  }`}>
                    {step.id}
                  </div>

                  {/* Text Content */}
                  <div className="text-center px-1">
                    <h3 className={`font-bold text-[9px] sm:text-[11px] leading-tight transition-colors ${isActive ? 'text-amber-500' : 'text-[#2d170a]'}`}>
                      {step.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Mobile Pagination Dots */}
          <div className="flex justify-center items-center gap-1.5 mt-6 relative z-10">
            {steps.slice(0, 4).map((step) => (
              <div 
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step.id === activeStep ? 'w-5 bg-amber-500' : 'w-1.5 bg-amber-200'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* ────────────────────────────────────
            ACTION BANNER (CTA SECTION)
        ──────────────────────────────────── */}
        {!hideCTA && (
          <div className="mt-14 sm:mt-20 pt-10 sm:pt-14 border-t border-amber-100/60 relative z-10 text-center">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2d170a] mb-4">
              {t('HomePage.HowItWorks.CTA.Title', null, 'Ready to bring your dream cake to life?')}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              {t('HomePage.HowItWorks.CTA.Desc', null, 'Whether you want to customize one of our beautiful gallery designs or build a completely custom cake from scratch, our expert bakers are ready to craft the perfect centerpiece for your celebration.')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/gallery"
                className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 text-white font-bold rounded-full shadow-md hover:bg-amber-600 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {t('HomePage.HowItWorks.CTA.BtnGallery', null, 'Browse Cake Gallery')}
              </Link>
              <Link 
                to="/custom-cakes"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-amber-600 font-bold rounded-full border-2 border-amber-500 shadow-sm hover:bg-amber-50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {t('HomePage.HowItWorks.CTA.BtnCustom', null, 'Request Custom Cake')}
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

HowItWorksStepper.propTypes = {
  hideCTA: PropTypes.bool
};

export default HowItWorksStepper;
