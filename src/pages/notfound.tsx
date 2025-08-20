import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from 'antd';
import { motion } from 'framer-motion';
import styles from "../css/notFound.module.css";

// Animation variants for text and button
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.2 } },
};

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
      <motion.div
        className={styles.card}
        variants={{
          hidden: { opacity: 0, scale: 0.8 },
          visible: { 
            opacity: 1, 
            scale: 1, 
            transition: { duration: 0.5, ease: [0.17, 0.67, 0.83, 0.67] } // cubic-bezier as Easing
          }
        }}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants}>404 - Page Not Found</motion.h1>
        <motion.p variants={itemVariants}>
          The page you're looking for doesn't exist or has been moved.
        </motion.p>
        <motion.div variants={itemVariants}>
          <Button
            type="primary"
            className={styles.backButton}
            onClick={() => navigate("/")} // Navigate to home page
          >
            Go to Home
          </Button>
          <Button
            className={styles.backButton}
            onClick={() => navigate(-1)} // Navigate to previous page
            style={{ marginLeft: '1rem' }}
          >
            Go Back
          </Button>
        </motion.div>
      </motion.div>
  );
};

export default NotFound;