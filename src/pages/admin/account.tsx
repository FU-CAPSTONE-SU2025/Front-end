import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { jwtDecode } from 'jwt-decode';
import styles from '../../css/admin/account.module.css';
import BulkDataImport from '../../components/common/bulkDataImport';
import AccountCounter from '../../components/admin/accountCounter';
import AvatarUpload from '../../components/common/AvatarUpload';
import { getAuthState } from '../../hooks/useAuths';
import useActiveUserData from '../../hooks/useActiveUserData';
import useUserProfile from '../../hooks/useUserProfile';
import { JWTAccountProps } from '../../interfaces/IAccount';
import { validateEmail } from '../../components/common/validation';
import { useNavigate } from 'react-router';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';

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
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const { accessToken } = getAuthState();
  const { categorizedData, refetch } = useActiveUserData();
  const { logout } = getAuthState();
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useApiErrorHandler();
  
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

  // Use the unified user profile hook for both profile and avatar management
  const {
    getCurrentUserQuery,
    updateProfileAsync,
    isUpdatingProfile,
    isUpdateSuccess,
    updateError,
  } = useUserProfile({
    userId: userId || 0,
    userRole: 'admin',
    onAvatarUpdate: () => {
      // Refresh user data after avatar update
      refetchUser();
    }
  });

  // Get the user query using the current userId
  const userQuery = getCurrentUserQuery(userId);
  const { data: currentUserData, isLoading: isLoadingCurrentUser, error: currentUserError, refetch: refetchUser } = userQuery;
  //console.log('currentUserData: ',currentUserData)
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Set userId on component mount
  useEffect(() => {
    const id = getUserIdFromToken();
    setUserId(id);
  }, [accessToken]);

  // Placeholder/fallback data when API fails or no data available
  const getDisplayValue = (value: any, placeholder: string) => {
    if (isLoadingCurrentUser) return "Loading...";
    return value && String(value).trim() !== "" ? String(value) : placeholder;
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
  const getAvatarUrl = () => {
    if (isLoadingCurrentUser) return "Loading...";
    return currentUserData?.avatarUrl;
  };

  // Update form values when API data changes
  useEffect(() => {
    if (currentUserData) {
      setFirstName(currentUserData.firstName || "");
      setLastName(currentUserData.lastName || "");
      setEmail(currentUserData.email || "");
      setUsername(currentUserData.username || "");
      if (currentUserData.dateOfBirth) {
        const dateObj = dayjs(currentUserData.dateOfBirth);
        setSelectedDate(dateObj.isValid() ? dateObj : null);
      } else {
        setSelectedDate(null);
      }

    }
  }, [currentUserData]);

  // Handle successful profile update
  useEffect(() => {
    if (isUpdateSuccess) {
      handleSuccess('Profile updated successfully!');
      setIsEditing(false);
      setErrors({});
      // Refresh the profile data
      refetchUser();
    }
  }, [isUpdateSuccess, refetchUser]);

  // Fetch categorized data on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
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
        const dateObj = dayjs(currentUserData.dateOfBirth);
        setSelectedDate(dateObj.isValid() ? dateObj : null);
      } else {
        setSelectedDate(null);
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
        handleError('Unable to identify user. Please try logging in again.');
        return;
      }

      const updateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        username: username.trim(),
        dateOfBirth: selectedDate ? selectedDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        avatarUrl: currentUserData?.avatarUrl || '',
        roleId: 1, // Default admin role ID
        status: 1,
        staffDataUpdateRequest: currentUserData?.staffDataDetailResponse || null,
        studentDataUpdateRequest: null
      };
      //console.log('updateData: ',updateData)
      try {
        await updateProfileAsync({ userId, data: updateData });
        refetch();
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    }
  };
  const handleDataImported = (importedData: { [type: string]: { [key: string]: string }[] }) => {
    // Extract admin profile data from the imported data
    const adminProfileData = importedData['ADMIN_PROFILE'] || [];
    handleSuccess(`Successfully imported ${adminProfileData.length} admin profiles`);
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
      <div className={styles.twoCardContainer}>
        {/* Card: Profile Data */}
        <motion.div className={styles.topCard} variants={cardVariants} initial="hidden" animate="visible">
          {/* Centered Avatar, Name, Role, Email */}
          <div className={styles.profileAvatar}>
            <AvatarUpload
              userId={userId || 0}
              currentAvatarUrl={getAvatarUrl()} 
              userRole="admin"
              size={120}
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
              <span className={styles.infoValue}>{isEditing ? <DatePicker className={styles.datePicker} onChange={handleDateChange} value={selectedDate && selectedDate.isValid() ? selectedDate : null} placeholder="Select date of birth" format="YYYY-MM-DD" allowClear disabled={isLoadingCurrentUser} size="large" /> : getDisplayValue(currentUserData?.dateOfBirth ? dayjs(currentUserData.dateOfBirth).format('YYYY-MM-DD') : '', "N/A")}</span>
            </div>
          </div>
          {hasErrors && (
            <motion.div className={styles.errorContainer} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              {errors.email && <div className={styles.error}>Email: {errors.email}</div>}
            </motion.div>
          )}
            <motion.div className={styles.toolCard} variants={cardVariants} initial="hidden" animate="visible">
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
        </motion.div>
      </div>
    </>
  );
};

export default Profile;
