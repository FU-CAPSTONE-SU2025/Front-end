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
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  // Animation variants for mobile menu
  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-3 sm:px-6 lg:px-8 py-2.5 z-20 bg-white bg-opacity-10 backdrop-blur-md shadow-sm">
      {/* Hamburger Menu Button (Visible on Mobile, Left) */}
      <motion.button
        className="lg:hidden text-black focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
        </svg>
      </motion.button>

      {/* Logo (Center on Mobile, Left on Desktop) */}
      <motion.div
        className="flex items-center absolute left-1/2 transform -translate-x-1/2 lg:static lg:transform-none"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <img
          src="/img/Logo.svg"
          alt="AI SEA Logo"
          className="h-7 w-auto sm:h-9 transition-transform hover:scale-105"
        />
      </motion.div>

      {/* Menu (Desktop) */}
      <nav className="hidden lg:flex flex-row items-center gap-8">
        {['Dashboard', 'Semester Planner', 'Course Tracking', 'Resource Explorer'].map((item, index) => (
          <motion.a
            key={item}
            href="#"
            custom={index}
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
            className="text-black text-sm font-medium hover:text-orange-500 transition-colors duration-300 relative group"
            whileHover={{ scale: 1.05 }}
          >
            {item}
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </motion.a>
        ))}
      </nav>

      {/* User Section (Desktop & Mobile, Right) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <motion.a
          href="#"
          className="bg-orange-500 text-white px-1.5 sm:px-2.5 py-0.5 rounded-md font-bold text-[10px] sm:text-xs hover:bg-orange-600 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          FPTU - HCM
        </motion.a>
        <Badge count={1} color="#f97316">
          <motion.div
            className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 bg-opacity-50 rounded-full flex items-center justify-center"
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
        <Badge count={2} color="#f97316">
          <motion.div
            className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 bg-opacity-50 rounded-full flex items-center justify-center"
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
            size={{ xs: 20, sm: 24, md: 26, lg: 28 }}
            className="ring-1 ring-orange-200 hover:ring-orange-400 transition-all duration-300"
          />
        </motion.div>
      </div>

      {/* Mobile Menu (Navigation Only) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="lg:hidden absolute top-12 left-0 w-full bg-white bg-opacity-10 backdrop-blur-md shadow-lg p-4 flex flex-col items-center gap-4"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {['Dashboard', 'Semester Planner', 'Course Tracking', 'Resource Explorer'].map((item, index) => (
              <motion.a
                key={item}
                href="#"
                custom={index}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                className="text-black text-sm font-medium hover:text-orange-500 transition-colors duration-300 relative group w-full text-center py-2"
                onClick={() => setIsMenuOpen(false)}
                whileHover={{ scale: 1.05 }}
              >
                {item}
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;