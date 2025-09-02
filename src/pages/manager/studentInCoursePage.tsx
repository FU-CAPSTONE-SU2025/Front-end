import React from 'react';
import { Typography } from 'antd';
import { motion } from 'framer-motion';
import styles from '../../css/manager/studentInCoursePage.module.css';
import { useFlmDashboard } from '../../hooks/useFlmDashboard';
import OverviewDashboardCard from '../../components/manager/overviewDashboardCard';
import SubjectDashboardCard from '../../components/manager/subjectDashboardCard';
import CurriculumDashboardCard from '../../components/manager/curriculumDashboardCard';
import StudentTableSection from '../../components/manager/studentTableSection';

const { Text, Title } = Typography;

const StudentInCoursePage: React.FC = () => {
  const { overviewData, subjectData, curriculumData, loading, error } = useFlmDashboard();

  return (
    <div className={styles.container}>
      {/* Overview Dashboard Card - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={styles.motionContainer}
      >
        <OverviewDashboardCard data={overviewData} loading={loading} />
      </motion.div>

      {/* Subject Dashboard Card - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={styles.motionContainer}
      >
        <SubjectDashboardCard data={subjectData} loading={loading} />
      </motion.div>

      {/* Curriculum Dashboard Card - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className={styles.motionContainer}
      >
        <CurriculumDashboardCard data={curriculumData} loading={loading} />
      </motion.div>

      {/* Student Table Section */}
      <StudentTableSection />

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className={styles.motionContainer}
        >
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#fff2f0', 
            border: '1px solid #ffccc7', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Text type="danger">Error loading dashboard data: {error}</Text>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudentInCoursePage;
