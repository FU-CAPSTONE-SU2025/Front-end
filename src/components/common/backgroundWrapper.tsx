import React from 'react';
import styles from '../../css/backgroundWrapper.module.css';

interface BackgroundWrapperProps {
  children: React.ReactNode;
  variant?: 'animated' | 'transparent';
  className?: string;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ 
  children, 
  variant = 'animated',
  className = ''
}) => {
  return (
    <div className={`${styles.background} ${styles[variant]} ${className}`}>
      <div className={styles.container}>
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper; 