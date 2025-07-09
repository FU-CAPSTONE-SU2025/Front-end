import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Descriptions, Avatar, Button, ConfigProvider } from 'antd';
import { LogOut, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '../../css/staff/staffProfile.module.css';
import { ManagerBase } from '../../interfaces/IManager';
import { getAuthState } from '../../hooks/useAuths';

// Mock manager data (replace with API call in production)
const mockManager: ManagerBase = {
  username: 'managerUser123',
  password: 'securePass123',
  email: 'manager@example.com',
  avatarUrl: '/img/avatar-placeholder.png',
  firstName: 'John',
  lastName: 'Smith',
  dateOfBirth: new Date('1985-03-20'),
  address: '456 Executive Ave, Business District, Country',
  department: 'Academic Management',
  position: 'Program Manager',
  id: 1,
  roleId: 4,
  phone: '+1-555-0123',
  startWorkAt: new Date('2020-01-15'),
  endWorkAt: undefined
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const leftCardVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut', delay: 0.2 } },
};

const rightCardVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut', delay: 0.4 } },
};

const actionCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut', delay: 0.6 } },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

const ManagerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = getAuthState();

  // Debug animation states
  useEffect(() => {
    console.log('ManagerProfile animation triggered');
    return () => console.log('ManagerProfile animation cleanup');
  }, []);

  // Mock logout function (replace with actual auth logic)
  const handleLogout = () => {
    logout();
    localStorage.removeItem('authToken'); // Example placeholder
    navigate('/');
  };

  // Contact support via Gmail
  const handleContactSupport = () => {
    const subject = encodeURIComponent('Manager Support Request');
    const mailto = `mailto:support@example.com?subject=${subject}`;
    window.open(mailto, '_blank');
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Descriptions: {
            labelBg: 'rgba(255, 255, 255, 0.1)',
            contentColor: '#ffffff',
          },
        },
      }}
    >
      <motion.div
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.cardWrapper}>
          {/* Left Card: Personal Information */}
          <motion.div
            className={styles.card}
            variants={leftCardVariants}
            initial="hidden"
            animate="visible"
            onAnimationComplete={() => console.log('Left card animation complete')}
          >
            <h2 className={styles.title}>Profile Information</h2>
            <div className={styles.avatarWrapper}>
              <Avatar src={mockManager.avatarUrl} size={100} className={styles.avatar} />
            </div>
            <Descriptions column={1} bordered className={styles.description}>
              <Descriptions.Item label="Username">{mockManager.username}</Descriptions.Item>
              <Descriptions.Item label="Email">{mockManager.email}</Descriptions.Item>
              <Descriptions.Item label="First Name">{mockManager.firstName}</Descriptions.Item>
              <Descriptions.Item label="Last Name">{mockManager.lastName}</Descriptions.Item>
              <Descriptions.Item label="Phone">{mockManager.phone}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {mockManager.dateOfBirth.toLocaleDateString('en-GB')}
              </Descriptions.Item>
              <Descriptions.Item label="Address">{mockManager.address}</Descriptions.Item>
            </Descriptions>
          </motion.div>

          {/* Right Card: Management Details + Action Card */}
          <div className={styles.rightColumn}>
            <motion.div
              className={styles.card}
              variants={rightCardVariants}
              initial="hidden"
              animate="visible"
              onAnimationComplete={() => console.log('Right card animation complete')}
            >
              <h2 className={styles.title}>Management Details</h2>
              <Descriptions column={1} bordered className={styles.description}>
                <Descriptions.Item label="Department">{mockManager.department}</Descriptions.Item>
                <Descriptions.Item label="Position">{mockManager.position}</Descriptions.Item>
                <Descriptions.Item label="Start Work Date">
                  {mockManager.startWorkAt.toLocaleDateString('en-GB')}
                </Descriptions.Item>
                <Descriptions.Item label="End Work Date">
                  {mockManager.endWorkAt ? mockManager.endWorkAt.toLocaleDateString('en-GB') : 'Current'}
                </Descriptions.Item>
              </Descriptions>
            </motion.div>

            {/* Action Card */}
            <motion.div
              className={styles.actionCard}
              variants={actionCardVariants}
              initial="hidden"
              animate="visible"
              onAnimationComplete={() => console.log('Action card animation complete')}
            >
              <h2 className={styles.title}>Actions</h2>
              <div className={styles.actionButtons}>
                <motion.div variants={buttonVariants} whileHover="hover">
                  <Button
                    type="primary"
                    className={styles.actionButton}
                    onClick={handleLogout}
                    icon={<LogOut size={16} />}
                    block
                  >
                    Logout
                  </Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover">
                  <Button
                    type="default"
                    className={styles.actionButton}
                    onClick={handleContactSupport}
                    icon={<Mail size={16} />}
                    block
                  >
                    Contact Support
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </ConfigProvider>
  );
};

export default ManagerProfile; 