import React, { useState } from 'react';
import { Badge, Avatar } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import Messenger from './messenger';
import Notification from './notification';

const navItems = [
  'Dashboard',
  'Semester Planner',
  'Course Tracking',
  'Resource Explorer',
  'Advisor Support',
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const navItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.15, duration: 0.3, ease: 'easeOut' },
    }),
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.3 } },
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md shadow transition-all duration-300">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Logo & Hamburger */}
        <div className="flex items-center">
          {/* Hamburger for mobile */}
          <div className="lg:hidden">
            <motion.button
              className="text-black focus:outline-none"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
              </svg>
            </motion.button>
          </div>
          {/* Logo desktop */}
          <motion.div
            className="hidden lg:flex items-center min-w-[120px]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <img
              src="/img/Logo.svg"
              alt="AI SEA Logo"
              className="h-8 w-auto sm:h-10 transition-transform hover:scale-105"
            />
          </motion.div>
        </div>
        {/* Logo mobile center */}
        <motion.div
          className="flex items-center absolute left-1/2 transform -translate-x-1/2 lg:hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <img
            src="/img/Logo.svg"
            alt="AI SEA Logo"
            className="h-6 sm:h-8 w-auto transition-transform hover:scale-105"
          />
        </motion.div>
        {/* Nav desktop */}
        <nav className="hidden lg:flex flex-row items-center gap-6 xl:gap-8 flex-1 justify-center">
          {navItems.map((item, index) => (
            <motion.a
              key={item}
              href="#"
              custom={index}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
              className="text-black text-xs xl:text-sm font-semibold uppercase tracking-wide hover:text-orange-500 transition-colors duration-300 relative group whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
            >
              {item}
              <span className="absolute left-0 bottom-[-2px] w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </motion.a>
          ))}
        </nav>
        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 lg:min-w-[280px] justify-end">
          <motion.a
            href="#"
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-[8px] sm:text-xs lg:text-sm lg:px-4 lg:py-1.5 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-sm whitespace-nowrap"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="lg:inline hidden">FPTU - HỒ CHÍ MINH</span>
            <span className="lg:hidden">FPTU - HCM</span>
          </motion.a>
          <Notification />
          <Messenger />
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Avatar
              src="https://i.pravatar.cc/150?img=3"
              size={{ xs: 20, sm: 24, md: 26, lg: 28, xl: 30 }}
              className="ring-1 ring-orange-200 hover:ring-orange-400 transition-all duration-300"
            />
          </motion.div>
        </div>
        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden absolute top-full left-0 w-full sm:w-80 bg-white/90 backdrop-blur-lg shadow-lg p-4 sm:p-5 flex flex-col items-start gap-3 sm:gap-4 border-t border-gray-200"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {navItems.map((item, index) => (
                <div key={item} className="w-full">
                  <motion.a
                    href="#"
                    custom={index}
                    variants={navItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-black text-sm font-semibold uppercase tracking-wide hover:text-orange-500 transition-colors duration-300 relative group w-full py-2 sm:py-2.5 block"
                    onClick={() => setIsMenuOpen(false)}
                    whileHover={{ scale: 1.05 }}
                  >
                    {item}
                    <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                  </motion.a>
                  {index < navItems.length - 1 && (
                    <hr className="w-full border-t border-gray-300 opacity-50 my-2" />
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;