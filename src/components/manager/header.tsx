import { NavLink, useNavigate } from 'react-router';
import { Avatar, Tooltip, Tag } from 'antd';
import { motion } from 'framer-motion';
import Notification from '../common/Notification';
import styles from '../../css/manager/managerHeader.module.css';

const navLinks = [
  { name: 'Programs', path: '/manager/program' },
  { name: 'Curriculum', path: '/manager/curriculum' },
  { name: 'Combos', path: '/manager/combo' },
  { name: 'Subjects', path: '/manager/subject' },
  { name: 'Student Monitoring', path: '/manager/student-monitoring' },
];

const ManagerHeader = () => {
  const navigate = useNavigate();
  return (
    <motion.header
      className={styles.headerRoot}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      <div className={styles.container}>
        <div className={styles.toolbar}>
          {/* Logo and Nav Links */}
          <div className={styles.brandRow}>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.98 }} className={styles.logoWrap}>
              <img src="/Logo.svg" alt="AI SEA Logo" />
            </motion.div>
            <nav className={styles.nav}>
              {navLinks.map((link) => (
                <div key={link.name}>
                  <NavLink
                    to={link.path}
                    end={link.path === '/manager'}
                    className={({ isActive }) =>
                      `${styles.linkItem} ${isActive ? styles.linkActive : ''}`
                    }
                  >
                    {link.name}
                  </NavLink>
                </div>
              ))}
            </nav>
            <Tag className={styles.badge}>Manager</Tag>
          </div>

          <div className={styles.rightRow}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.97 }}>
              <Tooltip title="Profile">
                <span className={styles.profileLink} onClick={() => navigate('/manager')}>
                  View Profile
                </span>
              </Tooltip>
            </motion.div>
            <Notification />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default ManagerHeader;
