import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tag, Avatar, Badge, Tooltip } from 'antd';
import styles from '../../css/staff/staffNavBar.module.css';
import Notification from '../../components/common/Notification';

// Interface for navigation items
interface NavItem {
  label: string;
  route: string;
}

const StaffNavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { label: 'Student Transcript', route: '/staff/transcript' },
    { label: 'Programs', route: '/staff/programs' },
    { label: 'Curriculum', route: '/staff/curriculums' },
    { label: 'Subjects', route: '/staff/subjects' },
  ];

  // Determine active route
  const getActiveRoute = (route: string) => {
    return location.pathname.toLowerCase() === route.toLowerCase();
  };

  // NavBar animation variants
  const navBarVariants = {
    open: { y: 0, opacity: 1, transition: { duration: 0.3 } },
    closed: { y: '-100%', opacity: 0, transition: { duration: 0.3 } },
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
          <Tag className={styles.roleTag} color="orange" style={{
            fontSize: '12px',
            fontWeight: '600',
            padding: '4px 12px',
            borderRadius: '16px',
            border: '2px solid #fa8c16',
            backgroundColor: 'rgba(250, 140, 22, 0.1)',
            color: '#fa8c16',
            marginLeft: '16px',
            marginRight: '24px',
            boxShadow: '0 2px 4px rgba(250, 140, 22, 0.2)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            alignSelf: 'center'
          }}>
            Academic Staff
          </Tag>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.97 }} style={{ marginRight: '20px' }}>
            <Tooltip title="Profile">
              <Badge dot color="#52c41a" offset={[-2, 2]}>
                <Avatar
                  size={40}
                  src="https://via.placeholder.com/150"
                  style={{ border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer' }}
                  onClick={() => navigate('/staff')}
                />
              </Badge>
            </Tooltip>
          </motion.div>
          <div className={styles.notificationContainer}>
            <Notification variant="staff" />
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default StaffNavBar;