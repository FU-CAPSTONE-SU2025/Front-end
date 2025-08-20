import React from 'react';
import styles from '../../css/backgroundWrapper.module.css';
import { Outlet } from 'react-router';

interface BackgroundWrapperProps {
  children: React.ReactNode;
  variant?: 'animated' | 'transparent';
  className?: string;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ 
  variant = 'animated',
  className = ''
}) => {
  return (
    <div className={`${styles.background} ${styles[variant]} ${className}`}>
      <div className={styles.container}>
        <Outlet/>
      </div>
    </div>
  );
};

export default BackgroundWrapper; 