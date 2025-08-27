import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Descriptions, Avatar, Button, ConfigProvider, Tooltip } from 'antd';
import { LogOut, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '../../css/staff/staffProfile.module.css';
import { getAuthState } from '../../hooks/useAuthState';
import { jwtDecode } from 'jwt-decode';
import { JWTAccountProps } from '../../interfaces/IAccount';
import useUserProfile from '../../hooks/useUserProfile';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';

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
  const [userId, setUserId] = useState<number | null>(null);
  const { accessToken } = getAuthState();
  const { handleError, handleSuccess } = useApiErrorHandler();
  
  // Use the user profile hook
  const {
    getCurrentUserQuery,
    isUpdateSuccess,
    updateError,
  } = useUserProfile();

  // Get the user query using the current userId
  const userQuery = getCurrentUserQuery(userId);
  const { data: currentUserData, isLoading: isLoadingCurrentUser, error: currentUserError, refetch: refetchUser } = userQuery;

  // Get user ID from JWT token
  const getUserIdFromToken = () => {
    try {
      const data: JWTAccountProps = jwtDecode(accessToken ?? "N/A");
      return data?.UserId ?? null;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  // Set userId on component mount
  useEffect(() => {
    const id = getUserIdFromToken();

    setUserId(id);
  }, [accessToken]);

  // Handle successful profile update
  useEffect(() => {
    if (isUpdateSuccess) {
      handleSuccess('Profile updated successfully!');
      // Refresh the profile data
      refetchUser();
    }
  }, [isUpdateSuccess, refetchUser]);

  // Handle update errors
  useEffect(() => {
    if (updateError) {
      handleError(updateError, 'Update failed');
      console.error('Update error:', updateError);
    }
  }, [updateError]);

  // Handle current user fetch errors
  useEffect(() => {
    if (currentUserError) {
      handleError(currentUserError, 'Failed to fetch user data');
    }
  }, [currentUserError]);

  
  // Helper function to get display value with loading state
  const getDisplayValue = (value: any, placeholder: string) => {
    if (isLoadingCurrentUser) return "Loading...";
    return value && String(value).trim() !== "" ? String(value) : placeholder;
  };

  // Helper function to get avatar URL
  const getAvatarUrl = () => {
    if (currentUserData?.avatarUrl) return currentUserData.avatarUrl;
    if (isLoadingCurrentUser) return "https://ui-avatars.com/api/?name=Loading&background=64748B&color=ffffff&size=120";
    return "https://ui-avatars.com/api/?name=Manager+User&background=1E40AF&color=ffffff&size=120";
  };

  // Helper function to format date
  const formatDate = (date: any) => {
    if (isLoadingCurrentUser) return "Loading...";
    if (!date) return "Not specified";
    try {
      return new Date(date).toLocaleDateString('en-GB');
    } catch {
      return "Invalid date";
    }
  };

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
          {/* Left Card: AccountProps */}
          <motion.div
            className={styles.card}
            variants={leftCardVariants}
            initial="hidden"
            animate="visible"
         
          >
            <h2 className={styles.title}>Profile Information</h2>
            <div className={styles.avatarWrapper}>
              <Avatar src={getAvatarUrl()} size={100} className={styles.avatar} />
            </div>
            <Descriptions column={1} bordered className={styles.description}>
              <Descriptions.Item label="Username">{getDisplayValue(currentUserData?.username, "Not specified")}</Descriptions.Item>
              <Descriptions.Item label="Email">{getDisplayValue(currentUserData?.email, "Not specified")}</Descriptions.Item>
              <Descriptions.Item label="First Name">{getDisplayValue(currentUserData?.firstName, "Not specified")}</Descriptions.Item>
              <Descriptions.Item label="Last Name">{getDisplayValue(currentUserData?.lastName, "Not specified")}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">{formatDate(currentUserData?.dateOfBirth)}</Descriptions.Item>
              <Descriptions.Item label="Role">{getDisplayValue(currentUserData?.roleName, "Academic Staff")}</Descriptions.Item>
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
                <Descriptions.Item label="Department">{getDisplayValue(currentUserData?.staffDataDetailResponse?.department, "Not specified")}</Descriptions.Item>
                <Descriptions.Item label="Position">{getDisplayValue(currentUserData?.staffDataDetailResponse?.position, "Not specified")}</Descriptions.Item>
                <Descriptions.Item label="Campus">{getDisplayValue(currentUserData?.staffDataDetailResponse?.campus, "Not specified")}</Descriptions.Item>
                <Descriptions.Item label="Start Work Date">{formatDate(currentUserData?.staffDataDetailResponse?.startWorkAt)}</Descriptions.Item>
                <Descriptions.Item label="End Work Date">{formatDate(currentUserData?.staffDataDetailResponse?.endWorkAt)}</Descriptions.Item>
              </Descriptions>
            </motion.div>

            {/* Action Card */}
            <motion.div
              className={styles.actionCard}
              variants={actionCardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className={styles.actionButtons}>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="primary"
                    className={styles.logoutButton}
                    onClick={handleLogout}
                    icon={<LogOut size={16} />}
                    block
                  >
                    Logout
                  </Button>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Tooltip title="Contact support via email">
                  <Button
                    type="default"
                    className={styles.actionButton}
                    onClick={handleContactSupport}
                    icon={<Mail size={16} />}
                    block
                  >
                    Contact Support
                  </Button>
                  </Tooltip>
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