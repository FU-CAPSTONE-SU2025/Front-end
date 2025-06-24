import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Descriptions, Avatar, Button, ConfigProvider } from 'antd';
import { LogOut, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '../../css/staff/staffProfile.module.css';
import { StaffProfileData } from '../../interfaces/IStaff';
import { getAuthState } from '../../hooks/useAuths';

// Mock staff data (replace with API call in production)
const mockStaff: StaffProfileData = {
  username: 'staffUser123',
  password: 'securePass123',
  email: 'staff@example.com',
  avatarUrl: '/img/avatar-placeholder.png',
  firstName: 'Jane',
  lastName: 'Doe',
  dateOfBirth: new Date('1990-05-15'),
  address: '123 Main St, City, Country',
  department: 'Academic Services',
  position: 'Counselor',
  id: 1,
  roleId: 3,
  phone: '',
  campus: '',
  startWorkAt: "",
  endWorkAt: ""
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

const StaffProfile: React.FC = () => {
  const navigate = useNavigate();
  const {logout}  = getAuthState()
  // Debug animation states
  useEffect(() => {
    console.log('StaffProfile animation triggered');
    return () => console.log('StaffProfile animation cleanup');
  }, []);

  // Mock logout function (replace with actual auth logic)
  const handleLogout = () => {
    logout()
    localStorage.removeItem('authToken'); // Example placeholder
    navigate('/');
  };

  // Contact support via Gmail
  const handleContactSupport = () => {
    const subject = encodeURIComponent('Support Request');
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
          {/* Left Card: AccountProps */}
          <motion.div
            className={styles.card}
            variants={leftCardVariants}
            initial="hidden"
            animate="visible"
            onAnimationComplete={() => console.log('Left card animation complete')}
          >
            <h2 className={styles.title}>Profile Information</h2>
            <div className={styles.avatarWrapper}>
              <Avatar src={mockStaff.avatarUrl} size={100} className={styles.avatar} />
            </div>
            <Descriptions column={1} bordered className={styles.description}>
              <Descriptions.Item label="Username">{mockStaff.username}</Descriptions.Item>
              <Descriptions.Item label="Email">{mockStaff.email}</Descriptions.Item>
              <Descriptions.Item label="First Name">{mockStaff.firstName}</Descriptions.Item>
              <Descriptions.Item label="Last Name">{mockStaff.lastName}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {mockStaff.dateOfBirth.toLocaleDateString('en-GB')}
              </Descriptions.Item>
              <Descriptions.Item label="Address">{mockStaff.address}</Descriptions.Item>
            </Descriptions>
          </motion.div>

          {/* Right Card: StaffBase + Action Card */}
          <div className={styles.rightColumn}>
            <motion.div
              className={styles.card}
              variants={rightCardVariants}
              initial="hidden"
              animate="visible"
              onAnimationComplete={() => console.log('Right card animation complete')}
            >
              <h2 className={styles.title}>Staff's Details</h2>
              <Descriptions column={1} bordered className={styles.description}>
                <Descriptions.Item label="Department">{mockStaff.department}</Descriptions.Item>
                <Descriptions.Item label="Position">{mockStaff.position}</Descriptions.Item>
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

export default StaffProfile;