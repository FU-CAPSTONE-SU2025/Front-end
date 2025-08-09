import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ConfigProvider, DatePicker, Table, Button } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import styles from '../../css/admin/logs.module.css';
import { mockUserActivity } from '../../../data/mockData';
import { useAuditLog } from '../../hooks/useAuditLog';
import { AuditLog } from '../../interfaces/IAuditLog';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';

const LogsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const { handleError, handleSuccess } = useApiErrorHandler();
  const { 
    auditLogs, 
    loading, 
    currentPage, 
    pageSize, 
    total, 
    error, 
    fetchAuditLogs, 
    downloadAllAuditLogs 
  } = useAuditLog();



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



  // Table columns for audit logs
  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 80,
      sorter: (a: AuditLog, b: AuditLog) => a.id - b.id 
    },
    { 
      title: 'Tag', 
      dataIndex: 'tag', 
      key: 'tag', 
      width: 150,
      sorter: (a: AuditLog, b: AuditLog) => a.tag.localeCompare(b.tag) 
    },
    { 
      title: 'Description', 
      dataIndex: 'description', 
      key: 'description',
      ellipsis: true,
      render: (text: string | null) => text || '-'
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a: AuditLog, b: AuditLog) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (text: string) => new Date(text).toLocaleString()
    },
  ];



  // Export to XLSX
  const exportToXlsx = async () => {
    try {
      const allLogs = await downloadAllAuditLogs();
      const worksheet = XLSX.utils.json_to_sheet(allLogs.map((log: AuditLog) => ({
        'ID': log.id,
        'Tag': log.tag,
        'Description': log.description || '',
        'Created At': new Date(log.createdAt).toLocaleString(),
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Logs');
      XLSX.writeFile(workbook, 'audit_logs.xlsx');
      handleSuccess('Audit logs exported successfully!');
    } catch (err) {
      handleError(err, 'Failed to export audit logs');
      console.error('Export error:', err);
    }
  };

  // Handle table pagination
  const handleTableChange = (pagination: any) => {
    fetchAuditLogs(pagination.current, pagination.pageSize);
  };



  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <ConfigProvider>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 13}} />
                  <YAxis stroke="#64748b" tick={{fontSize: 13}} label={{ value: 'Active Users', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 13 }} axisLine={{stroke:'#e5e7eb'}} tickLine={{stroke:'#e5e7eb'}} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.98)', border: '1px solid #e5e7eb', color: '#1E293B' }} labelStyle={{ color: '#1E293B' }} />
                  <Legend />
                  <Line type="monotone" dataKey="student" stroke="#f59e42" name="Students" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="advisor" stroke="#2563eb" name="Advisors" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="manager" stroke="#22c55e" name="Managers" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="staff" stroke="#a21caf" name="Staff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <h2>Audit Logs</h2>
              <Button 
                type="primary" 
                onClick={exportToXlsx} 
                className={styles.exportButton}
                loading={loading}
              >
                Export to XLSX
              </Button>
            </div>
            {error && (
              <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>
                {error}
              </div>
            )}
            <Table
              className={styles.table}
              columns={columns}
              dataSource={auditLogs}
              rowKey="id"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 'max-content' }}
            />
          </div>
          
        </motion.div>
      </div>
    </ConfigProvider>
  );
};

export default LogsPage;