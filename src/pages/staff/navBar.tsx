import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '../../css/staff/staffNavBar.module.css';

// Interface for navigation items
interface NavItem {
  label: string;
  route: string;
}

const StaffNavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: 'Profile', route: '/staff' },
    { label: 'Student Transcript', route: '/staff/transcript' },
    { label: 'Syllabus', route: '/staff/syllabus' },
    { label: 'Subjects', route: '/staff/subjects' },
  ];

  // Determine active route
  const getActiveRoute = (route: string) => {
    return location.pathname.toLowerCase() === route.toLowerCase();
  };

  // NavBar animation variants
  const navBarVariants = {
    open: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } },
    closed: { y: '-100%', opacity: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
  };

  // Nav item animation variants
  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  // Toggle button animation variants
  const toggleVariants = {
    open: { rotate: 90, scale: 1.1 },
    closed: { rotate: 0, scale: 1 },
    hover: { scale: 1.2, opacity: 1 },
  };

  // Responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1023) {
        setIsOpen(false); // Mobile: closed by default
      } else {
        setIsOpen(true); // Desktop: always open
      }
    };

    handleResize(); // Initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle NavBar on mobile
  const handleToggle = () => {
    if (window.innerWidth <= 1023) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      <motion.button
        className={styles.toggleButton}
        onClick={handleToggle}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        variants={toggleVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        whileHover="hover"
        transition={{ duration: 0.3 }}
      >
        <Menu className={styles.toggleIcon} />
      </motion.button>
      <motion.header
        className={styles.navBar}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        variants={navBarVariants}
      >
        <div className={styles.header}>
          <div className={styles.logo}>
            <img src="/img/Logo.svg" alt="App Logo" />
          </div>
          <nav className={styles.nav}>
            {navItems.map((item, index) => (
              <motion.div
                key={item.label}
                custom={index}
                initial="hidden"
                animate={isOpen ? 'visible' : 'hidden'}
                variants={navItemVariants}
              >
                <Link
                  to={item.route}
                  className={`${styles.navItem} ${getActiveRoute(item.route) ? styles.active : ''}`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
      </motion.header>
    </>
  );
};

export default StaffNavBar;