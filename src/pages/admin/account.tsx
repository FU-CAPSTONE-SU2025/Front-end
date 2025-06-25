
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../../css/admin/account.module.css';
import AccountCounter from '../../components/admin/accountCounter';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { validateEmail, validatePhone } from '../../components/common/validation';
import DataImport from '../../components/admin/dataImport';
import { jwtDecode } from 'jwt-decode';
import { getAuthState } from '../../hooks/useAuths';
import { AccountProps, ActiveCategoriesProp } from '../../interfaces/IAccount';
import useActiveUserData from '../../hooks/useActiveUserData';

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
  const [firstName, setFirstName] = useState<string>("First Name");
  const [lastName, setLastName] = useState<string>("Last Name");
  const [email, setEmail] = useState<string>("something@gmail.com");
  const [password, setPassword] = useState<string>("password");
  const [address, setAddress] = useState<string>("Address");
  const [phone, setPhone] = useState<string>("Phone");
  const [profile,setProfile]  = useState<AccountProps>()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const {accessToken} = getAuthState()
  const { categorizedData, refetch } = useActiveUserData();
// Call refetch() to fetch the data
// categorizedData?.student, categorizedData?.staff, etc.
  useEffect(() => {
    refetch()
    getAdminProfile()
  },[])
     const getAdminProfile = () => {
     const data:AccountProps = jwtDecode(accessToken??"N/A")
     console.log("Admin account: ",data)
       setProfile(data)
    }
  

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Reset to initial values
    setFirstName("First Name");
    setLastName("Last Name");
    setEmail("something@gmail.com");
    setPassword("password");
    setAddress("Address");
    setPhone("Phone");
    setSelectedDate(null);
  };

  const handleSave = () => {
    const newErrors: { [key: string]: string | null } = {
      email: validateEmail(email),
      phone: validatePhone(phone),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === null)) {
      setIsEditing(false);
      setErrors({});
      console.log("Saving data:", { firstName, lastName, email, password, address, phone, selectedDate });
    }
  };

  const handleImport = () => {
    setIsImportOpen(true);
    setIsEditing(true);
  };

  const handleDataImported = (data: { [key: string]: string }) => {
    setFirstName(data.firstName || firstName);
    setLastName(data.lastName || lastName);
    setEmail(data.email || email);
    setPassword(data.password || password);
    setAddress(data.address || address);
    setPhone(data.phone || phone);
    if (data.dateOfBirth) {
      setSelectedDate(dayjs(data.dateOfBirth).toDate());
    }
  };

  const hasErrors = Object.values(errors).some((error) => error !== null);

  return (
    <>  {console.log(categorizedData)}
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
            <img src={profile?.avatarUrl??"https://placehold.co/120x120"} alt="User Avatar" className={styles.avatar} />
            <div className={styles.name}>{profile?.lastName} + {profile?.firstName}</div>
            <div className={styles.role}>AISEA Administrator</div>
            <div className={styles.email}>{email}</div>
          </div>
          <div className={styles.formFields}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <input
                  className={styles.fieldContent}
                  value={profile?.firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
              <div className={styles.field}>
                <input
                  className={styles.fieldContent}
                  value={profile?.lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <input
                  className={styles.fieldContent}
                  value={profile?.email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <input
                  className={styles.fieldContent}
                  value={profile?.address||"N/A"}
                  onChange={(e) => setAddress(e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
              <div className={styles.field}>
                <input
                  className={styles.fieldContent}
                  value={profile?.phone}
                  onChange={(e) => setPhone(e.target.value)}
                  readOnly={!isEditing}
                />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.datefield}>
                <div className={styles.fieldContent}>Date of Birth</div>
                <DatePicker
                  className={styles.datePicker}
                  onChange={(date) => handleDateChange(date ? date.toDate() : null)}
                  value={profile && profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null}
                  placeholder="Select Date"
                  format="YYYY-MM-DD"
                  allowClear
                  disabled={!isEditing}
                />
              </div>
            </div>
            {hasErrors && (
              <div className={styles.errorContainer}>
                {errors.email && <div className={styles.error}>Email: {errors.email}</div>}
                {errors.phone && <div className={styles.error}>Phone: {errors.phone}</div>}
              </div>
            )}
            {isEditing && (
              <div className={styles.editActions}>
                <motion.div
                  className={styles.saveButton}
                  variants={buttonVariants}
                  whileHover="hover"
                  onClick={handleSave}
                >
                  <div className={styles.buttonContent}>Save</div>
                </motion.div>
                <motion.div
                  className={styles.cancelButton}
                  variants={buttonVariants}
                  whileHover="hover"
                  onClick={handleCancel}
                >
                  <div className={styles.buttonContent}>Cancel</div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
        <motion.div className={styles.actionPanel} variants={actionPanelVariants} initial="hidden" animate="visible">
          <div className={styles.actions}>
            {['Edit Account', 'Import Data From xlsx','Logout'].map((action, index) => (
              <motion.div
                key={index}
                className={`${styles.actionButton} ${action === 'Edit Account' && isEditing ? styles.editActive : ''}`}
                data-state="Default"
                data-type="Primary"
                variants={buttonVariants}
                whileHover="hover"
                onClick={action === 'Edit Account' ? handleEdit : action === 'Import Data From xlsx' ? handleImport : undefined}
              >
                <div className={`${styles.buttonContent} ${action === 'Edit Account' && isEditing ? styles.textEditActive : ''}`}>
                  {action}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
          {isImportOpen && (
          <div className={styles.modalOverlay}>
            <DataImport onClose={() => {setIsImportOpen(false);setIsEditing(true)}} onDataImported={handleDataImported} />
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
function useFetchTableData(): { categorizedData: any; isLoading: any; error: any; refetch: any; } {
  throw new Error('Function not implemented.');
}

