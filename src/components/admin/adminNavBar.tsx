
import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router';
import { User, Users, Briefcase, BookUser, UserCog, Activity, Upload, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../css/admin/AdminNavBar.module.css';
import { getAuthState } from '../../hooks/useAuths';

// Interface for navigation items
interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
}

const AdminNavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { logout } = getAuthState();

  const navItems: NavItem[] = [
    { label: 'My account', icon: User, route: '' },
    { label: 'Manage Student', icon: Users, route: 'students' },
    { label: 'Manage Staff', icon: Briefcase, route: 'staff' },
    { label: 'Manage Advisor', icon: BookUser, route: 'advisors' },
    { label: 'Manage Manager', icon: UserCog, route: 'managers' },
    { label: 'View system log and monitoring', icon: Activity, route: 'logs' },
    { label: 'Import Data', icon: Upload, route: 'import' },
  ];

  // Sidebar animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
    closed: {
      x: '-100%',
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
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

  // Hamburger animation variants
  const hamburgerVariants = {
    open: { rotate: 90, scale: 1.1 },
    closed: { rotate: 0, scale: 1 },
    hover: { scale: 1.2, opacity: 1 },
  };

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1023) {
        setIsOpen(true); // Computer: always open Navbar
      } else {
        setIsOpen(false); // Mobile: closed Navbar by default
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle isOpen only on mobile
  const handleToggle = () => {
    if (window.innerWidth <= 1023) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      <motion.button
        className={styles.hamburger}
        onClick={handleToggle}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        variants={hamburgerVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
        whileHover="hover"
        transition={{ duration: 0.3 }}
      >
        ☰
      </motion.button>
      <AnimatePresence>
        <motion.aside
          className={styles.sidebar}
          initial="closed"
          animate={isOpen ? 'open' : 'closed'}
          variants={sidebarVariants}
        >
          <div className={styles.header}>
            <div className={styles.logo}>
              <img
                src="/img/Logo.svg"
                alt="AI-SEA Logo"
              />  
            </div>
          </div>
          <nav className={styles.nav}>
            {navItems.map((item, index) => (
              <React.Fragment key={item.label}>
                {index === 1 || index === 5 ? <hr className={styles.divider} /> : null}
                <motion.div
                  custom={index}
                  initial="hidden"
                  animate={isOpen ? 'visible' : 'hidden'}
                  variants={navItemVariants}
                >
                  <Link to={item.route} className={styles.navItem}>
                    <item.icon className={styles.icon} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              </React.Fragment>
            ))}
            <hr className={styles.divider} />
            <Link to="/" className={styles.logout} onClick={logout}>
              <span>Log out</span>
              <LogOut className={styles.logoutIcon} aria-hidden="true" />
            </Link>
            <div className={styles.footer}>@Powered by AISEA</div>
          </nav>
        </motion.aside>
      </AnimatePresence>
      <Outlet />
    </>
  );
};

export default AdminNavBar;
