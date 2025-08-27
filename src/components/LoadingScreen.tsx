import { motion } from 'framer-motion';
import '../css/loadingScreen.css';

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
}

export default function LoadingScreen({ isLoading, message = "Loading..." }: LoadingScreenProps) {
  if (!isLoading) return null;

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loading-content">
        {/* Main Spinner */}
          <div className="spinner-main"></div>
          <div className="spinner-secondary"></div>
          <div className="spinner-tertiary"></div>

        {/* Pulsing Dots */}
        <div className="dots-container">
          <div className="dot dot1"></div>
          <div className="dot dot2"></div>
          <div className="dot dot3"></div>
        </div>

        {/* Loading Text */}
        <motion.div
          className="loading-text-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2>{message}</h2>
          <div className="loading-bar">
            <div className="loading-bar-fill"></div>
          </div>
        </motion.div>

        {/* Floating Particles */}
        <div className="particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 