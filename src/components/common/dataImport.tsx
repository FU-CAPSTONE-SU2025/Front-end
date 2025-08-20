import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Table, Input, Switch, Tooltip, message, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import styles from '../../css/admin/dataImport.module.css';
import { 
  HeaderConfiguration, 
  getHeaderConfig 
} from '../../config/importConfig';
import { transformBulkImportData, createPreviewData } from '../../utils/bulkImportTransformers';

type DataImportProps = {
  onClose: () => void;
  onDataImported: (data: any[]) => void;
  headerConfig: HeaderConfiguration;
  allowMultipleRows?: boolean; // New prop to control single vs multiple row import
  dataType?: string; // Optional data type for better error messages
  roleType?: string; // Role type for proper data transformation
};

const DataImport: React.FC<DataImportProps> = ({ 
  onClose, 
  onDataImported, 
  headerConfig, 
  allowMultipleRows = false,
  dataType = 'data',
  roleType = 'STUDENT'
}) => {
  const [dragging, setDragging] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<{ [key: string]: string }[]>([]);
  const [editingData, setEditingData] = useState<{ [key: string]: string }[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [transformedData, setTransformedData] = useState<any[]>([]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    setError(null);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.xlsx')) {
      setFile(droppedFile);
    } else {
      setError('Please drop a valid .xlsx file.');
    }
  };

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          
          // Enhanced error handling for xlsx 0.20.3 compatibility
          let workbook;
          try {
            workbook = XLSX.read(data, { type: 'binary' });
          } catch (xlsxError) {
            console.error('XLSX parsing error:', xlsxError);
            setError('Error reading Excel file. The file format may not be supported or the file may be corrupted.');
            return;
          }
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          if (!worksheet) {
            setError('No worksheet found in the Excel file.');
            return;
          }
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

          // Validation logic
          if (!jsonData || jsonData.length === 0) {
            setError('The Excel file is empty.');
            return;
          }

          const config = getHeaderConfig(headerConfig);
          const headers = jsonData[0] as string[];
          const expectedHeaders = config.headers;
          
          // Check for missing headers
          const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
          if (missingHeaders.length > 0) {
            setError(`Missing required headers for ${dataType}: ${missingHeaders.join(', ')}.`);
            return;
          }

          const rows = jsonData.slice(1);
          if (rows.length === 0) {
            setError('No data rows found after headers.');
            return;
          }

          // Process data rows
          const processedData: { [key: string]: string }[] = [];
          const rowsToProcess = allowMultipleRows ? rows : [rows[0]];

          rowsToProcess.forEach((rowData, rowIndex) => {
            const mappedData: { [key: string]: string } = {};
            let hasValidData = false;

            headers.forEach((header, index) => {
              const fieldKey = config.fieldMap[header];
              if (fieldKey && rowData[index] !== undefined && rowData[index] !== null && rowData[index] !== '') {
                mappedData[fieldKey] = String(rowData[index]).trim();
                hasValidData = true;
              }
            });

            // Only add row if it has at least one valid field
            if (hasValidData) {
              processedData.push(mappedData);
            }
          });

          if (processedData.length === 0) {
            setError('No valid data found in the Excel file.');
            return;
          }

          // Transform data to proper nested structure
          const transformed = transformBulkImportData(processedData, roleType);
          setTransformedData(transformed);

          // Create preview data for display
          const preview = createPreviewData(transformed, roleType);
          setPreviewData(preview);
          setEditingData(JSON.parse(JSON.stringify(preview))); // Deep copy for editing
          setShowPreview(true);
        } catch (error) {
          console.error('File processing error:', error);
          setError('Error processing Excel file. Please check the file format and try again.');
        }
      };
      reader.readAsBinaryString(file);
    }
  }, [file, headerConfig, allowMultipleRows, dataType]);

  const handleEditRow = (rowIndex: number, field: string, value: string) => {
    setEditingData(prev => 
      prev.map((row, index) => 
        index === rowIndex ? { ...row, [field]: value } : row
      )
    );
  };

  const handleDeleteRow = (rowIndex: number) => {
    setEditingData(prev => prev.filter((_, index) => index !== rowIndex));
  };

  const handleSelectRow = (rowIndex: number, selected: boolean) => {
    setSelectedRows(prev => 
      selected 
        ? [...prev, rowIndex]
        : prev.filter(index => index !== rowIndex)
    );
  };

  const handleSelectAllRows = (selected: boolean) => {
    setSelectedRows(selected ? editingData.map((_, index) => index) : []);
  };

  const handleDeleteSelectedRows = () => {
    setEditingData(prev => prev.filter((_, index) => !selectedRows.includes(index)));
    setSelectedRows([]);
  };

  const handleImportData = () => {
    // Update the transformed data with any edits made in the preview
    const updatedTransformed = transformBulkImportData(editingData, roleType);
    setTransformedData(updatedTransformed);
    
    // Pass the transformed data to the parent component
    onDataImported(updatedTransformed);
    onClose();
  };

  const getFieldDisplayName = (field: string): string => {
    // Convert camelCase to readable format
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const getPreviewColumns = () => {
    if (!editingData.length) return [];
    
    const sampleRow = editingData[0];
    const baseColumns = [
      {
        title: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Switch
              size="small"
              checked={selectedRows.length === editingData.length}
              onChange={handleSelectAllRows}
            />
            Select
          </div>
        ),
        key: 'select',
        width: 80,
        render: (_: any, record: any, index: number) => (
          <Switch
            size="small"
            checked={selectedRows.includes(index)}
            onChange={(checked) => handleSelectRow(index, checked)}
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
          onChange={(e) => handleEditRow(index, field, e.target.value)}
          style={{ fontSize: '12px' }}
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
          onClick={() => handleDeleteRow(index)}
        />
      )
    };

    return [...baseColumns, ...dataColumns, actionColumn];
  };

  const dropZoneVariants = {
    hidden: { scale: 0.8, y: -50 },
    visible: { scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const config = getHeaderConfig(headerConfig);
  const expectedHeadersText = config.headers.join(', ');

  if (showPreview) {
    return (
      <div className={styles.dataImportContainer}>
        <motion.div
          className={styles.dropZone}
          variants={dropZoneVariants}
          initial="hidden"
          animate="visible"
          style={{ maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto' }}
        >
          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <EyeOutlined style={{ color: '#1E40AF', fontSize: 24 }} />
              <h2 style={{ margin: 0, color: '#1E40AF', fontWeight: 600 }}>
                Preview & Edit {dataType.charAt(0).toUpperCase() + dataType.slice(1)} Data
              </h2>
              <Tooltip title="You can edit individual cells, delete rows, or select multiple rows for bulk deletion">
                <InfoCircleOutlined style={{ color: '#6B7280', fontSize: 16 }} />
              </Tooltip>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h4 style={{ margin: 0 }}>
                  {editingData.length} records ready for import
                </h4>
                {selectedRows.length > 0 && (
                  <Button
                    danger
                    size="small"
                    onClick={handleDeleteSelectedRows}
                  >
                    Delete {selectedRows.length} Selected
                  </Button>
                )}
              </div>
              <p style={{ margin: 0, color: '#6B7280', fontSize: 12 }}>
                Click on any cell to edit the value. Use the switches to select rows for bulk deletion.
              </p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Table
                columns={getPreviewColumns()}
                dataSource={editingData.map((row, index) => ({ ...row, key: index }))}
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

            <div style={{ padding: 16, backgroundColor: '#F3F4F6', borderRadius: 8, marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>Import Summary:</h4>
              <p style={{ margin: 0, fontSize: 14 }}>
                <strong>{editingData.length}</strong> {dataType} records will be imported
              </p>
              <div style={{ marginTop: 12, padding: 12, backgroundColor: '#E5E7EB', borderRadius: 6 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#374151' }}>
                  <strong>Note:</strong> This is a preview. No data has been imported yet. 
                  Review and edit the data above, then click "Import Data" to proceed.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowPreview(false)}>
                Back to Upload
              </Button>
              <Button 
                type="primary" 
                onClick={handleImportData}
                disabled={editingData.length === 0}
              >
                Import {editingData.length} Records
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.dataImportContainer}>
      <motion.div
        className={`${styles.dropZone} ${dragging ? styles.dragging : ''}`}
        variants={dropZoneVariants}
        initial="hidden"
        animate="visible"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <>
            <div className={styles.dropText}>
              Drag and drop your {dataType} XLSX file here!
            </div>
            <div className={styles.expectedHeaders}>
              <strong>Expected headers:</strong><br />
              {expectedHeadersText}
            </div>
          </>
        )}
        <svg className={styles.dropIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14m0-14l-6 6m6-6l6 6" />
        </svg>
        <div className={styles.buttonContainer}>
          <div className={styles.cancelButton} onClick={onClose}>
            <div className={styles.buttonContent}>Cancel</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DataImport;
