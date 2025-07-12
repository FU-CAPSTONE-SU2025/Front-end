import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../../css/admin/account.module.css';
import AccountCounter from '../../components/admin/accountCounter';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { validateEmail } from '../../components/common/validation';
import BulkDataImport from '../../components/common/bulkDataImport';
import { jwtDecode } from 'jwt-decode';
import { getAuthState } from '../../hooks/useAuths';
import { JWTAccountProps, UpdateAccountProps } from '../../interfaces/IAccount';
import useActiveUserData from '../../hooks/useActiveUserData';
import { message } from 'antd';
import ExcelImportButton from '../../components/common/ExcelImportButton';
import { EditOutlined, LogoutOutlined } from '@ant-design/icons';
import useUserProfile from '../../hooks/useUserProfile';

// Animation variants for the profile card and action panel
const cardVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const actionPanelVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2 } },
};

// Button hover animation
const buttonVariants = {
  hover: { scale: 1.05, opacity: 0.9, transition: { duration: 0.2 } },
};

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const { accessToken } = getAuthState();
  const { categorizedData, refetch } = useActiveUserData();
  
  // Use the new user profile hook
  const {
    getCurrentUserQuery,
    updateProfileAsync,
    isUpdatingProfile,
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
      console.log('Decoded JWT data:', data);
      return data?.UserId ?? null;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  // Set userId on component mount
  useEffect(() => {
    const id = getUserIdFromToken();
    console.log('Setting user ID:', id);
    setUserId(id);
  }, [accessToken]);

  // Placeholder/fallback data when API fails or no data available
  const getDisplayValue = (value: any, placeholder: string) => {
    if (isLoadingCurrentUser) return "Loading...";
    return value && String(value).trim() !== "" ? String(value) : placeholder;
  };

  const getPlaceholderAvatar = () => {
    if (currentUserData?.avatarUrl) return currentUserData.avatarUrl;
    if (isLoadingCurrentUser) return "https://ui-avatars.com/api/?name=Loading&background=64748B&color=ffffff&size=120";
    return "https://ui-avatars.com/api/?name=Admin+User&background=1E40AF&color=ffffff&size=120";
  };

  const getDateValue = () => {
    if (isLoadingCurrentUser) return null;
    if (currentUserData && currentUserData.dateOfBirth) {
      return dayjs(currentUserData.dateOfBirth);
    }
    return null; // Will show placeholder in DatePicker
  };

  const getDisplayName = () => {
    if (isLoadingCurrentUser) return "Loading...";
    const firstName = getDisplayValue(currentUserData?.firstName, "Admin");
    const lastName = getDisplayValue(currentUserData?.lastName, "User");
    return `${firstName} ${lastName}`.trim();
  };

  const getRoleDisplayName = () => {
    if (isLoadingCurrentUser) return "Loading...";
    return getDisplayValue(currentUserData?.roleName, "AISEA Administrator");
  };

  // Update form values when API data changes
  useEffect(() => {
    if (currentUserData) {
      console.log('Setting form values from API data:', currentUserData);
      setFirstName(currentUserData.firstName || "");
      setLastName(currentUserData.lastName || "");
      setEmail(currentUserData.email || "");
      setUsername(currentUserData.username || "");
      if (currentUserData.dateOfBirth) {
        setSelectedDate(new Date(currentUserData.dateOfBirth));
      }
    }
  }, [currentUserData]);

  // Handle successful profile update
  useEffect(() => {
    if (isUpdateSuccess) {
      message.success('Profile updated successfully!');
      setIsEditing(false);
      setErrors({});
      // Refresh the profile data
      refetchUser();
    }
  }, [isUpdateSuccess, refetchUser]);

  // Handle update errors
  useEffect(() => {
    if (updateError) {
      message.error('Failed to update profile. Please try again.');
      console.error('Update error:', updateError);
    }
  }, [updateError]);

  // Handle current user fetch errors
  useEffect(() => {
    if (currentUserError) {
      console.error('Failed to fetch user data:', currentUserError);
      message.error('Failed to load user profile.');
    }
  }, [currentUserError]);

  // Fetch categorized data on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Reset form values to current profile data
    if (currentUserData) {
      setFirstName(currentUserData.firstName || "");
      setLastName(currentUserData.lastName || "");
      setEmail(currentUserData.email || "");
      setUsername(currentUserData.username || "");
      if (currentUserData.dateOfBirth) {
        setSelectedDate(new Date(currentUserData.dateOfBirth));
      }
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string | null } = {
      email: validateEmail(email),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === null)) {
      if (!userId) {
        message.error('Unable to identify user. Please try logging in again.');
        return;
      }

      const updateData: UpdateAccountProps = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        username: username.trim(),
        dateOfBirth: selectedDate ?? new Date(),
        avatarUrl: '',
        roleId: 1,
        status: 1,
        staffDataUpdateRequest: null,
        studentDataUpdateRequest: null
      };

      console.log('Saving profile with data:', updateData);

      try {
        await updateProfileAsync({ userId, data: updateData });
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    }
  };

  const handleImport = () => {
    setIsImportOpen(true);
    setIsEditing(true);
  };

  const handleDataImported = (importedData: { [type: string]: { [key: string]: string }[] }) => {
    // Extract admin profile data from the imported data
    const adminProfileData = importedData['ADMIN_PROFILE'] || [];
    message.success(`Successfully imported ${adminProfileData.length} admin profiles`);
    setIsImportOpen(false);
    // Refresh the account list
    refetch();
  };

  const hasErrors = Object.values(errors).some((error) => error !== null);

  return (
    <>  
      <AccountCounter 
        label={["Student", "Academic Staff", "Advisor", "Manager"]}
        student={categorizedData?.student}
        staff={categorizedData?.staff}
        advisor={categorizedData?.advisor}
        manager={categorizedData?.manager}
      />
      <div className={styles.container}>
        <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible">
          <div className={styles.userInfo}>
            <motion.img 
              src={getPlaceholderAvatar()} 
              alt="User Avatar" 
              className={styles.avatar}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            <div className={styles.profileHeader}>
              <h1 className={`${styles.name} ${isLoadingCurrentUser ? styles.loadingText : ''}`}>
                {getDisplayName()}
              </h1>
              <div className={styles.profileInfo}>
                <div className={styles.role}>{getRoleDisplayName()}</div>
                <div className={styles.divider}>•</div>
                <div className={`${styles.email} ${isLoadingCurrentUser ? styles.loadingText : ''}`}>
                  {isLoadingCurrentUser ? "Loading..." : getDisplayValue(currentUserData?.email, "admin@company.com")}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formFields}>
            <div className={styles.fieldRow}>
              <div className={styles.fieldColumn}>
                <label className={styles.fieldLabel}>First Name</label>
                <input
                  className={`${styles.fieldContent} ${isLoadingCurrentUser ? styles.loading : ''}`}
                  value={isEditing ? firstName : getDisplayValue(currentUserData?.firstName, "John")}
                  onChange={(e) => setFirstName(e.target.value)}
                  readOnly={!isEditing}
                  placeholder="Enter first name"
                />
              </div>
              <div className={styles.fieldColumn}>
                <label className={styles.fieldLabel}>Last Name</label>
                <input
                  className={`${styles.fieldContent} ${isLoadingCurrentUser ? styles.loading : ''}`}
                  value={isEditing ? lastName : getDisplayValue(currentUserData?.lastName, "Administrator")}
                  onChange={(e) => setLastName(e.target.value)}
                  readOnly={!isEditing}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div className={styles.fieldRow}>
              <div className={styles.fieldColumn}>
                <label className={styles.fieldLabel}>Username</label>
                <input
                  className={`${styles.fieldContent} ${isLoadingCurrentUser ? styles.loading : ''}`}
                  value={isEditing ? username : getDisplayValue(currentUserData?.username, "admin_user")}
                  onChange={(e) => setUsername(e.target.value)}
                  readOnly={!isEditing}
                  placeholder="Enter username"
                />
              </div>
              <div className={styles.fieldColumn}>
                <label className={styles.fieldLabel}>Email Address</label>
                <input
                  className={`${styles.fieldContent} ${isLoadingCurrentUser ? styles.loading : ''}`}
                  value={isEditing ? email : getDisplayValue(currentUserData?.email, "admin@company.com")}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!isEditing}
                  placeholder="Enter email address"
                  type="email"
                />
                {errors.email && <div className={styles.error}>{errors.email}</div>}
              </div>
            </div>
            
            <div className={styles.fieldRow}>
              <div className={styles.datefield}>
                <label className={styles.fieldLabel}>Date of Birth</label>
                <DatePicker
                  className={`${styles.datePicker} ${isLoadingCurrentUser ? styles.loading : ''}`}
                  onChange={(date) => handleDateChange(date ? date.toDate() : null)}
                  value={getDateValue()}
                  placeholder={isLoadingCurrentUser ? "Loading..." : "Select date of birth"}
                  format="YYYY-MM-DD"
                  allowClear
                  disabled={!isEditing || isLoadingCurrentUser}
                  size="large"
                />
              </div>
            </div>

            {hasErrors && (
              <motion.div 
                className={styles.errorContainer}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errors.email && <div className={styles.error}>Email: {errors.email}</div>}
              </motion.div>
            )}

            {isEditing && (
              <motion.div 
                className={styles.editActions}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <motion.button
                  className={styles.saveButton}
                  variants={buttonVariants}
                  whileHover="hover"
                  onClick={handleSave}
                  disabled={isUpdatingProfile}
                >
                  <div className={styles.buttonContent}>
                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                  </div>
                </motion.button>
                <motion.button
                  className={styles.cancelButton}
                  variants={buttonVariants}
                  whileHover="hover"
                  onClick={handleCancel}
                  disabled={isUpdatingProfile}
                >
                  <div className={styles.buttonContent}>Cancel</div>
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div className={styles.actionPanel} variants={actionPanelVariants} initial="hidden" animate="visible">
          <h2 className={styles.actionTitle}>Account Actions</h2>
          <div className={styles.actions}>
            {[
              { action: 'Edit Account', icon: <EditOutlined className={styles.actionIcon} /> },
              { action: 'Logout', icon: <LogoutOutlined className={styles.actionIcon} /> }
            ].map(({ action, icon }, index) => (
              <motion.div
                key={index}
                className={`${styles.actionButton} ${action === 'Edit Account' && isEditing ? styles.editActive : ''} ${action === 'Logout' ? styles.logoutButton : ''} ${isUpdatingProfile ? styles.disabled : ''}`}
                variants={buttonVariants}
                whileHover={isUpdatingProfile ? {} : "hover"}
                onClick={isUpdatingProfile ? undefined : (action === 'Edit Account' ? handleEdit : undefined)}
              >
                {icon}
                <div className={`${styles.buttonContent} ${action === 'Edit Account' && isEditing ? styles.textEditActive : ''}`}>
                  {action === 'Edit Account' && isEditing ? 'Editing...' : action}
                </div>
              </motion.div>
            ))}
            {/* Excel Import Button without blue wrapper */}
            <ExcelImportButton onClick={handleImport} size="large">
              Import Data From xlsx
            </ExcelImportButton>
          </div>
        </motion.div>

        {/* Data Import Modal */}
        {isImportOpen && (
          <BulkDataImport 
            onClose={() => setIsImportOpen(false)} 
            onDataImported={handleDataImported}
            supportedTypes={['ADMIN_PROFILE']}
          />
        )}
      </div>
    </>
  );
};

export default Profile;

