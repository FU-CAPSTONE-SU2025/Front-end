/**
 * AccountCounter Component
 * -----------------------
 * Displays counters for user types in the AISEA System.
 *
 * Props:
 * - label: string or array of strings. User types to display ("Student", "Academic Staff", "Advisor", "Manager").
 * - student, staff, advisor, manager: Arrays of user objects for each type.
 *
 * Usage:
 * <AccountCounter
 *   label={["Student", "Academic Staff"]}
 *   student={studentArray}
 *   staff={staffArray}
 * />
 *
 * The component will display a counter for each label, showing the total number of users.
 * The render will generate a counting box based on how many labels are provided.
 * If multiple labels are provided, it will show counters for each type.
 * If a single label is provided, it will show a single counter.
 */
/// Yeah, try to follow the props correctly, ok?
import React from 'react';
import styles from '../../css/admin/accountCounter.module.css';

import CountData from '../common/countData';
interface AccountCounterProps {
  label: "Student"|"Academic Staff"|"Advisor"|"Manager"|["Student","Academic Staff","Advisor","Manager"];
  student?:Object[];
  staff?:Object[];
  advisor?:Object[];
  manager?:Object[];
}

const AccountCounter: React.FC<AccountCounterProps> = ({label="user", student,staff,advisor,manager}) => {

  function getCountForLabel(label: string, student?: Object[], staff?: Object[], advisor?: Object[], manager?: Object[]) {
    switch (label) {
      case "Student":
        return CountData(student ?? []);
      case "Academic Staff":
        return CountData(staff ?? []);
      case "Advisor":
        return CountData(advisor ?? []);
      case "Manager":
        return CountData(manager ?? []);
      default:
        return 0;
    }
  }

  return (
    <div className={`${styles.container}`} style={{
      background: 'rgba(255, 255, 255, 0.25)',
      backdropFilter: 'blur(30px) saturate(180%)',
      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.05)'
    }}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.titleWrapper}>
            <div className={styles.title}>AISEA System</div>
          </div>
          <div className={styles.subtitleWrapper}>
            <div className={styles.subtitle}>Showing active {Array.isArray(label)?"users":label.length>1?label:""} across the system</div>
          </div>
        </div>
        
        <div className={styles.counters}>
          {
            // ensures that label is always treated as an array, so you can easily map over it and render a counter for each user type.
            //If label is already an array, it uses it as-is.
            //If label is a single string, it wraps it in an array (so mapping still works).
            (Array.isArray(label) ? label : [label]).map((title) => (
              <div className={styles.counter} key={title}>
                <div className={styles.counterContent}>
                  <div className={
                    title.includes("Student")?styles.counterLabelStudent:
                    title.includes("Academic Staff")?styles.counterLabelStaff:
                    title.includes("Advisor")?styles.counterLabelAdvisor:
                    styles.counterLabelManager
                  }>{title}</div>
                  <div className={styles.counterValue}>{getCountForLabel(title, student, staff, advisor, manager)}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default AccountCounter;
