
import React from 'react';
import styles from '../../css/admin/accountCounter.module.css';

const AccountCounter: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.titleWrapper}>
            <div className={styles.title}>AISEA System</div>
          </div>
          <div className={styles.subtitleWrapper}>
            <div className={styles.subtitle}>Showing total users across the system</div>
          </div>
        </div>
        <div className={styles.counters}>
          <div className={styles.counter}>
            <div className={styles.counterContent}>
              <div className={styles.counterLabel}>Student</div>
              <div className={styles.counterValue}>24,828</div>
            </div>
          </div>
          <div className={styles.counterAcademic}>
            <div className={styles.counterContent}>
              <div className={styles.counterLabelAcademic}>Academic Staff</div>
              <div className={styles.counterValue}>25,010</div>
            </div>
          </div>
          <div className={styles.counter}>
            <div className={styles.counterContent}>
              <div className={styles.counterLabelAdvisor}>Advisor</div>
              <div className={styles.counterValue}>100</div>
            </div>
          </div>
          <div className={styles.counter}>
            <div className={styles.counterContent}>
              <div className={styles.counterLabel}>Manager</div>
              <div className={styles.counterValue}>10</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCounter;
