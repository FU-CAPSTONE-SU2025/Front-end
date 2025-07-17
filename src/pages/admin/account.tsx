import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ConfigProvider, Input, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';
import styles from '../../css/admin/account.module.css';
import BulkDataImport from '../../components/common/bulkDataImport';
import AccountCounter from '../../components/admin/accountCounter';
import AvatarUpload from '../../components/common/AvatarUpload';
import { getAuthState } from '../../hooks/useAuths';
import useActiveUserData from '../../hooks/useActiveUserData';
import useUserProfile from '../../hooks/useUserProfile';
import { AccountProps, JWTAccountProps } from '../../interfaces/IAccount';
import { validateEmail } from '../../components/common/validation';
import { useNavigate } from 'react-router';

const { TextArea } = Input;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
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
  const {logout} = getAuthState()
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout();
    navigate('/');
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

      const updateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        username: username.trim(),
        dateOfBirth: selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : new Date(),
        avatarUrl: currentUserData?.avatarUrl || '',
        roleId: 1, // Default admin role ID
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

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    // This will be handled by the AvatarUpload component automatically
    console.log('Avatar updated:', newAvatarUrl);
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
      <div className={styles.twoCardContainer}>
        {/* Left Card: Profile Data */}
        <motion.div className={styles.leftCard} variants={cardVariants} initial="hidden" animate="visible">
          {/* Centered Avatar, Name, Role, Email */}
          <div className={styles.profileAvatar}>
            <AvatarUpload
              userId={userId || 0}
              currentAvatarUrl={currentUserData?.avatarUrl}
              userRole="admin"
              currentUserData={currentUserData}
              size={120}
              onAvatarUpdate={handleAvatarUpdate}
              disabled={isLoadingCurrentUser}
              className={styles.avatar}
            />
          </div>
          <div className={styles.profileName}>{getDisplayName()}</div>
          <div className={styles.profileRole}>{getRoleDisplayName()}</div>
          <div className={styles.profileEmail}>{isLoadingCurrentUser ? "Loading..." : getDisplayValue(currentUserData?.email, "admin@company.com")}</div>
          <hr className={styles.infoDivider} />
          {/* Info List */}
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>First Name</span>
              <span className={styles.infoValue}>{isEditing ? <input className={styles.fieldContent} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Enter first name" /> : getDisplayValue(currentUserData?.firstName, "Admin")}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Last Name</span>
              <span className={styles.infoValue}>{isEditing ? <input className={styles.fieldContent} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Enter last name" /> : getDisplayValue(currentUserData?.lastName, "User")}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Username</span>
              <span className={styles.infoValue}>{isEditing ? <input className={styles.fieldContent} value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" /> : getDisplayValue(currentUserData?.username, "admin_user")}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email Address</span>
              <span className={styles.infoValue}>{isEditing ? <input className={styles.fieldContent} value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email address" type="email" /> : getDisplayValue(currentUserData?.email, "admin@company.com")}</span>
              {errors.email && <div className={styles.error}>{errors.email}</div>}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Date of Birth</span>
              <span className={styles.infoValue}>{isEditing ? <DatePicker className={styles.datePicker} onChange={date => handleDateChange(date ? date.toDate() : null)} value={getDateValue()} placeholder="Select date of birth" format="YYYY-MM-DD" allowClear disabled={isLoadingCurrentUser} size="large" /> : getDisplayValue(currentUserData?.dateOfBirth ? dayjs(currentUserData.dateOfBirth).format('YYYY-MM-DD') : '', "N/A")}</span>
            </div>
          </div>
          {hasErrors && (
            <motion.div className={styles.errorContainer} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              {errors.email && <div className={styles.error}>Email: {errors.email}</div>}
            </motion.div>
          )}
        </motion.div>
        {/* Right Card: Actions */}
        <motion.div className={styles.rightCard} variants={cardVariants} initial="hidden" animate="visible">
          <div className={styles.actionTitle}>ACTION</div>
          <div className={styles.actionCardContent}>
            {!isEditing ? (
              <motion.button
                className={styles.editButton}
                onClick={handleEdit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Edit Profile
              </motion.button>
            ) : (
              <>
                <motion.button
                  className={styles.saveButton}
                  onClick={handleSave}
                  disabled={isUpdatingProfile}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                </motion.button>
                <motion.button
                  className={styles.cancelButton}
                  onClick={handleCancel}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </>
            )}
            <motion.button
              className={styles.logoutButton}
              onClick={() => handleLogout()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Log Out
            </motion.button>
          </div>
        </motion.div>
      </div>
      {isImportOpen && (
        <BulkDataImport
          onClose={() => setIsImportOpen(false)}
          onDataImported={handleDataImported}
          supportedTypes={['ADMIN_PROFILE']}
        />
      )}
    </>
  );
};

export default Profile;
