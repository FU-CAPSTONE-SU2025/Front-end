import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ConfigProvider, DatePicker, Table, Button } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import styles from '../../css/admin/logs.module.css';
import { mockApiLogs, mockUserActivity } from '../../../data/mockData';

interface ActivityData {
  date: string;
  student: number;
  advisor: number;
  manager: number;
  staff: number;
}

interface ApiLog {
  id: string;
  userId: string;
  role: string;
  apiType: string;
  timestamp: string;
}

const LogsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);

  // Custom date filter function
  const isBetweenDates = (dateStr: string, start: Date, end: Date) => {
    const date = new Date(dateStr);
    // Set time to midnight for consistent day comparison
    date.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return date >= start && date <= end;
  };

  // Filter activity data by date range
  const filteredActivity = useMemo(() => {
    if (!dateRange) return mockUserActivity;
    const [start, end] = dateRange;
    return mockUserActivity.filter(item => isBetweenDates(item.date, start, end));
  }, [dateRange]);

  // Table columns
  const columns = [
    { title: 'User ID', dataIndex: 'userId', key: 'userId', sorter: (a: ApiLog, b: ApiLog) => a.userId.localeCompare(b.userId) },
    { title: 'Role', dataIndex: 'role', key: 'role', sorter: (a: ApiLog, b: ApiLog) => a.role.localeCompare(b.role) },
    { title: 'API Type', dataIndex: 'apiType', key: 'apiType', sorter: (a: ApiLog, b: ApiLog) => a.apiType.localeCompare(b.apiType) },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a: ApiLog, b: ApiLog) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
  ];

  // Export to XLSX
  const exportToXlsx = () => {
    const worksheet = XLSX.utils.json_to_sheet(mockApiLogs.map(log => ({
      'User ID': log.userId,
      'Role': log.role,
      'API Type': log.apiType,
      'Timestamp': log.timestamp,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'API Logs');
    XLSX.writeFile(workbook, 'api_logs.xlsx');
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: 'rgba(255, 255, 255, 0.1)',
            headerColor: '#ffffff',
            rowHoverBg: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
        },
      }}
    >
      <div className={styles.container}>
        <motion.div className={styles.card} variants={cardVariants} initial="hidden" animate="visible">
          <h1>System Log & Monitoring</h1>
          <div className={styles.chartSection}>
            <div className={styles.chartHeader}>
              <h2>User Activeness</h2>
              <DatePicker.RangePicker
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0].toDate(), dates[1].toDate()]);
                  } else {
                    setDateRange(null);
                  }
                }}
                className={styles.datePicker}
              />
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={filteredActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="date" stroke="#ffffff" />
                  <YAxis stroke="#ffffff" label={{ value: 'Active Users', angle: -90, position: 'insideLeft', fill: '#ffffff' }} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="student" stroke="rgba(255, 145, 77, 1)" name="Students" />
                  <Line type="monotone" dataKey="advisor" stroke="rgba(38, 98, 217, 1)" name="Advisors" />
                  <Line type="monotone" dataKey="manager" stroke="rgba(82, 196, 26, 1)" name="Managers" />
                  <Line type="monotone" dataKey="staff" stroke="rgba(189, 68, 219, 1)" name="Staff" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <h2>API Call Logs</h2>
              <Button type="primary" onClick={exportToXlsx} className={styles.exportButton}>
                Export to XLSX
              </Button>
            </div>
            <Table
              className={styles.table}
              columns={columns}
              dataSource={mockApiLogs}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 'max-content' }}
            />
          </div>
        </motion.div>
      </div>
    </ConfigProvider>
  );
};

export default LogsPage;