import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaInstagram, 
  FaWhatsapp, 
  FaYoutube, 
  FaHome,
  FaPhoneAlt,
  FaImages
} from 'react-icons/fa';
import { MdCake } from 'react-icons/md';
import { GiPartyPopper } from "react-icons/gi";
import { BsBoxSeam, BsBell } from "react-icons/bs";
import { RiMotorbikeFill } from "react-icons/ri";
import { HiOutlineUserGroup } from "react-icons/hi";
import { BiCube } from "react-icons/bi";
import { LuLink } from "react-icons/lu";
import { PiSquaresFourFill } from "react-icons/pi";

const Footer = () => {
  return (
    <footer className="w-full bg-[#fdfbf6] border-t border-[#f5e6c8]">
      <div className="max-w-6xl mx-auto px-4 pt-12">
        {/* Top Section */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-4 mb-5 hover:opacity-90 transition-opacity">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#fbebc4] shrink-0 text-[#7a4e15]">
              <MdCake className="text-2xl" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif font-bold text-[22px] text-[#4a2e00] leading-tight">Sri Tirupathi</span>
              <span className="font-sans text-[10px] text-[#b68424] uppercase tracking-[0.15em] font-bold">Venkatachalapathi Bakery</span>
            </div>
          </Link>

          <p className="font-bold text-[#b68424] mb-3 text-[15px]">
            Fresh from the oven — every single day. <span className="text-[#f97316]">♥</span>
          </p>
          <p className="text-[13px] leading-[1.6] text-[#6b4919] mb-6 max-w-[480px]">
            We bring you the finest quality baked goodies made with pure ingredients, traditional recipes, and lots of love.
          </p>

          <div className="flex items-center justify-center gap-6">
            {[
              { name: "Instagram", icon: <FaInstagram size={15} />, url: "https://www.instagram.com/tirupati_bakery?igsh=MTJzaHE5ZW1nNGl6bQ==" },
              { name: "WhatsApp", icon: <FaWhatsapp size={15} />, url: "https://wa.me/918074381678" },
            ].map((platform, idx) => (
              <a 
                key={idx} 
                href={platform.url} 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-[#b68424] hover:text-[#956a29] transition-colors"
              >
                <div className="w-9 h-9 rounded-full border border-[#d2a353] flex items-center justify-center bg-transparent group-hover:bg-[#b68424] group-hover:text-white group-hover:border-[#b68424] transition-all">
                  {platform.icon}
                </div>
                <span className="font-semibold text-[13px]">{platform.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Cards Section */}
        <div className="flex flex-col md:flex-row justify-center gap-6 pb-12 w-full max-w-4xl mx-auto">
          
          {/* Our Services */}
          <div className="flex-1 bg-white rounded-[20px] p-6 border border-[#f5e6c8]/60 shadow-[0_4px_20px_-10px_rgba(210,163,83,0.15)]">
            <div className="flex items-center gap-3 mb-5 border-b border-[#f5e6c8]/60 pb-4">
              <div className="w-9 h-9 rounded-[10px] bg-[#fbebc4] flex items-center justify-center text-[#7a4e15]">
                <PiSquaresFourFill className="text-xl" />
              </div>
              <h3 className="font-serif font-bold text-[17px] text-[#4a2e00] flex-1">Our Services</h3>
              <span className="text-[#d2a353] text-lg">✦</span>
            </div>
            <ul className="space-y-[14px]">
              {[
                { label: 'Custom Cakes', icon: <MdCake className="text-xl" /> },
                { label: 'Party Orders', icon: <GiPartyPopper className="text-xl" /> },
                { label: 'Home Delivery', icon: <RiMotorbikeFill className="text-xl" /> },
                { label: 'Bulk Orders', icon: <BsBoxSeam className="text-[17px]" /> },
              ].map((service, idx) => (
                <li key={idx}>
                  <Link to="#" className="flex items-center group">
                    <div className="w-9 h-9 rounded-[10px] bg-[#fbebc4]/40 flex items-center justify-center text-[#956a29] mr-4 group-hover:bg-[#fbebc4] transition-colors">
                      {service.icon}
                    </div>
                    <span className="text-[14px] font-medium text-[#6b4919] group-hover:text-[#4a2e00] flex-1 transition-colors">{service.label}</span>
                    <span className="text-[#d2a353] group-hover:translate-x-1 transition-transform">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex-1 bg-white rounded-[20px] p-6 border border-[#f5e6c8]/60 shadow-[0_4px_20px_-10px_rgba(210,163,83,0.15)]">
            <div className="flex items-center gap-3 mb-5 border-b border-[#f5e6c8]/60 pb-4">
              <div className="w-9 h-9 rounded-[10px] bg-[#fbebc4] flex items-center justify-center text-[#7a4e15]">
                <LuLink className="text-[19px]" />
              </div>
              <h3 className="font-serif font-bold text-[17px] text-[#4a2e00] flex-1">Quick Links</h3>
              <span className="text-[#d2a353] text-lg">✦</span>
            </div>
            <ul className="space-y-[14px]">
              {[
                { label: 'Home', icon: <FaHome className="text-[17px]" />, link: '/' },
                { label: 'About Us', icon: <HiOutlineUserGroup className="text-[19px]" />, link: '/#about-us' },
                { label: 'Our Products', icon: <BiCube className="text-[19px]" />, link: '/shop' },
                { label: 'Cake Gallery', icon: <FaImages className="text-[17px]" />, link: '/gallery' },
                { label: 'Contact Us', icon: <FaPhoneAlt className="text-[15px]" />, link: '/contact' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.link} 
                    className="flex items-center group"
                    onClick={(e) => {
                      if (link.label === 'About Us') {
                        if (window.location.pathname === '/') {
                          const aboutSection = document.getElementById('about-us');
                          if (aboutSection) {
                            aboutSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }
                      } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    <div className="w-9 h-9 rounded-[10px] bg-[#fbebc4]/40 flex items-center justify-center text-[#956a29] mr-4 group-hover:bg-[#fbebc4] transition-colors">
                      {link.icon}
                    </div>
                    <span className="text-[14px] font-medium text-[#6b4919] group-hover:text-[#4a2e00] flex-1 transition-colors">{link.label}</span>
                    <span className="text-[#d2a353] group-hover:translate-x-1 transition-transform">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full">
        {/* Mobile Heart Ornament */}
        <div className="md:hidden flex flex-col items-center justify-center pb-6 mt-[-10px]">
          <div className="flex items-center justify-center gap-3 mb-3 text-[#d2a353]">
            <span className="w-10 h-px bg-gradient-to-r from-transparent to-[#d2a353]"></span>
            <span className="text-[10px]">♥</span>
            <span className="w-10 h-px bg-gradient-to-l from-transparent to-[#d2a353]"></span>
          </div>
          <p className="text-[11px] text-[#6b4919] font-medium">
            &copy; 2025 Sri Tirupathi Bakery. All rights reserved.
          </p>
        </div>
        
        {/* Desktop Yellow Bar */}
        <div className="hidden md:flex w-full bg-[#f3bc4b] py-[18px] justify-center rounded-t-3xl mx-auto max-w-7xl">
          <p className="text-[13px] text-[#4a2e00] font-medium">
            &copy; 2025 Sri Tirupathi Bakery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
