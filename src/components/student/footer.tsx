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
    <motion.footer
      className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 flex flex-col md:flex-row items-center justify-between gap-8 shrink-0 px-0"
      variants={footerVariants}
      initial="hidden"
      animate="visible"
      style={{ boxSizing: 'border-box' }}
    >
      <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-1/2 px-4">
        <motion.h3
          className="text-xl font-bold mb-4 tracking-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Download Our Mobile App
        </motion.h3>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              type="default"
              icon={<AndroidFilled />}
              size="large"
              className="bg-green-600 text-white border-none hover:bg-green-700 flex items-center justify-center w-full sm:w-48 h-12 rounded-lg font-medium"
              href="https://play.google.com/store"
              target="_blank"
            >
              Get it on Google Play
            </Button>
          </motion.div>
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              type="default"
              icon={<AppleFilled />}
              size="large"
              className="bg-gray-950 text-white border-none hover:bg-gray-900 flex items-center justify-center w-full sm:w-48 h-12 rounded-lg font-medium"
              href="https://www.apple.com/app-store/"
              target="_blank"
            >
              Download on the App Store
            </Button>
          </motion.div>
        </div>
      </div>
      <motion.div
        className="flex flex-col items-center md:items-end w-full md:w-1/2 px-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <img src='/img/Logo.svg' alt="AI SEA Logo" className="h-12 w-auto mb-2" />
        <span className="text-gray-300 text-sm mt-2">&copy; {new Date().getFullYear()} AI SEA. All rights reserved.</span>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;