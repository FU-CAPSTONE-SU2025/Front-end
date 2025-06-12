import React, { useState } from 'react';
import { Badge, Avatar } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Animation variants for navigation links
  const navItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.15, duration: 0.3, ease: 'easeOut' },
    }),
  };

  // Animation variants for mobile menu
  const mobileMenuVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.3 } },
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/60 backdrop-blur-md shadow-md px-8 py-4 flex items-center justify-between transition-all duration-300">
      {/* Left Section: Hamburger (Mobile) / Logo (Desktop) */}
      <div className="flex items-center">
        {/* Hamburger Menu Button (Visible on Mobile) */}
        <div className="lg:hidden">
          <motion.button
            className="text-black focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </motion.button>
        </div>

        {/* Logo (Hidden on Mobile when Hamburger is visible, Visible on Desktop) */}
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

      {/* Logo (Center on Mobile Only) */}
      <motion.div
        className="flex items-center absolute left-1/2 transform -translate-x-1/2 lg:hidden"
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

      {/* Menu (Desktop, Centered) */}
      <nav className="hidden lg:flex flex-row items-center gap-8 flex-1 justify-center">
        {['Dashboard', 'Semester Planner', 'Course Tracking', 'Resource Explorer', 'Advisor Support'].map((item, index) => (
          <motion.a
            key={item}
            href="#"
            custom={index}
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
            className="text-black text-sm font-semibold uppercase tracking-wide hover:text-orange-500 transition-colors duration-300 relative group !text-black whitespace-nowrap"
            whileHover={{ scale: 1.05 }}
            style={{ color: 'black' }}
          >
            {item}
            <span className="absolute left-0 bottom-[-2px] w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </motion.a>
        ))}
      </nav>

      {/* User Section (Desktop & Mobile, Right) */}
      <div className="flex items-center gap-2 sm:gap-3 lg:min-w-[280px] justify-end">
        <motion.a
          href="#"
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-[10px] sm:text-xs lg:text-sm lg:px-4 lg:py-1.5 hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ color: 'white' }}
        >
          <span className="lg:inline hidden">FPTU - HỒ CHÍ MINH</span>
          <span className="lg:hidden">FPTU - HCM</span>
        </motion.a>
        <Badge count={1} color="#f97316" offset={[-4, 4]}>
          <motion.div
            className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 bg-opacity-50 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-black cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
          </motion.div>
        </Badge>
        <Badge count={2} color="#f97316" offset={[-4, 4]}>
          <motion.div
            className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 bg-opacity-50 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-black cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-4.072A9.863 9.863 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </motion.div>
        </Badge>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Avatar
            src="https://i.pravatar.cc/150?img=3"
            size={{ xs: 22, sm: 26, md: 28, lg: 30 }}
            className="ring-1 ring-orange-200 hover:ring-orange-400 transition-all duration-300"
          />
        </motion.div>
      </div>

      {/* Mobile Menu (Navigation Only, Left Half) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="lg:hidden absolute top-14 left-0 w-1/2 bg-white bg-opacity-20 backdrop-blur-lg shadow-lg p-5 flex flex-col items-start gap-4"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {['Dashboard', 'Semester Planner', 'Course Tracking', 'Resource Explorer', 'Advisor Support'].map((item, index) => (
              <div key={item} className="w-full">
                <motion.a
                  href="#"
                  custom={index}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-black text-sm font-semibold uppercase tracking-wide hover:text-orange-500 transition-colors duration-300 relative group w-full py-2.5 block !text-black"
                  onClick={() => setIsMenuOpen(false)}
                  whileHover={{ scale: 1.05 }}
                  style={{ color: 'black' }}
                >
                  {item}
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                </motion.a>
                {index < 3 && (
                  <hr className="w-full border-t border-gray-300 opacity-50 my-2" />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;