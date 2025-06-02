import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../../css/admin/account.module.css';
import AccountCounter from '../../components/admin/accountCounter';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  return (
    <>
      <AccountCounter />
      <div className={styles.container}>
        <motion.div className={styles.profileCard} variants={cardVariants} initial="hidden" animate="visible">
          <div className={styles.userInfo}>
            <img src="https://placehold.co/120x120" alt="User Avatar" className={styles.avatar} />
            <div className={styles.name}>Last Name + First Name</div>
            <div className={styles.role}>AISEA Administrator</div>
            <div className={styles.email}>something@gmail.com</div>
          </div>
          <div className={styles.formFields}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <div className={styles.fieldContent}>firstname</div>
              </div>
              <div className={styles.field}>
                <div className={styles.fieldContent}>lastname</div>
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <div className={styles.fieldContent}>Email</div>
              </div>
              <div className={styles.field}>
                <div className={styles.fieldContent}>password</div>
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <div className={styles.fieldContent}>Address</div>
              </div>
              <div className={styles.field}>
                <div className={styles.fieldContent}>Phone</div>
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <div className={styles.fieldContent}>Date of Birth</div>
                <DatePicker
                  className={styles.datePicker}
                  onChange={(date) => handleDateChange(date ? date.toDate() : null)}
                  value={selectedDate ? dayjs(selectedDate) : null}
                  placeholder="Select Date"
                  format="YYYY-MM-DD"
                  allowClear
                />
              </div>
         
            </div>
          </div>
        </motion.div>
        <motion.div className={styles.actionPanel} variants={actionPanelVariants} initial="hidden" animate="visible">
          <div className={styles.actionTitle}>Action</div>
          <div className={styles.actions}>
            {['Edit Account', 'Import Data From xlsx', 'Delete Account', 'Logout'].map((action, index) => (
              <motion.div
                key={index}
                className={styles.actionButton}
                data-state="Default"
                data-type="Primary"
                variants={buttonVariants}
                whileHover="hover"
              >
                <div className={styles.buttonContent}>{action}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Profile;
