import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Descriptions, Avatar, Button, ConfigProvider, message } from 'antd';
import { LogOut, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '../../css/staff/staffProfile.module.css';
import { StaffProfileData } from '../../interfaces/IStaff';
import { getAuthState } from '../../hooks/useAuths';
import { jwtDecode } from 'jwt-decode';
import { JWTAccountProps, AccountProps } from '../../interfaces/IAccount';
import { GetCurrentStaffUser } from '../../api/Account/UserAPI';

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
  const { logout, accessToken } = getAuthState();
  const [userId, setUserId] = useState<number | null>(null);
  const [staffData, setStaffData] = useState<AccountProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get user ID from JWT token
  useEffect(() => {
    try {
      const data: JWTAccountProps = jwtDecode(accessToken ?? '');
      setUserId(data?.UserId ?? null);
    } catch (err) {
      setError('Failed to decode user token.');
    }
  }, [accessToken]);

  // Fetch staff data
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await GetCurrentStaffUser(userId);
        setStaffData(data);
      } catch (err) {
        setError('Failed to fetch staff data.');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Support Request');
    const mailto = `mailto:support@example.com?subject=${subject}`;
    window.open(mailto, '_blank');
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }
  if (!staffData) {
    return <div>No staff data found.</div>;
  }

  // StaffProfileData is nested in staffData.staffDataDetailResponse
  const staffProfile: StaffProfileData | null = staffData.staffDataDetailResponse ?? null;

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
          >
            <h2 className={styles.title}>Profile Information</h2>
            <div className={styles.avatarWrapper}>
              <Avatar src={staffData.avatarUrl} size={100} className={styles.avatar} />
            </div>
            <Descriptions column={1} bordered className={styles.description}>
              <Descriptions.Item label="Username">{staffData.username}</Descriptions.Item>
              <Descriptions.Item label="Email">{staffData.email}</Descriptions.Item>
              <Descriptions.Item label="First Name">{staffData.firstName}</Descriptions.Item>
              <Descriptions.Item label="Last Name">{staffData.lastName}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {new Date(staffData.dateOfBirth).toLocaleDateString('en-GB')}
              </Descriptions.Item>
            </Descriptions>
          </motion.div>

          {/* Right Card: StaffBase + Action Card */}
          <div className={styles.rightColumn}>
            <motion.div
              className={styles.card}
              variants={rightCardVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className={styles.title}>Staff's Details</h2>
              <Descriptions column={1} bordered className={styles.description}>
                <Descriptions.Item label="Department">{staffProfile?.department ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="Position">{staffProfile?.position ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="Campus">{staffProfile?.campus ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="Start Work At">{staffProfile?.startWorkAt ? new Date(staffProfile.startWorkAt).toLocaleDateString('en-GB') : '-'}</Descriptions.Item>
                <Descriptions.Item label="End Work At">{staffProfile?.endWorkAt ? new Date(staffProfile.endWorkAt).toLocaleDateString('en-GB') : '-'}</Descriptions.Item>
              </Descriptions>
            </motion.div>

            {/* Action Card */}
            <motion.div
              className={styles.actionCard}
              variants={actionCardVariants}
              initial="hidden"
              animate="visible"
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