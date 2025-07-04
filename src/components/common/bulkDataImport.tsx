import React, { useState } from 'react';
import { Card, Steps, Button, Upload, message, Table, Space, Tag, Modal, Tabs, Input, Select, Switch, Tooltip } from 'antd';
import { UploadOutlined, FileExcelOutlined, CheckCircleOutlined, LoadingOutlined, EyeOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { getHeaderConfig, HeaderConfiguration } from '../../data/importConfigurations';
import styles from '../../css/bulkImport.module.css';

const { Dragger } = Upload;
const { Step } = Steps;
const { TabPane } = Tabs;

interface BulkImportData {
  type: HeaderConfiguration;
  data: { [key: string]: string }[];
  fileName: string;
  originalHeaders: string[];
}

interface BulkDataImportProps {
  onClose: () => void;
  onDataImported: (importedData: { [type: string]: { [key: string]: string }[] }) => void;
  supportedTypes?: HeaderConfiguration[];
}

const BulkDataImport: React.FC<BulkDataImportProps> = ({
  onClose,
  onDataImported,
  supportedTypes = ['STUDENT', 'STAFF', 'SUBJECT', 'PROGRAM', 'COMBO', 'CURRICULUM']
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<BulkImportData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<{ [type: string]: { [key: string]: string }[] }>({});
  const [previewData, setPreviewData] = useState<{ [type: string]: { [key: string]: string }[] }>({});
  const [editingData, setEditingData] = useState<{ [type: string]: { [key: string]: string }[] }>({});
  const [selectedRows, setSelectedRows] = useState<{ [type: string]: number[] }>({});
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        if (!jsonData || jsonData.length < 2) {
          message.error('File must contain headers and at least one data row.');
          setIsProcessing(false);
          return;
        }

        const headers = jsonData[0] as string[];
        
        // Try to identify the data type based on headers
        let identifiedType: HeaderConfiguration | null = null;
        
        for (const type of supportedTypes) {
          if (typeof type === 'string') {
            const config = getHeaderConfig(type);
            const hasAllRequiredHeaders = config.headers.every(header => 
              headers.includes(header)
            );
            
            if (hasAllRequiredHeaders) {
              identifiedType = type;
              break;
            }
          }
        }

        if (!identifiedType) {
          message.error('Could not identify data type. Please check your file headers.');
          setIsProcessing(false);
          return;
        }

        // Process the data
        const config = getHeaderConfig(identifiedType);
        const processedRows: { [key: string]: string }[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const processedRow: { [key: string]: string } = {};
          let hasValidData = false;

          headers.forEach((header, index) => {
            const fieldKey = config.fieldMap[header];
            if (fieldKey && row[index] !== undefined && row[index] !== null && row[index] !== '') {
              processedRow[fieldKey] = String(row[index]).trim();
              hasValidData = true;
            }
          });

          if (hasValidData) {
            processedRows.push(processedRow);
          }
        }

        if (processedRows.length === 0) {
          message.error('No valid data found in the file.');
          setIsProcessing(false);
          return;
        }

        const newUploadedFile: BulkImportData = {
          type: identifiedType,
          data: processedRows,
          fileName: file.name,
          originalHeaders: headers
        };

        setUploadedFiles(prev => [...prev, newUploadedFile]);
        message.success(`Successfully processed ${file.name} - ${processedRows.length} records`);
        setIsProcessing(false);
      } catch (error) {
        message.error('Error processing file. Please check the file format.');
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
    return false; // Prevent default upload behavior
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreviewData = () => {
    const previewDataObj: { [type: string]: { [key: string]: string }[] } = {};
    
    uploadedFiles.forEach(file => {
      const typeKey = typeof file.type === 'string' ? file.type : 'custom';
      if (!previewDataObj[typeKey]) {
        previewDataObj[typeKey] = [];
      }
      previewDataObj[typeKey].push(...file.data);
    });

    setPreviewData(previewDataObj);
    setEditingData(JSON.parse(JSON.stringify(previewDataObj))); // Deep copy for editing
    setShowPreview(true);
  };

  const handleEditRow = (type: string, rowIndex: number, field: string, value: string) => {
    setEditingData(prev => ({
      ...prev,
      [type]: prev[type].map((row, index) => 
        index === rowIndex ? { ...row, [field]: value } : row
      )
    }));
  };

  const handleDeleteRow = (type: string, rowIndex: number) => {
    setEditingData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, index) => index !== rowIndex)
    }));
  };

  const handleSelectRow = (type: string, rowIndex: number, selected: boolean) => {
    setSelectedRows(prev => ({
      ...prev,
      [type]: selected 
        ? [...(prev[type] || []), rowIndex]
        : (prev[type] || []).filter(index => index !== rowIndex)
    }));
  };

  const handleSelectAllRows = (type: string, selected: boolean) => {
    setSelectedRows(prev => ({
      ...prev,
      [type]: selected ? editingData[type].map((_, index) => index) : []
    }));
  };

  const handleDeleteSelectedRows = (type: string) => {
    const selectedIndices = selectedRows[type] || [];
    setEditingData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, index) => !selectedIndices.includes(index))
    }));
    setSelectedRows(prev => ({
      ...prev,
      [type]: []
    }));
  };

  const handleImportAll = () => {
    setProcessedData(editingData);
    onDataImported(editingData);
    setCurrentStep(2);
  };

  const getTypeDisplayName = (type: HeaderConfiguration): string => {
    if (typeof type === 'string') {
      return type.charAt(0) + type.slice(1).toLowerCase();
    }
    return 'Custom';
  };

  const getFieldDisplayName = (field: string): string => {
    // Convert camelCase to readable format
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'Data Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: HeaderConfiguration) => (
        <Tag color="blue" style={{ fontWeight: 500 }}>
          {getTypeDisplayName(type)}
        </Tag>
      )
    },
    {
      title: 'Records',
      dataIndex: 'data',
      key: 'records',
      render: (data: { [key: string]: string }[]) => (
        <span style={{ fontWeight: 500, color: '#10B981' }}>
          {data.length} records
        </span>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any, index: number) => (
        <Button 
          type="text" 
          danger 
          onClick={() => handleRemoveFile(index)}
          size="small"
        >
          Remove
        </Button>
      )
    }
  ];

  const getPreviewColumns = (type: string) => {
    if (!editingData[type] || editingData[type].length === 0) return [];
    
    const sampleRow = editingData[type][0];
    const baseColumns = [
      {
        title: (
          <div className={styles.tableHeader}>
            <Switch
              size="small"
              checked={selectedRows[type]?.length === editingData[type]?.length}
              onChange={(checked) => handleSelectAllRows(type, checked)}
            />
            Select
          </div>
        ),
        key: 'select',
        width: 100,
        render: (_: any, record: any, index: number) => (
          <Switch
            size="small"
            checked={selectedRows[type]?.includes(index) || false}
            onChange={(checked) => handleSelectRow(type, index, checked)}
          />
        )
      }
    ];

    const dataColumns = Object.keys(sampleRow).map(field => ({
      title: (
        <Tooltip title={`Field: ${field}`}>
          <span>{getFieldDisplayName(field)}</span>
        </Tooltip>
      ),
      dataIndex: field,
      key: field,
      width: 150,
      render: (value: string, record: any, index: number) => (
        <Input
          size="small"
          value={value}
          onChange={(e) => handleEditRow(type, index, field, e.target.value)}
          className={styles.tableCell}
        />
      )
    }));

    const actionColumn = {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: any, index: number) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRow(type, index)}
          className={styles.tableActionButton}
        />
      )
    };

    return [...baseColumns, ...dataColumns, actionColumn];
  };

  const steps = [
    {
      title: 'Upload Files',
      description: 'Upload Excel files to import',
      icon: currentStep === 0 ? <LoadingOutlined /> : <UploadOutlined />
    },
    {
      title: 'Preview & Edit',
      description: 'Review and edit data before import',
      icon: currentStep === 1 ? <LoadingOutlined /> : <EyeOutlined />
    },
    {
      title: 'Import Complete',
      description: 'Data imported successfully',
      icon: <CheckCircleOutlined />
    }
  ];

  return (
    <div className={styles.bulkImportContainer}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={styles.bulkImportModal}
      >
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>
            Bulk Data Import
          </h2>
          <p className={styles.headerSubtitle}>
            Upload multiple Excel files to import different data types at once
          </p>
        </div>

        <div className={styles.stepsContainer}>
          <Steps current={currentStep}>
            {steps.map((step, index) => (
              <Step key={index} title={step.title} description={step.description} icon={step.icon} />
            ))}
          </Steps>
        </div>

        {currentStep === 0 && (
          <div>
            <Card title="Upload Excel Files" className={styles.uploadCard}>
              <Dragger
                name="file"
                accept=".xlsx,.xls"
                beforeUpload={handleFileUpload}
                showUploadList={false}
                disabled={isProcessing}
                multiple
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={styles.uploadZone}
                >
                  <FileExcelOutlined className={styles.uploadIcon} />
                  <p className={styles.uploadTitle}>
                    {isProcessing ? 'Processing...' : 'Click or drag Excel files here'}
                  </p>
                  <p className={styles.uploadSubtitle}>
                    Support for .xlsx and .xls files. Multiple files can be uploaded.
                  </p>
                </motion.div>
              </Dragger>

              <div className={styles.supportedTypesContainer}>
                <h4 className={styles.supportedTypesTitle}>Supported Data Types:</h4>
                <Space wrap>
                  {supportedTypes.map((type, index) => (
                    <Tag key={index} color="blue" style={{ padding: '4px 8px' }}>
                      {getTypeDisplayName(type)}
                    </Tag>
                  ))}
                </Space>
              </div>
            </Card>

            {uploadedFiles.length > 0 && (
              <div className={styles.fileListContainer}>
                <h4 className={styles.fileListTitle}>Uploaded Files:</h4>
                <Table
                  columns={columns}
                  dataSource={uploadedFiles}
                  rowKey={(record, index) => index?.toString() || '0'}
                  pagination={false}
                  size="small"
                />
                <div className={styles.fileListActions}>
                  <Button onClick={() => setUploadedFiles([])}>
                    Clear All
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<EyeOutlined />}
                    onClick={handlePreviewData}
                    disabled={uploadedFiles.length === 0}
                  >
                    Preview & Edit Data
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && showPreview && (
          <div>
            <Card 
              title={
                <div className={styles.previewHeader}>
                  <EyeOutlined className={styles.previewIcon} />
                  <span className={styles.previewTitle}>Preview & Edit Import Data</span>
                  <Tooltip title="You can edit individual cells, delete rows, or select multiple rows for bulk deletion">
                    <InfoCircleOutlined className={styles.previewInfoIcon} />
                  </Tooltip>
                </div>
              } 
              className={styles.previewCard}
              extra={
                <div className={styles.previewExtra}>
                  {Object.keys(selectedRows).map(type => 
                    selectedRows[type]?.length > 0 && (
                      <Button
                        key={type}
                        danger
                        size="small"
                        onClick={() => handleDeleteSelectedRows(type)}
                        className={styles.deleteSelectedButton}
                      >
                        Delete {selectedRows[type].length} Selected
                      </Button>
                    )
                  )}
                </div>
              }
            >
              <Tabs defaultActiveKey={Object.keys(editingData)[0]}>
                {Object.entries(editingData).map(([type, data]) => (
                  <TabPane 
                    tab={
                      <span className={styles.tabLabel}>
                        {getTypeDisplayName(type as HeaderConfiguration)}
                        <Tag color="blue" className={styles.tabCount}>
                          {data.length} records
                        </Tag>
                      </span>
                    } 
                    key={type}
                  >
                    <div className={styles.previewContent}>
                      <div className={styles.previewContentHeader}>
                        <h4 className={styles.previewContentTitle}>
                          {getTypeDisplayName(type as HeaderConfiguration)} Data
                        </h4>
                        <span className={styles.previewContentCount}>
                          {data.length} records ready for import
                        </span>
                      </div>
                      <p className={styles.previewContentDescription}>
                        Click on any cell to edit the value. Use the switches to select rows for bulk deletion.
                      </p>
                    </div>
                    
                    <div className={styles.previewTable}>
                      <Table
                        columns={getPreviewColumns(type)}
                        dataSource={data.map((row, index) => ({ ...row, key: index }))}
                        rowKey="key"
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          showQuickJumper: true,
                          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`
                        }}
                        scroll={{ x: 'max-content', y: 400 }}
                        size="small"
                      />
                    </div>
                  </TabPane>
                ))}
              </Tabs>

              <div className={styles.summaryContainer}>
                <h4 className={styles.summaryTitle}>Import Summary:</h4>
                <ul className={styles.summaryList}>
                  {Object.entries(editingData).map(([type, data]) => (
                    <li key={type}>
                      <strong>{getTypeDisplayName(type as HeaderConfiguration)}:</strong> {data.length} records
                    </li>
                  ))}
                </ul>
                <div className={styles.summaryNote}>
                  <p className={styles.summaryNoteText}>
                    <strong>Note:</strong> This is a preview. No data has been imported yet. 
                    Review and edit the data above, then click "Import All Data" to proceed.
                  </p>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <Button onClick={() => setCurrentStep(0)}>
                  Back to Upload
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleImportAll}
                  disabled={Object.values(editingData).every(data => data.length === 0)}
                >
                  Import All Data
                </Button>
              </div>
            </Card>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <Card title="Import Complete" className={styles.completeCard}>
              <div className={styles.completeContent}>
                <CheckCircleOutlined className={styles.completeIcon} />
                <h3 className={styles.completeTitle}>Import Successful!</h3>
                <p className={styles.completeSubtitle}>
                  All data has been processed and is ready for backend import.
                </p>
                
                <div className={styles.completeSummary}>
                  <h4 className={styles.completeSummaryTitle}>Processed Data:</h4>
                  {Object.entries(processedData).map(([type, data]) => (
                    <div key={type} style={{ marginBottom: 8 }}>
                      <strong>{getTypeDisplayName(type as HeaderConfiguration)}:</strong> {data.length} records
                    </div>
                  ))}
                </div>

                <div className={styles.completeBackendNote}>
                  <h4 className={styles.completeBackendNoteTitle}>Backend Integration Note:</h4>
                  <p className={styles.completeBackendNoteText}>
                    The bulk import API is not yet implemented in the backend. 
                    This preview shows exactly what data would be sent to the backend when the API is ready.
                  </p>
                </div>

                <div className={styles.completeActions}>
                  <Button type="primary" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BulkDataImport; 