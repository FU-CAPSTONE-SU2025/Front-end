import React, { useState } from 'react';
import { Card, Steps, Button, Upload, message, Table, Tag, Input, Tooltip, Spin } from 'antd';
import { UploadOutlined, FileExcelOutlined, CheckCircleOutlined, LoadingOutlined, EyeOutlined, CloudUploadOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { getHeaderConfig, HeaderConfiguration, matchesConfiguration, findFieldMapping } from '../../config/importConfig';
import { transformBulkImportData, createPreviewData } from '../../utils/bulkImportTransformers';
import styles from '../../css/bulkImport.module.css';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';

const { Dragger } = Upload;
const { Step } = Steps;

interface ProcessedData {
  type: HeaderConfiguration;
  data: { [key: string]: string }[];
  fileName: string;
  originalHeaders: string[];
}

interface BulkDataImportProps {
  onClose: () => void;
  onDataImported: (importedData: { [type: string]: any[] }) => void;
  supportedTypes?: HeaderConfiguration[];
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'error';
  uploadMessage?: string;
}

const BulkDataImport: React.FC<BulkDataImportProps> = ({
  onClose,
  onDataImported,
  supportedTypes = ['STUDENT', 'STAFF', 'SUBJECT', 'PROGRAM', 'COMBO', 'CURRICULUM'],
  uploadStatus = 'idle',
  uploadMessage
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [editableData, setEditableData] = useState<{ [key: string]: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { handleError } = useApiErrorHandler();

  // React to upload status changes from parent
  React.useEffect(() => {
    if (uploadStatus === 'success') {
      setCurrentStep(2); // Move to completion step
      setIsUploading(false);
    } else if (uploadStatus === 'error') {
      setIsUploading(false);
      // Stay on step 1 for retry
    } else if (uploadStatus === 'uploading') {
      setIsUploading(true);
    } else {
      setIsUploading(false);
    }
  }, [uploadStatus]);

  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        
        // Enhanced error handling for xlsx 0.20.3 compatibility
        let workbook;
        try {
          workbook = XLSX.read(data, { type: 'array' });
        } catch (xlsxError) {
          console.error('XLSX parsing error:', xlsxError);
          handleError(xlsxError, 'XLSX parsing error');
          setIsProcessing(false);
          return;
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
          message.error('No worksheet found in the Excel file.');
          setIsProcessing(false);
          return;
        }
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        if (!jsonData || jsonData.length < 2) {
          message.error('File must contain headers and at least one data row.');
          setIsProcessing(false);
          return;
        }

        const headers = jsonData[0] as string[];
        
        // Try to identify the data type based on headers using flexible matching
        let identifiedType: HeaderConfiguration | null = null;
        let matchScore = 0;
        
        for (const type of supportedTypes) {
          if (typeof type === 'string') {
            const config = getHeaderConfig(type);
            
            // Use flexible header matching
            if (matchesConfiguration(headers, config.headers)) {
              // Calculate match score based on how many headers match
              const currentMatchScore = config.headers.filter(configHeader => 
                headers.some(excelHeader => findFieldMapping(excelHeader, config.fieldMap))
              ).length;
              
              // Choose the configuration with the highest match score
              if (currentMatchScore > matchScore) {
                identifiedType = type;
                matchScore = currentMatchScore;
              }
            }
          }
        }

        if (!identifiedType) {
          const expectedHeaders = supportedTypes.map(type => {
            if (typeof type === 'string') {
              const config = getHeaderConfig(type);
              return `${type}: ${config.headers.join(', ')}`;
            }
            return '';
          }).filter(Boolean);

          message.error(`Could not identify data type. Please check your file headers.
            
${supportedTypes.length === 1 ? 
  `This page only supports ${supportedTypes[0]} data. Expected headers: ${expectedHeaders[0]}` :
  `Expected headers for supported types:\n${expectedHeaders.join('\n')}`
}`);
          setIsProcessing(false);
          return;
        }

        // Enhanced role-specific validation
        if (supportedTypes.length === 1 && typeof supportedTypes[0] === 'string') {
          const expectedType = supportedTypes[0];
          if (identifiedType !== expectedType) {
            message.error(`This page only supports importing ${expectedType} data. 
            
Your file appears to contain ${identifiedType} data with headers: ${headers.join(', ')}
            
Please use the correct file format for ${expectedType} import or go to the appropriate admin page.`);
            setIsProcessing(false);
            return;
          }
        }

        // Process the data using flexible field mapping
        const config = getHeaderConfig(identifiedType);
        const processedRows: { [key: string]: string }[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const processedRow: { [key: string]: string } = {};
          let hasValidData = false;

          headers.forEach((header, index) => {
            const fieldKey = findFieldMapping(header, config.fieldMap);
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

        // Transform data to proper nested structure for account types
        let transformedData: any = processedRows;
        if (typeof identifiedType === 'string' && ['STUDENT', 'STAFF', 'MANAGER', 'ADVISOR', 'ADMIN'].includes(identifiedType)) {
          transformedData = transformBulkImportData(processedRows, identifiedType);
        }

        const processed: ProcessedData = {
          type: identifiedType,
          data: transformedData,
          fileName: file.name,
          originalHeaders: headers
        };

        setProcessedData(processed);
        
        // Create preview data for display
        let previewData: any = processedRows;
        if (typeof identifiedType === 'string' && ['STUDENT', 'STAFF', 'MANAGER', 'ADVISOR', 'ADMIN'].includes(identifiedType)) {
          previewData = createPreviewData(transformedData, identifiedType);
        }
        
        setEditableData([...previewData]); // Create editable copy
        message.success(`Successfully processed ${file.name} - ${processedRows.length} records identified as ${getTypeDisplayName(identifiedType)} data`);
        setIsProcessing(false);
        setCurrentStep(1); // Move to preview step
      } catch (error) {
        console.error('File processing error:', error);
        handleError(error, 'Error processing file');
      }
    };

    reader.readAsArrayBuffer(file);
    return false; // Prevent default upload behavior
  };

  const handleEditCell = (rowIndex: number, field: string, value: string) => {
    setEditableData(prev => 
      prev.map((row, index) => 
        index === rowIndex ? { ...row, [field]: value } : row
      )
    );
  };

  const handleDeleteRow = (rowIndex: number) => {
    setEditableData(prev => prev.filter((_, index) => index !== rowIndex));
  };

  const handleUploadToServer = () => {
    if (!processedData) return;
    
    // Prepare data for upload
    const dataType = processedData.type as string;
    
    // For account types, we need to transform the edited preview data back to the proper structure
    let uploadData;
    if (['STUDENT', 'STAFF', 'MANAGER', 'ADVISOR', 'ADMIN'].includes(dataType)) {
      const transformedData = transformBulkImportData(editableData, dataType);
      uploadData = {
        [dataType]: transformedData
      };
    } else {
      uploadData = {
        [dataType]: editableData
      };
    }
    
    // Call the parent's onDataImported function
    // The parent will handle the async mutation and update uploadStatus accordingly
    onDataImported(uploadData);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setProcessedData(null);
    setEditableData([]);
    setIsProcessing(false);
    setIsUploading(false);
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

  const getPreviewColumns = () => {
    if (!editableData || editableData.length === 0) return [];
    
    const sampleRow = editableData[0];
    
    const dataColumns = Object.keys(sampleRow).map(field => ({
      title: (
        <Tooltip title={`Field: ${field}`}>
          <span>{getFieldDisplayName(field)}</span>
        </Tooltip>
      ),
      dataIndex: field,
      key: field,
      width: 200,
      render: (value: string, _record: any, index: number) => (
        <Input
          size="small"
          value={value || ''}
          onChange={(e) => handleEditCell(index, field, e.target.value)}
          className={styles.tableCell}
        />
      )
    }));

    const actionColumn = {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, _record: any, index: number) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRow(index)}
          className={styles.tableActionButton}
        />
      )
    };

    return [...dataColumns, actionColumn];
  };

  const steps = [
    {
      title: 'Upload File',
      description: 'Select and upload Excel file',
      icon: currentStep === 0 && isProcessing ? <LoadingOutlined /> : <UploadOutlined />
    },
    {
      title: 'Preview & Edit',
      description: 'Review and edit data',
      icon: currentStep === 1 ? <EyeOutlined /> : <EyeOutlined />
    },
    {
      title: 'Upload to Server',
      description: 'Save data to database',
      icon: currentStep === 2 ? <CheckCircleOutlined /> : <CloudUploadOutlined />
    }
  ];

  // Get the expected headers for the supported type
  const getExpectedHeaders = () => {
    if (supportedTypes.length === 1) {
      const config = getHeaderConfig(supportedTypes[0]);
      return config.headers;
    }
    return ['Please check documentation for expected headers'];
  };

  const getSupportedTypeDisplay = () => {
    if (supportedTypes.length === 1) {
      return getTypeDisplayName(supportedTypes[0]);
    }
    return supportedTypes.map(type => getTypeDisplayName(type)).join(', ');
  };

  return (
    <div className={styles.bulkImportContainer} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={styles.bulkImportModal}
      >
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Bulk Data Import</h2>
          <p className={styles.headerSubtitle}>
            {supportedTypes.length === 1 ? 
              `Upload Excel file to import ${getSupportedTypeDisplay()} data only` :
              `Upload Excel file to import ${getSupportedTypeDisplay()} data`
            }
          </p>
        </div>

        <div className={styles.stepsContainer}>
          <Steps current={currentStep} responsive={false}>
            {steps.map((step, index) => (
              <Step key={index} title={step.title} description={step.description} icon={step.icon} />
            ))}
          </Steps>
        </div>

        {/* Step 1: Upload File */}
        {currentStep === 0 && (
          <Card title="Upload Excel File" className={styles.uploadCard}>
            <Dragger
              name="file"
              accept=".xlsx,.xls"
              beforeUpload={handleFileUpload}
              showUploadList={false}
              disabled={isProcessing}
              maxCount={1}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={styles.uploadZone}
              >
                {isProcessing ? (
                  <Spin size="large" />
                ) : (
                  <>
                    <FileExcelOutlined className={styles.uploadIcon} />
                    <p className={styles.uploadTitle}>Click or drag Excel file here</p>
                    <p className={styles.uploadSubtitle}>
                      {supportedTypes.length === 1 ? 
                        `Upload a single Excel file (.xlsx, .xls) with ${getSupportedTypeDisplay()} data only` :
                        `Upload a single Excel file (.xlsx, .xls) with ${getSupportedTypeDisplay()} data`
                      }
                    </p>
                  </>
                )}
              </motion.div>
            </Dragger>

            <div className={styles.expectedHeadersContainer}>
              <h4 className={styles.expectedHeadersTitle}>
                Expected Headers for {getSupportedTypeDisplay()}:
              </h4>
              <Tag color="blue" className={styles.expectedHeadersTag}>
                {getExpectedHeaders().join(', ')}
              </Tag>
            </div>
          </Card>
        )}

        {/* Step 2: Preview & Edit */}
        {currentStep === 1 && processedData && (
          <Card 
            title={
              <div className={styles.previewHeader}>
                <EyeOutlined className={styles.previewIcon} />
                <span className={styles.previewTitle}>
                  Preview {getTypeDisplayName(processedData.type)} Data
                </span>
                <Tag color="blue">{editableData.length} records</Tag>
              </div>
            } 
            className={styles.previewCard}
          >
            <div className={styles.previewContent}>
              <p className={styles.previewDescription}>
                <InfoCircleOutlined className={styles.previewDescriptionIcon} />
                Review your data below. You can edit any cell by clicking on it or delete entire rows.
              </p>
            </div>
            
            <div className={styles.previewTable}>
              <Table
                columns={getPreviewColumns()}
                dataSource={editableData.map((row, index) => ({ ...row, key: index }))}
                rowKey="key"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`
                }}
                scroll={{ x: 'max-content', y: 400 }}
                size="small"
                className={styles.bulkImportTable}
               
              />
            </div>
                <div className={styles.actionButtons}>
                <Button
                 onClick={handleReset}
                 type="link" 
                 >
                  Start Over
                </Button>
              <Button 
                type="primary" 
                icon={<CloudUploadOutlined />}
                onClick={handleUploadToServer}
                loading={isUploading}
                disabled={editableData.length === 0}
              >
                Upload to Server ({editableData.length} records)
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Success */}
        {currentStep === 2 && (
          <Card className={styles.successCard}>
            <div className={styles.successContent}>
              <CheckCircleOutlined className={styles.successIcon} />
              <h3 className={styles.successTitle}>Import Successful!</h3>
              <p className={styles.successSubtitle}>
                Successfully imported {editableData.length} {getTypeDisplayName(processedData?.type || supportedTypes[0])} records
              </p>
              <div className={styles.actionButtons}>
                <Button onClick={handleReset} type="default">
                  Import Another File
                </Button>
                <Button onClick={onClose} type="primary">
                  Close
                </Button>
              </div>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default BulkDataImport; 