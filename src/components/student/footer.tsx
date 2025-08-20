import React from 'react';
import { Button } from 'antd';
import { AndroidFilled, AppleFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  // Animation variants for the footer
  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  // Animation variants for buttons
  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6 sm:py-8 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 shrink-0 px-4 sm:px-6 lg:px-8"
      variants={footerVariants}
      initial="hidden"
      animate="visible"
      style={{ boxSizing: 'border-box' }}
    >
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-1/2">
        <motion.h3
          className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 tracking-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Download Our Mobile App
        </motion.h3>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="w-full sm:w-auto">
            <Button
              type="default"
              icon={<AndroidFilled />}
              size="large"
              className="bg-green-600 text-white border-none hover:bg-green-700 flex items-center justify-center w-full sm:w-48 h-10 sm:h-12 rounded-lg font-medium text-xs sm:text-sm"
              href="https://play.google.com/store"
              target="_blank"
            >
              <span className="hidden sm:inline">Get it on Google Play</span>
              <span className="sm:hidden">Google Play</span>
            </Button>
          </motion.div>
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="w-full sm:w-auto">
            <Button
              type="default"
              icon={<AppleFilled />}
              size="large"
              className="bg-gray-950 text-white border-none hover:bg-gray-900 flex items-center justify-center w-full sm:w-48 h-10 sm:h-12 rounded-lg font-medium text-xs sm:text-sm"
              href="https://www.apple.com/app-store/"
              target="_blank"
            >
              <span className="hidden sm:inline">Download on the App Store</span>
              <span className="sm:hidden">App Store</span>
            </Button>
          </motion.div>
        </div>
      </div>
      <motion.div
        className="flex flex-col items-center lg:items-end w-full lg:w-1/2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <img src='/Logo.svg' alt="AI SEA Logo" className="h-8 sm:h-10 lg:h-12 w-auto mb-2" />
        <span className="text-gray-300 text-xs sm:text-sm mt-2 text-center lg:text-right">
          &copy; {new Date().getFullYear()} AI SEA. All rights reserved.
        </span>
      </motion.div>
    </motion.div>
  );
};

export default Footer;